'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function AffiliateDashboard() {
  const [affiliate, setAffiliate] = useState<any>(null)
  const [referrals, setReferrals] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    // In production, use auth to get current user. For now, demo fetch by email or code.
    // Replace with real auth later.
    async function load() {
      // Placeholder: load first affiliate for demo
      const { data } = await supabase.from('affiliates').select('*').limit(1).single()
      if (data) {
        setAffiliate(data)
        const { data: refs } = await supabase
          .from('car_owners')
          .select('*')
          .eq('affiliate_id', data.id)
        setReferrals(refs || [])
      }
    }
    load()
  }, [])

  const referralLink = affiliate ? `https://luxy.ng/onboard?ref=${affiliate.referral_code}` : ''

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-2">Affiliate Dashboard</h1>
        <p className="text-slate-500 mb-8">Track your referrals and commissions</p>

        {affiliate && (
          <div className="bg-white rounded-2xl border p-6 mb-6 flex justify-between items-center">
            <div>
              <div className="text-sm text-slate-500">Your Referral Link</div>
              <div className="font-mono text-emerald-700">{referralLink}</div>
            </div>
            <button onClick={() => navigator.clipboard.writeText(referralLink)} className="bg-emerald-600 text-white px-6 py-2 rounded-xl">
              Copy
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border p-6">
            <div className="text-sm text-slate-500">Total Referrals</div>
            <div className="text-4xl font-bold">{referrals.length}</div>
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <div className="text-sm text-slate-500">Successful Registrations</div>
            <div className="text-4xl font-bold">{referrals.filter(r => r.payment_status === 'paid').length}</div>
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <div className="text-sm text-slate-500">Total Commissions Earned</div>
            <div className="text-4xl font-bold">₦{referrals.filter(r => r.payment_status === 'paid').length * 25000}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-6 border-b font-bold text-xl">Your Referrals</div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-4">Name</th>
                <th className="text-left px-6 py-4">Phone</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Commission</th>
                <th className="text-left px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map(ref => (
                <tr key={ref.id} className="border-t">
                  <td className="px-6 py-4">{ref.full_name}</td>
                  <td className="px-6 py-4">{ref.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${ref.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {ref.payment_status === 'paid' ? 'Successful' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{ref.payment_status === 'paid' ? '₦25,000' : '—'}</td>
                  <td className="px-6 py-4">{new Date(ref.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
