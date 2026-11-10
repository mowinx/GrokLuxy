'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    SelfanyCheckout?: { open: (options: { checkoutUrl: string }) => void }
  }
}

function OnboardContent() {
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref')
  const [cars, setCars] = useState([{ make: '', model: '', year: '', color: '' }])
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', whatsapp: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://selfany.com/embed/js'
    script.async = true
    document.body.appendChild(script)

    const handleMessage = (event: MessageEvent) => {
      if (event.data.action === 'reloadParent' && ownerId) {
        supabase.from('car_owners').update({
          payment_status: 'paid',
          onboarding_status: 'paid',
          completed_at: new Date().toISOString()
        }).eq('id', ownerId)
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

    const { data: owner, error } = await supabase.from('car_owners').insert({
      ...form,
      affiliate_id,
      referral_code: refCode,
      payment_status: 'unpaid'
    }).select().single()

    if (error || !owner) {
      setMessage('Error: ' + (error?.message || 'Failed to save'))
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

    if (carInserts.length) await supabase.from('cars').insert(carInserts)

    setMessage('Details saved. Complete payment to finish.')
    setLoading(false)
  }

  function openPayment() {
    if (window.SelfanyCheckout) {
      window.SelfanyCheckout.open({ checkoutUrl: 'https://selfany.com/checkout/Wlpbx6vfpJoJ44Xo' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-emerald-600 text-white text-center py-3 text-sm font-medium">
        LUXY GOES LIVE IN NIGERIA ON DECEMBER 7TH. Onboard now and be first in line when we sound the bell.
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Your Car Is About to Meet 3,000+ High-Paying Diaspora Customers.<br />
          <span className="text-emerald-600">Set Your Price. Keep 100%.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-3xl mx-auto">
          Luxy is coming to Nigeria on December 7th, and we're bringing a marketplace of over 3,000 diaspora clients who want the best experience at home. Register your car today, set your own daily fare, and be live and ready when the festive rush begins.
        </p>
      </div>

      <section id="register" className="py-12 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-3xl border p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">List Your Car on Luxy & Join the Waitlist</h2>
              {refCode && <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full">Referred by Affiliate</span>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="font-bold mb-4">1. Your Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="Full Name" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="border rounded-xl px-4 py-3" required />
                  <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="border rounded-xl px-4 py-3" required />
                  <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="border rounded-xl px-4 py-3" required />
                  <input placeholder="WhatsApp Number" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="border rounded-xl px-4 py-3" required />
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-4">2. List Your Cars</h3>
                {cars.map((car, i) => (
                  <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <input placeholder="Make" value={car.make} onChange={e => { const n = [...cars]; n[i].make = e.target.value; setCars(n) }} className="border rounded-lg px-3 py-2" required={i === 0} />
                    <input placeholder="Model" value={car.model} onChange={e => { const n = [...cars]; n[i].model = e.target.value; setCars(n) }} className="border rounded-lg px-3 py-2" required={i === 0} />
                    <input placeholder="Year" value={car.year} onChange={e => { const n = [...cars]; n[i].year = e.target.value; setCars(n) }} className="border rounded-lg px-3 py-2" />
                    <input placeholder="Color" value={car.color} onChange={e => { const n = [...cars]; n[i].color = e.target.value; setCars(n) }} className="border rounded-lg px-3 py-2" />
                  </div>
                ))}
                <button type="button" onClick={addCar} className="text-emerald-600 font-medium">+ Add Another Car</button>
              </div>

              <div className="border rounded-2xl p-5 bg-slate-50 flex justify-between">
                <div>
                  <div className="font-bold">Onboarding Fee</div>
                  <div className="text-sm text-slate-500">One-time fee to join the waitlist</div>
                </div>
                <div className="text-2xl font-bold">₦50,000</div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-slate-800 text-white py-4 rounded-xl font-semibold">
                {loading ? 'Saving...' : 'Save Details & Continue to Payment'}
              </button>

              {ownerId && (
                <button type="button" onClick={openPayment} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold">
                  Pay ₦50,000 with Selfany
                </button>
              )}

              {message && <p className="text-center text-sm">{message}</p>}
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function OnboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OnboardContent />
    </Suspense>
  )
}
