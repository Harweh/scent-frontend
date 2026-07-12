/* eslint-disable react/no-unescaped-entities */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

const ADMIN_SECRET   = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'aura-admin-2026'
const adminHeaders   = () => ({ 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET })
const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const statusColor = s => ({
    pending: 'text-amber-400 border-amber-500/30',
    confirmed: 'text-blue-400 border-blue-500/30',
    processing: 'text-purple-400 border-purple-500/30',
    shipped: 'text-cyan-400 border-cyan-500/30',
    delivered: 'text-emerald-400 border-emerald-500/30',
    cancelled: 'text-red-400 border-red-500/30',
    }[s] || 'text-white/50 border-white/10')

    export default function OrderDetailPage() {
    const { id } = useParams()
    const router  = useRouter()
    const [order,      setOrder]      = useState(null)
    const [loading,    setLoading]    = useState(true)
    const [updating,   setUpdating]   = useState(false)
    const [saved,      setSaved]      = useState(false)

    useEffect(() => {
        if (sessionStorage.getItem('aura_admin_authed') !== 'true') {
        router.push('/admin')
        return
        }
        apiFetch(`/api/orders/${id}`, { headers: adminHeaders() })
        .then(d => { if (d.success) setOrder(d.data) })
        .catch(console.error)
        .finally(() => setLoading(false))
    }, [id])

    async function patch(updates) {
        setUpdating(true)
        try {
        const data = await apiFetch(`/api/orders/${id}`, {
            method: 'PATCH', headers: adminHeaders(), body: JSON.stringify(updates),
        })
        if (data.success) { setOrder(data.data); setSaved(true); setTimeout(() => setSaved(false), 2000) }
        } catch (err) { console.error(err) }
        finally { setUpdating(false) }
    }

    if (loading) return (
        <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6] flex items-center justify-center">
        <p className="text-sm text-[#F5EFE6]/30 animate-pulse">Loading order…</p>
        </main>
    )

    if (!order) return (
        <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6] flex items-center justify-center">
        <div className="text-center">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-xl mb-4">Order not found</p>
            <Link href="/admin/orders" className="text-xs text-[#B8924A] hover:underline uppercase tracking-[0.1em]">← Back to Orders</Link>
        </div>
        </main>
    )

    const mix = order.mixingInstructions

    return (
        <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6]">

        {/* Header */}
        <section className="border-b border-white/10">
            <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                <Link href="/admin/orders" className="text-xs text-[#F5EFE6]/30 hover:text-[#B8924A] uppercase tracking-[0.1em] transition-colors mb-3 block">
                    ← All Orders
                </Link>
                <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl">{order.orderId}</h1>
                <p className="text-xs text-[#F5EFE6]/30 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    {' · '}
                    {new Date(order.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                </p>
                </div>
                {saved && <span className="text-xs text-emerald-400 uppercase tracking-[0.1em]">✓ Saved</span>}
            </div>
            </div>
        </section>

        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

            {/* LEFT */}
            <div className="flex flex-col gap-8">

            {/* Customer */}
            <div className="border border-white/10 p-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8924A] mb-4">Customer</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-[#F5EFE6]/40 text-xs mb-0.5">Name</p>
                    <p>{order.customer?.name}</p>
                </div>
                <div>
                    <p className="text-[#F5EFE6]/40 text-xs mb-0.5">Phone</p>
                    <p>{order.customer?.phone}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-[#F5EFE6]/40 text-xs mb-0.5">Email</p>
                    <p>{order.customer?.email || '—'}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-[#F5EFE6]/40 text-xs mb-0.5">Delivery Address</p>
                    <p>{order.customer?.address}</p>
                </div>
                </div>
            </div>

            {/* Items */}
            <div className="border border-white/10 p-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8924A] mb-4">
                {order.purchaseType === 'ai_match' ? 'AI Blend Recipe' : 'Items Ordered'}
                </p>
                <div className="flex flex-col gap-3">
                {order.notes?.map((n, i) => (
                    <div key={i} className="flex items-center justify-between text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                        <span>{n.emoji}</span>
                        <div>
                        <p>{n.name}</p>
                        {n.role && <p className="text-xs text-[#B8924A]">{n.role} note · {n.percentage || ''}%</p>}
                        </div>
                    </div>
                    <p className="text-[#F5EFE6]/50">{n.mlUsed}ml · ₦{(n.pricePerMl * n.mlUsed).toLocaleString()}</p>
                    </div>
                ))}
                </div>
            </div>

            {/* Mixing Instruction Card — only for AI blends */}
            {mix && (
                <div className="border border-[#B8924A]/30 bg-[#B8924A]/5 p-6">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8924A]">🧪 Mixing Instruction Card</p>
                    <span className="text-[9px] uppercase tracking-[0.1em] px-2 py-1 border border-purple-500/30 text-purple-400">AI Blend</span>
                </div>

                <h2 className="font-[family-name:var(--font-display)] text-2xl mb-1">{mix.blendName}</h2>
                <p className="text-xs text-[#F5EFE6]/40 mb-4">Total volume: {mix.totalVolume}</p>

                {/* Recipe */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {mix.recipe?.map((r, i) => (
                    <div key={i} className="border border-white/10 p-3 text-center">
                        <p className="text-lg mb-1">{r.emoji}</p>
                        <p className="text-[9px] uppercase tracking-[0.1em] text-[#B8924A] mb-0.5">{r.role}</p>
                        <p className="text-sm font-medium">{r.note}</p>
                        <p className="text-xs text-[#F5EFE6]/40">{r.volume} · {r.percentage}</p>
                    </div>
                    ))}
                </div>

                {/* Step by step */}
                <div className="flex flex-col gap-2">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#F5EFE6]/40 mb-1">Mixing Steps</p>
                    {mix.steps?.map((step, i) => (
                    <p key={i} className="text-sm text-[#F5EFE6]/70 leading-relaxed">{step}</p>
                    ))}
                </div>

                <p className="text-xs text-[#F5EFE6]/40 mt-4 border-t border-white/10 pt-4">{mix.notes}</p>

                {/* Customer mood */}
                {order.scentDescription && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#F5EFE6]/40 mb-1">Customer's Blend Description</p>
                    <p className="text-sm text-[#F5EFE6]/60 italic">"{order.scentDescription}"</p>
                    </div>
                )}
                </div>
            )}

            {/* Pricing */}
            <div className="border border-white/10 p-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8924A] mb-4">Pricing</p>
                <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between"><span className="text-[#F5EFE6]/50">Fragrance cost</span><span>₦{order.fragranceCost?.toLocaleString()}</span></div>
                {order.mixingFee > 0 && <div className="flex justify-between"><span className="text-[#F5EFE6]/50">Mixing fee</span><span>₦{order.mixingFee?.toLocaleString()}</span></div>}
                {order.vialCost > 0  && <div className="flex justify-between"><span className="text-[#F5EFE6]/50">Vial</span><span>₦{order.vialCost?.toLocaleString()}</span></div>}
                <div className="flex justify-between"><span className="text-[#F5EFE6]/50">Delivery ({order.deliveryZone})</span><span>₦{order.deliveryFee?.toLocaleString()}</span></div>
                <div className="flex justify-between border-t border-white/10 pt-2 mt-1">
                    <span className="text-xs uppercase tracking-[0.1em] text-[#F5EFE6]/50">Total</span>
                    <span className="font-[family-name:var(--font-display)] text-xl text-[#B8924A]">₦{order.totalAmount?.toLocaleString()}</span>
                </div>
                </div>
            </div>
            </div>

            {/* RIGHT — Status controls */}
            <div className="flex flex-col gap-4">

            <div className="border border-white/10 p-5 flex flex-col gap-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8924A]">Order Controls</p>

                <div>
                <p className="text-xs text-[#F5EFE6]/40 mb-2 uppercase tracking-[0.1em]">Order Status</p>
                <select value={order.status} disabled={updating}
                    onChange={e => patch({ status: e.target.value })}
                    className={`w-full bg-[#1C1813] border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A] disabled:opacity-50 ${statusColor(order.status).split(' ')[0]}`}>
                    {ORDER_STATUSES.map(s => (
                    <option key={s} value={s} className="bg-[#1C1813] text-white">{s}</option>
                    ))}
                </select>
                </div>

                <div>
                <p className="text-xs text-[#F5EFE6]/40 mb-2 uppercase tracking-[0.1em]">Payment Status</p>
                <select value={order.paymentStatus} disabled={updating}
                    onChange={e => patch({ paymentStatus: e.target.value })}
                    className={`w-full bg-[#1C1813] border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A] disabled:opacity-50
                    ${order.paymentStatus === 'paid' ? 'text-emerald-400' : order.paymentStatus === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>
                    <option value="pending" className="bg-[#1C1813] text-amber-400">Pending</option>
                    <option value="paid"    className="bg-[#1C1813] text-emerald-400">Paid</option>
                    <option value="failed"  className="bg-[#1C1813] text-red-400">Failed</option>
                </select>
                </div>

                <div>
                <p className="text-xs text-[#F5EFE6]/40 mb-2 uppercase tracking-[0.1em]">Payment Method</p>
                <p className="text-sm">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                {order.paymentReference && <p className="text-xs text-[#F5EFE6]/30 mt-1">Ref: {order.paymentReference}</p>}
                </div>
            </div>

            <div className="border border-white/10 p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8924A] mb-3">Type</p>
                <span className={`text-xs uppercase tracking-[0.1em] px-3 py-1.5 border
                ${order.purchaseType === 'ai_match' ? 'border-purple-500/30 text-purple-400' : 'border-white/10 text-[#F5EFE6]/40'}`}>
                {order.purchaseType === 'ai_match' ? 'AI Blend' : order.purchaseType === 'manual_mix' ? 'Manual Mix' : 'Standard'}
                </span>
            </div>
            </div>
        </div>
        </main>
    )
}