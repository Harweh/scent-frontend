'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'aura-admin-2026'
const adminHeaders = () => ({ 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET })

    function formatNaira(n) {
    return `₦${(n || 0).toLocaleString()}`
    }

    const STATUS_LABELS = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    }

    const STATUS_COLORS = {
    pending: '#F5A623',
    confirmed: '#4A90D9',
    processing: '#B8924A',
    shipped: '#6BB9E8',
    delivered: '#4CAF50',
    cancelled: '#E05656',
    }

    export default function AdminDashboardPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        apiFetch('/api/admin/stats', { headers: adminHeaders() })
        .then(d => { if (d.success) setStats(d.data); else setError(d.message || 'Failed to load stats') })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }, [])

    return (
        <main className="bg-[#100E0B] text-[#F5EFE6] min-h-screen">
        <div className="border-b border-white/10">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
            <p className="text-xs uppercase tracking-[0.25em] text-[#B8924A] mb-2">Admin</p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl mb-6">Dashboard</h1>

            <div className="flex gap-6 text-xs uppercase tracking-[0.15em]">
                <span className="text-[#B8924A] border-b-2 border-[#B8924A] pb-3">Dashboard</span>
                <Link href="/admin/orders" className="text-[#F5EFE6]/40 hover:text-[#B8924A] pb-3">Orders</Link>
                <Link href="/admin/customers" className="text-[#F5EFE6]/40 hover:text-[#B8924A] pb-3">Customers</Link>
                <Link href="/admin/fragrances" className="text-[#F5EFE6]/40 hover:text-[#B8924A] pb-3">Fragrances</Link>
            </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10">
            {loading && <p className="text-sm text-[#F5EFE6]/40">Loading stats…</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}

            {stats && (
            <>
                {/* Revenue cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="border border-white/10 p-6">
                    <p className="text-xs uppercase tracking-[0.15em] text-[#F5EFE6]/40 mb-3">Today</p>
                    <p className="font-[family-name:var(--font-display)] text-3xl text-[#B8924A]">
                    {formatNaira(stats.revenue.today)}
                    </p>
                    <p className="text-xs text-[#F5EFE6]/30 mt-2">{stats.revenue.todayOrders} order{stats.revenue.todayOrders !== 1 ? 's' : ''}</p>
                </div>
                <div className="border border-white/10 p-6">
                    <p className="text-xs uppercase tracking-[0.15em] text-[#F5EFE6]/40 mb-3">This Month</p>
                    <p className="font-[family-name:var(--font-display)] text-3xl text-[#B8924A]">
                    {formatNaira(stats.revenue.month)}
                    </p>
                    <p className="text-xs text-[#F5EFE6]/30 mt-2">{stats.revenue.monthOrders} order{stats.revenue.monthOrders !== 1 ? 's' : ''}</p>
                </div>
                <div className="border border-white/10 p-6">
                    <p className="text-xs uppercase tracking-[0.15em] text-[#F5EFE6]/40 mb-3">All Time</p>
                    <p className="font-[family-name:var(--font-display)] text-3xl text-[#B8924A]">
                    {formatNaira(stats.revenue.allTime)}
                    </p>
                    <p className="text-xs text-[#F5EFE6]/30 mt-2">{stats.revenue.allTimeOrders} order{stats.revenue.allTimeOrders !== 1 ? 's' : ''}</p>
                </div>
                </div>

                {/* Status breakdown */}
                <p className="text-xs uppercase tracking-[0.15em] text-[#F5EFE6]/40 mb-4">Orders by Status</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <div key={key} className="border border-white/10 p-5 text-center">
                    <p className="text-2xl font-[family-name:var(--font-display)]" style={{ color: STATUS_COLORS[key] }}>
                        {stats.statusCounts[key] ?? 0}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#F5EFE6]/40 mt-2">{label}</p>
                    </div>
                ))}
                </div>

                <p className="text-xs text-[#F5EFE6]/25 mt-8">
                Note: revenue totals include all non-cancelled orders (including pending cash-on-delivery payments not yet collected).
                </p>
            </>
            )}
        </div>
        </main>
    )
}