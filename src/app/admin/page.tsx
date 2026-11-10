'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('car_owners')
        .select(`
          *,
          affiliates (full_name, bank_name, account_number, account_name),
          cars (id)
        `)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })

      setRegistrations(data || [])
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-2">Successful Registrations</h1>
        <p className="text-slate-500 mb-8">Car owners who completed form and paid the onboarding fee</p>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border p-6">
            <div className="text-sm text-slate-500">Total Affiliates</div>
            <div className="text-3xl font-bold">—</div>
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <div className="text-sm text-slate-500">Successful Registrations</div>
            <div className="text-3xl font-bold">{registrations.length}</div>
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <div className="text-sm text-slate-500">Pending</div>
            <div className="text-3xl font-bold">—</div>
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <div className="text-sm text-slate-500">Commissions Pending</div>
            <div className="text-3xl font-bold">₦{registrations.length * 25000}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Cars Listed</th>
                <th className="text-left px-4 py-3">Referred By</th>
                <th className="text-left px-4 py-3">Payment Status</th>
                <th className="text-left px-4 py-3">Affiliate Bank</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(reg => (
                <tr key={reg.id} className="border-t">
                  <td className="px-4 py-3">{reg.full_name}</td>
                  <td className="px-4 py-3">{reg.phone}</td>
                  <td className="px-4 py-3">{reg.email}</td>
                  <td className="px-4 py-3">{reg.cars?.length || 0}</td>
                  <td className="px-4 py-3">{reg.affiliates?.full_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs">Paid</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {reg.affiliates?.bank_name} • {reg.affiliates?.account_number}
                  </td>
                  <td className="px-4 py-3">{new Date(reg.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
