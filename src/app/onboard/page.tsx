'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    SelfanyCheckout?: {
      open: (options: { checkoutUrl: string }) => void
    }
  }
}

export default function OnboardPage() {
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref')
  const [cars, setCars] = useState([{ make: '', model: '', year: '', color: '' }])
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', whatsapp: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Load Selfany script
    const script = document.createElement('script')
    script.src = 'https://selfany.com/embed/js'
    script.async = true
    document.body.appendChild(script)

    // Listen for payment completion
    const handleMessage = (event: MessageEvent) => {
      if (event.data.action === 'reloadParent') {
        // Payment likely completed — update status
        if (ownerId) {
          supabase.from('car_owners').update({ 
            payment_status: 'paid',
            onboarding_status: 'paid',
            completed_at: new Date().toISOString()
          }).eq('id', ownerId).then(() => {
            setMessage('Payment successful! Your registration is complete and you are on the waitlist.')
          })
        }
        window.location.reload()
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [ownerId])

  function addCar() {
    setCars([...cars, { make: '', model: '', year: '', color: '' }])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    let affiliate_id = null
    if (refCode) {
      const { data } = await supabase.from('affiliates').select('id').eq('referral_code', refCode).single()
      affiliate_id = data?.id
    }

    const { data: owner, error: ownerError } = await supabase.from('car_owners').insert({
      ...form,
      affiliate_id,
      referral_code: refCode,
      payment_status: 'unpaid'
    }).select().single()

    if (ownerError || !owner) {
      setMessage('Error creating account: ' + ownerError?.message)
      setLoading(false)
      return
    }

    setOwnerId(owner.id)

    const carInserts = cars.filter(c => c.make && c.model).map(c => ({
      car_owner_id: owner.id,
      make: c.make,
      model: c.model,
      year: parseInt(c.year) || null,
      color: c.color
    }))

    if (carInserts.length > 0) {
      await supabase.from('cars').insert(carInserts)
    }

    setMessage('Details saved. Complete payment of ₦50,000 to finish registration.')
    setLoading(false)
  }

  function openPayment() {
    if (window.SelfanyCheckout) {
      window.SelfanyCheckout.open({ 
        checkoutUrl: 'https://selfany.com/checkout/Wlpbx6vfpJoJ44Xo' 
      })
    } else {
      alert('Payment system loading, please try again in a moment.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">List Your Car on Luxy & Join the Waitlist</h1>
          {refCode && <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full">Referred by Affiliate</span>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="font-bold text-lg mb-4">1. Your Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input placeholder="Full Name" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="border rounded-xl px-4 py-3" required />
              <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="border rounded-xl px-4 py-3" required />
              <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="border rounded-xl px-4 py-3" required />
              <input placeholder="WhatsApp Number" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="border rounded-xl px-4 py-3" required />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">2. List Your Cars (at least 1)</h3>
            {cars.map((car, i) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <input placeholder="Make" value={car.make} onChange={e => { const n = [...cars]; n[i].make = e.target.value; setCars(n) }} className="border rounded-lg px-3 py-2" required={i===0} />
                <input placeholder="Model" value={car.model} onChange={e => { const n = [...cars]; n[i].model = e.target.value; setCars(n) }} className="border rounded-lg px-3 py-2" required={i===0} />
                <input placeholder="Year" value={car.year} onChange={e => { const n = [...cars]; n[i].year = e.target.value; setCars(n) }} className="border rounded-lg px-3 py-2" />
                <input placeholder="Color" value={car.color} onChange={e => { const n = [...cars]; n[i].color = e.target.value; setCars(n) }} className="border rounded-lg px-3 py-2" />
              </div>
            ))}
            <button type="button" onClick={addCar} className="text-emerald-600 font-medium">+ Add Another Car</button>
          </div>

          <div className="border rounded-2xl p-5 bg-slate-50 flex justify-between">
            <div>
              <div className="font-bold">Luxy Owner Onboarding Fee</div>
              <div className="text-sm text-slate-500">One-time fee to join the waitlist</div>
            </div>
            <div className="text-2xl font-bold">₦50,000</div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-800 text-white py-4 rounded-xl font-semibold text-lg">
            {loading ? 'Saving...' : 'Save Details & Continue to Payment'}
          </button>

          {ownerId && (
            <button type="button" onClick={openPayment} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold text-lg">
              Pay ₦50,000 with Selfany
            </button>
          )}

          {message && <p className="text-center text-sm mt-4">{message}</p>}
          <p className="text-center text-xs text-slate-500">After payment, your onboarding will be 50% complete and you will appear on the waitlist.</p>
        </form>
      </div>
    </div>
  )
}
