'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function AffiliateLanding() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    bank_name: '',
    account_number: '',
    account_name: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const referral_code = Math.random().toString(36).substring(2, 10).toUpperCase()

    const { error } = await supabase.from('affiliates').insert({
      ...form,
      referral_code
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Success! Your referral code is: ' + referral_code)
      setForm({ full_name: '', email: '', phone: '', bank_name: '', account_number: '', account_name: '' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero and content sections from previous landing page - abbreviated for structure */}
      <section className="py-20 text-center px-6">
        <h1 className="text-5xl font-bold mb-4">Refer a Car Owner Once. Get Paid Every Time Their Car Is Booked. For Life.</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
          Join the Luxy Affiliate Program and earn 50% commission when a car owner registers, then keep earning for as long as their car keeps getting bookings.
        </p>
        <a href="#signup" className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg">Become an Affiliate. It's Free →</a>
      </section>

      {/* Signup Form */}
      <section id="signup" className="py-16 bg-slate-50">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow">
          <h2 className="text-2xl font-bold mb-6 text-center">Join as Affiliate</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input placeholder="Full Name" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full border rounded-lg px-4 py-3" required />
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-lg px-4 py-3" required />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded-lg px-4 py-3" required />
            <input placeholder="Bank Name" value={form.bank_name} onChange={e => setForm({...form, bank_name: e.target.value})} className="w-full border rounded-lg px-4 py-3" required />
            <input placeholder="Account Number" value={form.account_number} onChange={e => setForm({...form, account_number: e.target.value})} className="w-full border rounded-lg px-4 py-3" required />
            <input placeholder="Account Name" value={form.account_name} onChange={e => setForm({...form, account_name: e.target.value})} className="w-full border rounded-lg px-4 py-3" required />
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold">
              {loading ? 'Creating...' : 'Become an Affiliate'}
            </button>
            {message && <p className="text-center text-sm mt-4">{message}</p>}
          </form>
        </div>
      </section>
    </div>
  )
}
