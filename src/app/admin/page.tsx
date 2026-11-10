'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Successful Registrations</h1>
            <p className="text-slate-500">Car owners who completed form and paid the onboarding fee</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border p-5">
            <div className="text-sm text-slate-500">Successful Registrations</div>
            <div className="text-3xl font-bold mt-1">{registrations.length}</div>
          </div>
          <div className="bg-white rounded-2xl border p-5">
            <div className="text-sm text-slate-500">Commissions Pending</div>
            <div className="text-3xl font-bold mt-1">₦{(registrations.length * 25000).toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Phone</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Cars</th>
                  <th className="text-left px-4 py-3 font-medium">Referred By</th>
                  <th className="text-left px-4 py-3 font-medium">Payment</th>
                  <th className="text-left px-4 py-3 font-medium">Affiliate Bank</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => (
                  <tr key={reg.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{reg.full_name}</td>
                    <td className="px-4 py-3">{reg.phone}</td>
                    <td className="px-4 py-3">{reg.email}</td>
                    <td className="px-4 py-3">{reg.cars?.length || 0}</td>
                    <td className="px-4 py-3">{reg.affiliates?.full_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">Paid</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {reg.affiliates?.bank_name}<br/>{reg.affiliates?.account_number}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(reg.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      No successful registrations yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
