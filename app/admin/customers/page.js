'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'aura-admin-2026'
const adminHeaders = () => ({ 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET })

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    const statusColor = s => ({
    pending: 'text-amber-400 border-amber-500/30',
    confirmed: 'text-blue-400 border-blue-500/30',
    processing: 'text-purple-400 border-purple-500/30',
    shipped: 'text-cyan-400 border-cyan-500/30',
    delivered: 'text-emerald-400 border-emerald-500/30',
    cancelled: 'text-red-400 border-red-500/30',
    }[s] || 'text-white/50 border-white/10')

    export default function AdminCustomersPage() {
    const router = useRouter()
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState(null) // the chosen customer object
    const [history, setHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)

    useEffect(() => {
        if (sessionStorage.getItem('aura_admin_authed') !== 'true') {
        router.push('/admin')
        return
        }
        apiFetch('/api/admin/customers', { headers: adminHeaders() })
        .then(d => { if (d.success) setCustomers(d.data) })
        .catch(console.error)
        .finally(() => setLoading(false))
    }, [])

    async function openCustomer(c) {
        setSelected(c)
        setHistoryLoading(true)
        try {
        const params = new URLSearchParams()
        if (c.email) params.set('email', c.email)
        else if (c.phone) params.set('phone', c.phone)
        const data = await apiFetch(`/api/orders?${params.toString()}`, { headers: adminHeaders() })
        if (data.success) setHistory(data.data)
        } catch (err) { console.error(err) }
        finally { setHistoryLoading(false) }
    }

    const filtered = customers.filter(c => {
        const q = search.toLowerCase()
        return !q ||
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
    })

    // ── Customer detail view ──────────────────────────────
    if (selected) {
        return (
        <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6]">
            <section className="border-b border-white/10">
            <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
                <button onClick={() => { setSelected(null); setHistory([]) }}
                className="text-xs text-[#F5EFE6]/30 hover:text-[#B8924A] uppercase tracking-[0.1em] transition-colors mb-4">
                ← All Customers
                </button>
                <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl mb-1">{selected.name}</h1>
                <p className="text-sm text-[#F5EFE6]/40">{selected.email} {selected.email && selected.phone && '·'} {selected.phone}</p>
                {selected.address && <p className="text-xs text-[#F5EFE6]/30 mt-1">{selected.address}</p>}

                <div className="flex gap-8 mt-6">
                <div>
                    <p className="text-2xl font-[family-name:var(--font-display)] text-[#B8924A]">{selected.orderCount}</p>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#F5EFE6]/40 mt-1">Orders</p>
                </div>
                <div>
                    <p className="text-2xl font-[family-name:var(--font-display)] text-[#B8924A]">₦{selected.totalSpent?.toLocaleString()}</p>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#F5EFE6]/40 mt-1">Total Spent</p>
                </div>
                <div>
                    <p className="text-2xl font-[family-name:var(--font-display)]">{new Date(selected.lastOrderDate).toLocaleDateString('en-NG')}</p>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#F5EFE6]/40 mt-1">Last Order</p>
                </div>
                </div>
            </div>
            </section>

            <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
            <p className="text-xs uppercase tracking-[0.15em] text-[#F5EFE6]/40 mb-4">Order History</p>
            {historyLoading ? (
                <p className="text-sm text-[#F5EFE6]/30">Loading history…</p>
            ) : history.length === 0 ? (
                <p className="text-sm text-[#F5EFE6]/30">No orders found.</p>
            ) : (
                <div className="flex flex-col gap-3">
                {history.map(o => (
                    <Link key={o._id} href={`/admin/orders/${o._id}`}
                    className="flex items-center justify-between border border-white/10 p-4 hover:border-[#B8924A]/40 transition-colors">
                    <div>
                        <p className="text-[#B8924A] font-medium text-sm">{o.orderId}</p>
                        <p className="text-xs text-[#F5EFE6]/30 mt-0.5">{new Date(o.createdAt).toLocaleString('en-NG')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`text-[9px] uppercase tracking-[0.1em] px-2 py-1 border ${statusColor(o.status)}`}>
                        {o.status}
                        </span>
                        <span className="text-[#B8924A] font-[family-name:var(--font-display)]">₦{o.totalAmount?.toLocaleString()}</span>
                    </div>
                    </Link>
                ))}
                </div>
            )}
            </div>
        </main>
        )
    }

    // ── Customer list view ────────────────────────────────
    return (
        <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6]">
        <section className="border-b border-white/10">
            <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                <Link href="/admin" className="text-xs text-[#F5EFE6]/30 hover:text-[#B8924A] uppercase tracking-[0.1em] transition-colors">
                    ← Dashboard
                </Link>
                <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl">Customers</h1>
                </div>
                <p className="text-xs text-[#F5EFE6]/30 uppercase tracking-[0.1em]">{filtered.length} customers</p>
            </div>

            <div className="relative w-72">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F5EFE6]/30" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input type="text" placeholder="Search name, email, phone…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="bg-white/5 border border-white/15 pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#B8924A] w-full" />
            </div>
            </div>
        </section>

        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
            {loading ? (
            <p className="text-sm text-[#F5EFE6]/30">Loading customers…</p>
            ) : filtered.length === 0 ? (
            <p className="text-sm text-[#F5EFE6]/30">No customers found.</p>
            ) : (
            <div className="flex flex-col gap-3">
                {filtered.map(c => (
                <button key={c._id} onClick={() => openCustomer(c)}
                    className="flex items-center justify-between border border-white/10 p-4 hover:border-[#B8924A]/40 transition-colors text-left">
                    <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-[#F5EFE6]/30 mt-0.5">{c.email} {c.email && c.phone && '·'} {c.phone}</p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                        <p className="text-xs text-[#F5EFE6]/40">{c.orderCount} order{c.orderCount !== 1 ? 's' : ''}</p>
                        <p className="text-[#B8924A] font-[family-name:var(--font-display)]">₦{c.totalSpent?.toLocaleString()}</p>
                    </div>
                    <span className="text-[#F5EFE6]/20">→</span>
                    </div>
                </button>
                ))}
            </div>
            )}
        </div>
        </main>
    )
}