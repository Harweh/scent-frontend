/* eslint-disable react-hooks/immutability */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

const ADMIN_SECRET  = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'aura-admin-2026'
const adminHeaders  = () => ({ 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET })
const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const statusColor = s => ({
    pending: 'text-amber-400 border-amber-500/30',
    confirmed: 'text-blue-400 border-blue-500/30',
    processing: 'text-purple-400 border-purple-500/30',
    shipped: 'text-cyan-400 border-cyan-500/30',
    delivered: 'text-emerald-400 border-emerald-500/30',
    cancelled: 'text-red-400 border-red-500/30',
    }[s] || 'text-white/50 border-white/10')

    export default function AdminOrdersPage() {
    const router = useRouter()
    const [orders,     setOrders]     = useState([])
    const [loading,    setLoading]    = useState(true)
    const [search,     setSearch]     = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [updatingId, setUpdatingId] = useState(null)

    useEffect(() => {
        if (sessionStorage.getItem('aura_admin_authed') !== 'true') {
        router.push('/admin')
        return
        }
        load()
    }, [])

    async function load() {
        setLoading(true)
        try {
        const data = await apiFetch('/api/orders', { headers: adminHeaders() })
        if (data.success) setOrders(data.data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    async function updateStatus(orderId, status) {
        setUpdatingId(orderId)
        try {
        const data = await apiFetch(`/api/orders/${orderId}`, {
            method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ status }),
        })
        if (data.success) setOrders(prev => prev.map(o => o._id === orderId ? data.data : o))
        } catch (err) { console.error(err) }
        finally { setUpdatingId(null) }
    }

    async function updatePaymentStatus(orderId, paymentStatus) {
        setUpdatingId(orderId)
        try {
        const data = await apiFetch(`/api/orders/${orderId}`, {
            method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ paymentStatus }),
        })
        if (data.success) setOrders(prev => prev.map(o => o._id === orderId ? data.data : o))
        } catch (err) { console.error(err) }
        finally { setUpdatingId(null) }
    }

    const filtered = orders.filter(o => {
        const q = search.toLowerCase()
        const matchSearch = !q ||
        o.orderId?.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.customer?.email?.toLowerCase().includes(q) ||
        o.customer?.phone?.includes(q)
        const matchStatus = statusFilter === 'all' || o.status === statusFilter
        return matchSearch && matchStatus
    })

    return (
        <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6]">
        <section className="border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                <Link href="/admin" className="text-xs text-[#F5EFE6]/30 hover:text-[#B8924A] uppercase tracking-[0.1em] transition-colors">
                    ← Dashboard
                </Link>
                <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl">All Orders</h1>
                </div>
                <p className="text-xs text-[#F5EFE6]/30 uppercase tracking-[0.1em]">{filtered.length} orders</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F5EFE6]/30" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input type="text" placeholder="Search name, email, order ID…"
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="bg-white/5 border border-white/15 pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#B8924A] w-64" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="bg-[#1C1813] border border-white/15 px-4 py-2.5 text-sm focus:outline-none focus:border-[#B8924A]">
                <option value="all">All Statuses</option>
                {ORDER_STATUSES.map(s => <option key={s} value={s} className="bg-[#1C1813]">{s}</option>)}
                </select>
            </div>
            </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 overflow-x-auto">
            {loading ? (
            <p className="text-sm text-[#F5EFE6]/30">Loading orders…</p>
            ) : filtered.length === 0 ? (
            <p className="text-sm text-[#F5EFE6]/30">No orders match your search.</p>
            ) : (
            <table className="w-full text-sm border-collapse min-w-[800px]">
                <thead>
                <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-[0.1em] text-[#F5EFE6]/30">
                    {['Order', 'Customer', 'Type', 'Total', 'Payment', 'Order Status', 'Detail'].map(h => (
                    <th key={h} className="py-3 pr-6">{h}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {filtered.map(o => (
                    <tr key={o._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="py-4 pr-6">
                        <p className="text-[#B8924A] font-medium">{o.orderId}</p>
                        <p className="text-xs text-[#F5EFE6]/30">{new Date(o.createdAt).toLocaleDateString('en-NG')}</p>
                    </td>
                    <td className="py-4 pr-6">
                        <p>{o.customer?.name}</p>
                        <p className="text-xs text-[#F5EFE6]/30">{o.customer?.phone}</p>
                        <p className="text-xs text-[#F5EFE6]/30">{o.customer?.email}</p>
                    </td>
                    <td className="py-4 pr-6">
                        <span className={`text-[9px] uppercase tracking-[0.1em] px-2 py-1 border
                        ${o.purchaseType === 'ai_match' ? 'border-purple-500/30 text-purple-400' : 'border-white/10 text-[#F5EFE6]/40'}`}>
                        {o.purchaseType === 'ai_match' ? 'AI Blend' : 'Standard'}
                        </span>
                    </td>
                    <td className="py-4 pr-6 text-[#B8924A] font-[family-name:var(--font-display)]">
                        ₦{o.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-4 pr-6">
                        <select value={o.paymentStatus}
                        disabled={updatingId === o._id}
                        onChange={e => updatePaymentStatus(o._id, e.target.value)}
                        className={`bg-[#1C1813] border border-white/15 px-2 py-1.5 text-xs focus:outline-none disabled:opacity-50
                            ${o.paymentStatus === 'paid' ? 'text-emerald-400' : o.paymentStatus === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>
                        <option value="pending" className="bg-[#1C1813] text-amber-400">Pending</option>
                        <option value="paid"    className="bg-[#1C1813] text-emerald-400">Paid</option>
                        <option value="failed"  className="bg-[#1C1813] text-red-400">Failed</option>
                        </select>
                    </td>
                    <td className="py-4 pr-6">
                        <select value={o.status}
                        disabled={updatingId === o._id}
                        onChange={e => updateStatus(o._id, e.target.value)}
                        className={`bg-[#1C1813] border border-white/15 px-2 py-1.5 text-xs focus:outline-none disabled:opacity-50 ${statusColor(o.status).split(' ')[0]}`}>
                        {ORDER_STATUSES.map(s => (
                            <option key={s} value={s} className="bg-[#1C1813] text-white">{s}</option>
                        ))}
                        </select>
                    </td>
                    <td className="py-4">
                        <Link href={`/admin/orders/${o._id}`}
                        className="text-xs text-[#F5EFE6]/30 hover:text-[#B8924A] uppercase tracking-[0.1em] transition-colors">
                        View →
                        </Link>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </div>
        </main>
    )
}