// 'use client'

// import { useEffect, useState } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { apiFetch } from '@/lib/api'

// const ADMIN_SECRET   = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'aura-admin-2026'
// const adminHeaders   = () => ({ 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET })
// const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

// const statusColor = s => ({
//     pending:    'text-amber-400 border-amber-500/30',
//     confirmed:  'text-blue-400 border-blue-500/30',
//     processing: 'text-purple-400 border-purple-500/30',
//     shipped:    'text-cyan-400 border-cyan-500/30',
//     delivered:  'text-emerald-400 border-emerald-500/30',
//     cancelled:  'text-red-400 border-red-500/30',
//     }[s] || 'text-white/50 border-white/10')

//     export default function AdminOrderDetailPage() {
//     const { id }   = useParams()
//     const router   = useRouter()
//     const [order,    setOrder]    = useState(null)
//     const [loading,  setLoading]  = useState(true)
//     const [updating, setUpdating] = useState(false)
//     const [saved,    setSaved]    = useState(false)

//     useEffect(() => {
//         if (sessionStorage.getItem('aura_admin_authed') !== 'true') {
//         router.push('/admin')
//         return
//         }
//         apiFetch(`/api/orders/${id}`, { headers: adminHeaders() })
//         .then(d => { if (d.success) setOrder(d.data) })
//         .catch(console.error)
//         .finally(() => setLoading(false))
//     }, [id])

//     async function patch(updates) {
//         setUpdating(true)
//         try {
//         const data = await apiFetch(`/api/orders/${id}`, {
//             method: 'PATCH',
//             headers: adminHeaders(),
//             body: JSON.stringify(updates),
//         })
//         if (data.success) {
//             setOrder(data.data)
//             setSaved(true)
//             setTimeout(() => setSaved(false), 2000)
//         }
//         } catch (err) { console.error(err) }
//         finally { setUpdating(false) }
//     }

//     if (loading) return (
//         <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6] flex items-center justify-center">
//         <p className="text-sm text-[#F5EFE6]/30 animate-pulse">Loading order…</p>
//         </main>
//     )

//     if (!order) return (
//         <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6] flex items-center justify-center">
//         <div className="text-center">
//             <p className="text-4xl mb-4">📦</p>
//             <p className="font-[family-name:var(--font-display)] text-xl mb-4">Order not found</p>
//             <Link href="/admin/orders" className="text-xs text-[#B8924A] hover:underline uppercase tracking-[0.1em]">
//             ← Back to Orders
//             </Link>
//         </div>
//         </main>
//     )

//     const mix     = order.mixingInstructions
//     const isBlend = order.purchaseType === 'ai_match'

//     return (
//         <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6]">

//         {/* Header */}
//         <section className="border-b border-white/10">
//             <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
//             <div className="flex items-center gap-3 mb-4 flex-wrap">
//                 <Link href="/admin/customers"
//                 className="text-xs text-[#F5EFE6]/30 hover:text-[#B8924A] uppercase tracking-[0.1em] transition-colors">
//                 ← Customers
//                 </Link>
//                 <span className="text-[#F5EFE6]/20">·</span>
//                 <Link href="/admin/orders"
//                 className="text-xs text-[#F5EFE6]/30 hover:text-[#B8924A] uppercase tracking-[0.1em] transition-colors">
//                 All Orders
//                 </Link>
//             </div>
//             <div className="flex items-start justify-between flex-wrap gap-4">
//                 <div>
//                 <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl mb-1">{order.orderId}</h1>
//                 <p className="text-xs text-[#F5EFE6]/30">
//                     {new Date(order.createdAt).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
//                     {' · '}
//                     {new Date(order.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
//                 </p>
//                 </div>
//                 {saved && <span className="text-xs text-emerald-400 uppercase tracking-[0.1em]">✓ Saved</span>}
//             </div>
//             </div>
//         </section>

//         <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

//             {/* LEFT */}
//             <div className="flex flex-col gap-6">

//             {/* Customer */}
//             <div className="border border-white/10 p-6">
//                 <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8924A] mb-4">Customer</p>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
//                 <div>
//                     <p className="text-[#F5EFE6]/40 text-xs mb-1">Name</p>
//                     <p className="font-medium">{order.customer?.name}</p>
//                 </div>
//                 <div>
//                     <p className="text-[#F5EFE6]/40 text-xs mb-1">Phone</p>
//                     <p>{order.customer?.phone}</p>
//                 </div>
//                 <div>
//                     <p className="text-[#F5EFE6]/40 text-xs mb-1">Email</p>
//                     <p>{order.customer?.email || '—'}</p>
//                 </div>
//                 <div>
//                     <p className="text-[#F5EFE6]/40 text-xs mb-1">Delivery Address</p>
//                     <p>{order.customer?.address}</p>
//                 </div>
//                 </div>
//             </div>

//             {/* Items */}
//             <div className="border border-white/10 p-6">
//                 <div className="flex items-center justify-between mb-4">
//                 <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8924A]">
//                     {isBlend ? 'AI Blend — Fragrance Notes' : 'Items Ordered'}
//                 </p>
//                 {isBlend && (
//                     <span className="text-[9px] uppercase tracking-[0.1em] px-2 py-1 border border-purple-500/30 text-purple-400">
//                     AI Blend
//                     </span>
//                 )}
//                 </div>
//                 <div className="flex flex-col gap-3">
//                 {order.notes?.map((n, i) => (
//                     <div key={i} className="flex items-center justify-between text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
//                     <div className="flex items-center gap-3">
//                         <span className="text-xl">{n.emoji}</span>
//                         <div>
//                         <p className="font-medium">{n.name}</p>
//                         {n.role && (
//                             <p className="text-xs text-[#B8924A] mt-0.5">
//                             {n.role} note{n.percentage > 0 && ` · ${n.percentage}%`}
//                             </p>
//                         )}
//                         </div>
//                     </div>
//                     <div className="text-right">
//                         <p className="text-[#F5EFE6]/60">{n.mlUsed}ml</p>
//                         <p className="text-xs text-[#F5EFE6]/30">₦{(n.pricePerMl * n.mlUsed).toLocaleString()}</p>
//                     </div>
//                     </div>
//                 ))}
//                 </div>
//             </div>

//             {/* Mixing Instruction Card — AI blends only */}
//             {isBlend && (
//                 <div className="border border-[#B8924A]/40 bg-[#B8924A]/5 p-6">
//                 <div className="flex items-center justify-between mb-5">
//                     <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8924A]">🧪 Mixing Instruction Card</p>
//                     <span className="text-[9px] uppercase tracking-[0.1em] px-2 py-1 border border-[#B8924A]/30 text-[#B8924A]">
//                     For Perfumer
//                     </span>
//                 </div>

//                 {mix ? (
//                     <>
//                     <h2 className="font-[family-name:var(--font-display)] text-2xl italic mb-1">
//                         {mix.blendName || order.scentDescription}
//                     </h2>
//                     <p className="text-xs text-[#F5EFE6]/40 mb-5">
//                         Total volume: {mix.totalVolume || `${order.notes?.reduce((s, n) => s + n.mlUsed, 0)}ml`}
//                     </p>

//                     {mix.recipe && (
//                         <div className="grid grid-cols-3 gap-3 mb-6">
//                         {mix.recipe.map((r, i) => (
//                             <div key={i} className="border border-white/10 p-3 text-center bg-[#100E0B]/40">
//                             <p className="text-2xl mb-2">{r.emoji}</p>
//                             <p className="text-[9px] uppercase tracking-[0.15em] text-[#B8924A] mb-1">{r.role}</p>
//                             <p className="text-sm font-medium mb-1">{r.note}</p>
//                             <p className="text-xs text-[#F5EFE6]/50">{r.volume}</p>
//                             <p className="text-xs text-[#B8924A]">{r.percentage}</p>
//                             </div>
//                         ))}
//                         </div>
//                     )}

//                     {mix.steps && mix.steps.length > 0 && (
//                         <div className="mb-5">
//                         <p className="text-[10px] uppercase tracking-[0.15em] text-[#F5EFE6]/40 mb-3">Mixing Steps</p>
//                         <div className="flex flex-col gap-2">
//                             {mix.steps.map((step, i) => (
//                             <div key={i} className="flex gap-3 text-sm">
//                                 <span className="text-[#B8924A] shrink-0 font-medium">{i + 1}.</span>
//                                 <p className="text-[#F5EFE6]/70 leading-relaxed">{step}</p>
//                             </div>
//                             ))}
//                         </div>
//                         </div>
//                     )}

//                     {mix.notes && (
//                         <p className="text-xs text-[#F5EFE6]/40 border-t border-white/10 pt-4">{mix.notes}</p>
//                     )}
//                     </>
//                 ) : (
//                     <div className="flex flex-col gap-3">
//                     {order.notes?.map((n, i) => (
//                         <div key={i} className="flex items-center justify-between text-sm">
//                         <span className="flex items-center gap-2">
//                             <span>{n.emoji}</span>
//                             <span>{n.name}</span>
//                             {n.role && <span className="text-xs text-[#B8924A]">({n.role})</span>}
//                         </span>
//                         <span className="text-[#F5EFE6]/50">{n.mlUsed}ml</span>
//                         </div>
//                     ))}
//                     </div>
//                 )}

//                 {order.scentDescription && (
//                     <div className="mt-5 border-t border-white/10 pt-4">
//                     <p className="text-[10px] uppercase tracking-[0.15em] text-[#F5EFE6]/40 mb-2">Customer's Mood</p>
//                     <p className="text-sm text-[#F5EFE6]/60 italic">"{order.scentDescription}"</p>
//                     </div>
//                 )}
//                 </div>
//             )}

//             {/* Pricing */}
//             <div className="border border-white/10 p-6">
//                 <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8924A] mb-4">Pricing</p>
//                 <div className="flex flex-col gap-2 text-sm">
//                 <div className="flex justify-between">
//                     <span className="text-[#F5EFE6]/50">Fragrance cost</span>
//                     <span>₦{order.fragranceCost?.toLocaleString()}</span>
//                 </div>
//                 {order.mixingFee > 0 && (
//                     <div className="flex justify-between">
//                     <span className="text-[#F5EFE6]/50">Mixing fee</span>
//                     <span>₦{order.mixingFee?.toLocaleString()}</span>
//                     </div>
//                 )}
//                 {order.vialCost > 0 && (
//                     <div className="flex justify-between">
//                     <span className="text-[#F5EFE6]/50">Vial & packaging</span>
//                     <span>₦{order.vialCost?.toLocaleString()}</span>
//                     </div>
//                 )}
//                 <div className="flex justify-between">
//                     <span className="text-[#F5EFE6]/50">Delivery ({order.deliveryZone})</span>
//                     <span>₦{order.deliveryFee?.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between border-t border-white/10 pt-3 mt-1">
//                     <span className="text-xs uppercase tracking-[0.1em] text-[#F5EFE6]/50">Total</span>
//                     <span className="font-[family-name:var(--font-display)] text-xl text-[#B8924A]">
//                     ₦{order.totalAmount?.toLocaleString()}
//                     </span>
//                 </div>
//                 </div>
//             </div>
//             </div>

//             {/* RIGHT — Controls */}
//             <div className="flex flex-col gap-4">
//             <div className="border border-white/10 p-5 flex flex-col gap-5">
//                 <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8924A]">Order Controls</p>

//                 <div>
//                 <p className="text-xs text-[#F5EFE6]/40 mb-2 uppercase tracking-[0.1em]">Order Status</p>
//                 <select value={order.status} disabled={updating}
//                     onChange={e => patch({ status: e.target.value })}
//                     className={`w-full bg-[#1C1813] border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A] disabled:opacity-50 ${statusColor(order.status).split(' ')[0]}`}>
//                     {ORDER_STATUSES.map(s => (
//                     <option key={s} value={s} className="bg-[#1C1813] text-white">{s}</option>
//                     ))}
//                 </select>
//                 </div>

//                 <div>
//                 <p className="text-xs text-[#F5EFE6]/40 mb-2 uppercase tracking-[0.1em]">Payment Status</p>
//                 <select value={order.paymentStatus} disabled={updating}
//                     onChange={e => patch({ paymentStatus: e.target.value })}
//                     className={`w-full bg-[#1C1813] border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A] disabled:opacity-50
//                     ${order.paymentStatus === 'paid' ? 'text-emerald-400' : order.paymentStatus === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>
//                     <option value="pending" className="bg-[#1C1813] text-amber-400">Pending</option>
//                     <option value="paid"    className="bg-[#1C1813] text-emerald-400">Paid</option>
//                     <option value="failed"  className="bg-[#1C1813] text-red-400">Failed</option>
//                 </select>
//                 </div>

//                 <div className="border-t border-white/10 pt-4">
//                 <p className="text-xs text-[#F5EFE6]/40 mb-1 uppercase tracking-[0.1em]">Payment Method</p>
//                 <p className="text-sm">
//                     {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
//                 </p>
//                 </div>
//             </div>

//             <div className="border border-white/10 p-5">
//                 <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8924A] mb-3">Order Type</p>
//                 <span className={`text-xs uppercase tracking-[0.1em] px-3 py-1.5 border
//                 ${isBlend ? 'border-purple-500/30 text-purple-400' : 'border-white/10 text-[#F5EFE6]/40'}`}>
//                 {isBlend ? 'AI Blend' : order.purchaseType === 'manual_mix' ? 'Manual Mix' : 'Standard'}
//                 </span>
//             </div>

//             <div className="border border-white/10 p-5">
//                 <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8924A] mb-2">Delivery Zone</p>
//                 <p className="text-sm capitalize">{order.deliveryZone}</p>
//             </div>
//             </div>
//         </div>
//         </main>
//     )
//     }



'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

const ADMIN_SECRET   = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'aura-admin-2026'
const adminHeaders   = () => ({ 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET })
const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const statusColor = s => ({
    pending:    'text-amber-400',
    confirmed:  'text-blue-400',
    processing: 'text-purple-400',
    shipped:    'text-cyan-400',
    delivered:  'text-emerald-400',
    cancelled:  'text-red-400',
}[s] || 'text-white/50')

export default function AdminOrderDetailPage() {
    const { id }  = useParams()
    const router  = useRouter()
    const [order,    setOrder]    = useState(null)
    const [loading,  setLoading]  = useState(true)
    const [updating, setUpdating] = useState(false)
    const [saved,    setSaved]    = useState(false)

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
            <p className="font-[family-name:var(--font-display)] text-xl mb-4">Order not found</p>
            <Link href="/admin/orders" className="text-xs text-[#B8924A] hover:underline uppercase tracking-[0.1em]">← Back to Orders</Link>
        </div>
        </main>
    )

    const mix     = order.mixingInstructions
    const isBlend = order.purchaseType === 'ai_match'

    return (
        <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6]">

        {/* Header */}
        <section className="border-b border-white/10">
            <div className="max-w-6xl mx-auto px-8 sm:px-12 py-8">
            <div className="flex items-center gap-4 mb-4 text-xs uppercase tracking-[0.12em]">
                <Link href="/admin/customers" className="text-[#F5EFE6]/30 hover:text-[#B8924A] transition-colors">← Customers</Link>
                <span className="text-[#F5EFE6]/15">·</span>
                <Link href="/admin/orders" className="text-[#F5EFE6]/30 hover:text-[#B8924A] transition-colors">All Orders</Link>
            </div>
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl mb-1">{order.orderId}</h1>
                <p className="text-sm text-[#F5EFE6]/40">
                    {new Date(order.createdAt).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    {' · '}{new Date(order.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                </p>
                </div>
                {saved && <span className="text-xs text-emerald-400 uppercase tracking-[0.1em]">✓ Saved</span>}
            </div>
            </div>
        </section>

        <div className="max-w-6xl mx-auto px-8 sm:px-12 py-10">

            {/* ── TOP ROW: Customer + Order Controls side by side ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-6">

            {/* Customer */}
            <div className="border border-white/10 p-7">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#B8924A] mb-5">Customer</p>
                <div className="grid grid-cols-2 gap-5 text-sm">
                <div>
                    <p className="text-[#F5EFE6]/40 text-xs uppercase tracking-[0.1em] mb-1.5">Name</p>
                    <p className="font-medium">{order.customer?.name}</p>
                </div>
                <div>
                    <p className="text-[#F5EFE6]/40 text-xs uppercase tracking-[0.1em] mb-1.5">Phone</p>
                    <p>{order.customer?.phone}</p>
                </div>
                <div>
                    <p className="text-[#F5EFE6]/40 text-xs uppercase tracking-[0.1em] mb-1.5">Email</p>
                    <p className="break-all">{order.customer?.email || '—'}</p>
                </div>
                <div>
                    <p className="text-[#F5EFE6]/40 text-xs uppercase tracking-[0.1em] mb-1.5">Delivery Address</p>
                    <p className="leading-relaxed">{order.customer?.address}</p>
                </div>
                </div>
            </div>

            {/* Order Controls + Pricing merged */}
            <div className="border border-white/10 p-7 flex flex-col gap-5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#B8924A]">Order Controls</p>

                <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#F5EFE6]/40 mb-2">Order Status</p>
                <select value={order.status} disabled={updating}
                    onChange={e => patch({ status: e.target.value })}
                    className={`w-full bg-[#1C1813] border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A] disabled:opacity-50 ${statusColor(order.status)}`}>
                    {ORDER_STATUSES.map(s => <option key={s} value={s} className="bg-[#1C1813] text-white">{s}</option>)}
                </select>

                    <div className="border-t border-red-500/20 pt-4 mt-2">
                        <button
                            onClick={async () => {
                            if (!confirm(`Delete order ${order.orderId}? This cannot be undone.`)) return
                            try {
                                const data = await apiFetch(`/api/orders/${id}`, {
                                method: 'DELETE', headers: adminHeaders(),
                                })
                                if (data.success) router.push('/admin/orders')
                                else alert('Delete failed: ' + data.message)
                            } catch (err) { alert(err.message) }
                            }}
                            className="w-full py-3 text-xs uppercase tracking-[0.12em] border border-red-500/30 text-red-400/70 hover:bg-red-500/10 hover:border-red-500/60 hover:text-red-400 transition-colors">
                            Delete Order
                        </button>
                    </div>

                </div>

                <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#F5EFE6]/40 mb-2">Payment Status</p>
                <select value={order.paymentStatus} disabled={updating}
                    onChange={e => patch({ paymentStatus: e.target.value })}
                    className={`w-full bg-[#1C1813] border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A] disabled:opacity-50
                    ${order.paymentStatus === 'paid' ? 'text-emerald-400' : order.paymentStatus === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>
                    <option value="pending" className="bg-[#1C1813] text-amber-400">Pending</option>
                    <option value="paid"    className="bg-[#1C1813] text-emerald-400">Paid</option>
                    <option value="failed"  className="bg-[#1C1813] text-red-400">Failed</option>
                </select>
                </div>

                <div className="border-t border-white/10 pt-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#F5EFE6]/40 mb-2">Payment Method</p>
                <p className="text-sm">{order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}</p>
                </div>

                {/* Pricing merged here */}
                <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8924A] mb-3">Pricing</p>
                <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-[#F5EFE6]/50">Fragrance cost</span><span>₦{order.fragranceCost?.toLocaleString()}</span></div>
                    {order.mixingFee > 0 && <div className="flex justify-between"><span className="text-[#F5EFE6]/50">Mixing fee</span><span>₦{order.mixingFee?.toLocaleString()}</span></div>}
                    {order.vialCost > 0  && <div className="flex justify-between"><span className="text-[#F5EFE6]/50">Vial & packaging</span><span>₦{order.vialCost?.toLocaleString()}</span></div>}
                    <div className="flex justify-between"><span className="text-[#F5EFE6]/50">Delivery ({order.deliveryZone})</span><span>₦{order.deliveryFee?.toLocaleString()}</span></div>
                    <div className="flex justify-between border-t border-white/10 pt-2 mt-1">
                    <span className="text-[#F5EFE6]/50 uppercase tracking-[0.1em]">Total</span>
                    <span className="font-[family-name:var(--font-display)] text-base text-[#B8924A]">₦{order.totalAmount?.toLocaleString()}</span>
                    </div>
                </div>
                </div>
            </div>
            </div>

            {/* ── ITEMS — full width ── */}
            <div className="border border-white/10 p-7 mb-6">
            <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#B8924A]">
                {isBlend ? 'AI Blend — Fragrance Notes' : 'Items Ordered'}
                </p>
                {isBlend && (
                <span className="text-[9px] uppercase tracking-[0.12em] px-3 py-1.5 border border-purple-500/30 text-purple-400">AI Blend</span>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {order.notes?.map((n, i) => (
                <div key={i} className="border border-white/8 p-4 flex items-start gap-3">
                    <span className="text-2xl shrink-0">{n.emoji}</span>
                    <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.name}</p>
                    {n.role && <p className="text-xs text-[#B8924A] mt-0.5">{n.role} note{n.percentage > 0 && ` · ${n.percentage}%`}</p>}
                    <p className="text-xs text-[#F5EFE6]/40 mt-1">{n.mlUsed}ml · ₦{(n.pricePerMl * n.mlUsed).toLocaleString()}</p>
                    </div>
                </div>
                ))}
            </div>
            </div>

            {/* ── MIXING INSTRUCTION CARD — full width, only for AI blends ── */}
            {isBlend && (
            <div className="border border-[#B8924A]/40 bg-[#B8924A]/5 p-8">
                <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#B8924A]">🧪 Mixing Instruction Card</p>
                <span className="text-[9px] uppercase tracking-[0.12em] px-3 py-1.5 border border-[#B8924A]/40 text-[#B8924A]">For Perfumer</span>
                </div>

                {mix ? (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
                    <h2 className="font-[family-name:var(--font-display)] text-3xl italic">{mix.blendName || 'Custom Blend'}</h2>
                    <p className="text-xs text-[#F5EFE6]/40">Total volume: {mix.totalVolume}</p>
                    </div>

                    {/* Recipe — 3 columns, full width */}
                    {mix.recipe && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {mix.recipe.map((r, i) => (
                        <div key={i} className="border border-white/10 p-5 text-center bg-[#100E0B]/50">
                            <p className="text-3xl mb-3">{r.emoji}</p>
                            <p className="text-[9px] uppercase tracking-[0.15em] text-[#B8924A] mb-1">{r.role}</p>
                            <p className="text-base font-medium mb-2">{r.note}</p>
                            <p className="text-sm text-[#F5EFE6]/60">{r.volume}</p>
                            <p className="text-sm text-[#B8924A] font-medium">{r.percentage}</p>
                        </div>
                        ))}
                    </div>
                    )}

                    {/* Steps — 2 columns on wider screens */}
                    {mix.steps?.length > 0 && (
                    <div className="mb-6">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#F5EFE6]/40 mb-4">Step-by-Step Mixing Guide</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {mix.steps.map((step, i) => (
                            <div key={i} className="flex gap-3 text-sm">
                            <span className="text-[#B8924A] font-medium shrink-0 w-5">{i + 1}.</span>
                            <p className="text-[#F5EFE6]/70 leading-relaxed">{step}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}

                    {mix.notes && (
                    <p className="text-xs text-[#F5EFE6]/40 border-t border-white/10 pt-5 leading-relaxed">{mix.notes}</p>
                    )}

                    {order.scentDescription && (
                    <div className="mt-5 border-t border-white/10 pt-5">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#F5EFE6]/40 mb-2">Customer's Mood</p>
                        <p className="text-sm text-[#F5EFE6]/60 italic leading-relaxed">"{order.scentDescription}"</p>
                    </div>
                    )}
                </>
                ) : (
                <div className="flex flex-col gap-4">
                    {order.notes?.map((n, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                        <span>{n.emoji}</span><span>{n.name}</span>
                        {n.role && <span className="text-xs text-[#B8924A]">({n.role})</span>}
                        </span>
                        <span className="text-[#F5EFE6]/50">{n.mlUsed}ml</span>
                    </div>
                    ))}
                </div>
                )}
            </div>
            )}
        </div>
        </main>
    )
}