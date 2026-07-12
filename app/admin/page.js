/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
    'use client'

    import { useEffect, useState } from 'react'
    import { apiFetch } from '@/lib/api'

    const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    const CATEGORIES     = ['Floral', 'Woody', 'Fresh', 'Oriental', 'Citrus']
    const DURATIONS      = ['Short', 'Medium', 'Long']

    // Single source of truth — must match ADMIN_SECRET in your .env.local
    // If ADMIN_SECRET is not set on the server, this fallback is used on both sides
    const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'aura-admin-2026'

    function adminHeaders() {
    return {
        'Content-Type': 'application/json',
        'x-admin-secret': ADMIN_SECRET,
    }
    }

    // ── PASSCODE GATE ────────────────────────────────────────
    export default function AdminPage() {
    const [authed,   setAuthed]   = useState(false)
    const [passcode, setPasscode] = useState('')
    const [authErr,  setAuthErr]  = useState('')
    const [tab,      setTab]      = useState('orders')

    useEffect(() => {
        if (sessionStorage.getItem('aura_admin_authed') === 'true') setAuthed(true)
    }, [])

    function handleLogin(e) {
        e.preventDefault()
        if (passcode === ADMIN_SECRET) {
        sessionStorage.setItem('aura_admin_authed', 'true')
        setAuthed(true)
        } else {
        setAuthErr('Incorrect passcode')
        }
    }

    if (!authed) return (
        <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6] flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-[#B8924A] mb-3 text-center">Internal</p>
            <h1 className="font-[family-name:var(--font-display)] text-2xl mb-8 text-center">Admin Access</h1>
            <input
            type="password" placeholder="Passcode" autoFocus
            value={passcode} onChange={e => setPasscode(e.target.value)}
            className="w-full bg-white/5 border border-white/15 px-5 py-3.5 text-sm text-center focus:outline-none focus:border-[#B8924A] mb-3"
            />
            {authErr && <p className="text-xs text-red-400 text-center mb-3">{authErr}</p>}
            <button type="submit" className="w-full bg-[#B8924A] text-[#100E0B] py-3.5 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C9A45A] transition-colors">
            Enter
            </button>
        </form>
        </main>
    )

    return (
        <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6]">
        <section className="border-b border-white/10">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10">
            <div className="flex items-end justify-between mb-6">
                <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#B8924A] mb-2">Internal</p>
                <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl">Admin Dashboard</h1>
                </div>
                <button
                onClick={() => { sessionStorage.removeItem('aura_admin_authed'); setAuthed(false) }}
                className="text-xs text-[#F5EFE6]/30 hover:text-red-400 uppercase tracking-[0.1em] transition-colors"
                >
                Sign out
                </button>
            </div>
            <div className="flex gap-2">
                {[{ id: 'orders', label: 'Orders' }, { id: 'fragrances', label: 'Fragrances' }].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-5 py-2.5 text-xs uppercase tracking-[0.12em] border transition-colors
                    ${tab === t.id
                        ? 'bg-[#B8924A] border-[#B8924A] text-[#100E0B]'
                        : 'border-white/15 text-[#F5EFE6]/50 hover:border-[#B8924A] hover:text-[#B8924A]'}`}>
                    {t.label}
                </button>
                ))}
            </div>
            </div>
        </section>
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-10">
            {tab === 'orders' ? <OrdersAdmin /> : <FragrancesAdmin />}
        </section>
        </main>
    )
    }

    // ── ORDERS TAB ───────────────────────────────────────────
    function OrdersAdmin() {
    const [orders,     setOrders]     = useState([])
    const [loading,    setLoading]    = useState(true)
    const [updatingId, setUpdatingId] = useState(null)

    useEffect(() => { load() }, [])

    function load() {
        setLoading(true)
        apiFetch('/api/orders', { headers: adminHeaders() })
        .then(d => { if (d.success) setOrders(d.data) })
        .catch(console.error)
        .finally(() => setLoading(false))
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

    const statusColor = s => ({
        pending: 'text-amber-400/70', confirmed: 'text-blue-400/70',
        processing: 'text-purple-400/70', shipped: 'text-cyan-400/70',
        delivered: 'text-emerald-400/70', cancelled: 'text-red-400/70',
    }[s] || 'text-white/50')

    if (loading) return <p className="text-sm text-[#F5EFE6]/40">Loading orders…</p>
    if (!orders.length) return <p className="text-sm text-[#F5EFE6]/40">No orders yet.</p>

    return (
        <div>
        <p className="text-xs text-[#F5EFE6]/30 uppercase tracking-[0.15em] mb-5">{orders.length} total orders</p>
        <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[640px]">
            <thead>
                <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-[0.1em] text-[#F5EFE6]/30">
                {['Order', 'Customer', 'Items', 'Total', 'Payment Status', 'Order Status'].map(h => (
                    <th key={h} className="py-3 pr-5">{h}</th>
                ))}
                </tr>
            </thead>
            <tbody>
                {orders.map(o => (
                <tr key={o._id} className="border-b border-white/5">
                    <td className="py-4 pr-5">
                    <p className="font-medium text-[#B8924A]">{o.orderId}</p>
                    <p className="text-xs text-[#F5EFE6]/30">{new Date(o.createdAt).toLocaleDateString('en-NG')}</p>
                    <p className="text-xs text-[#F5EFE6]/30">{o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</p>
                    </td>
                    <td className="py-4 pr-5">
                    <p>{o.customer?.name}</p>
                    <p className="text-xs text-[#F5EFE6]/30">{o.customer?.email}</p>
                    <p className="text-xs text-[#F5EFE6]/30">{o.customer?.phone}</p>
                    </td>
                    <td className="py-4 pr-5 text-xs text-[#F5EFE6]/50">
                    {o.notes?.map((n, i) => <div key={i}>{n.emoji} {n.name} ({n.mlUsed}ml)</div>)}
                    <p className="text-[#B8924A] mt-1">₦{o.totalAmount?.toLocaleString()}</p>
                    </td>
                    <td className="py-4 pr-5 text-[#B8924A] font-[family-name:var(--font-display)]">
                    ₦{o.totalAmount?.toLocaleString()}
                    </td>

                    {/* Payment Status — admin can override e.g. failed → paid after manual verification */}
                    <td className="py-4 pr-5">
                    <select
                        value={o.paymentStatus}
                        disabled={updatingId === o._id}
                        onChange={e => updatePaymentStatus(o._id, e.target.value)}
                        className={`bg-[#1C1813] border border-white/15 px-3 py-2 text-xs focus:outline-none focus:border-[#B8924A] disabled:opacity-50
                        ${o.paymentStatus === 'paid' ? 'text-emerald-400' : o.paymentStatus === 'failed' ? 'text-red-400' : 'text-amber-400'}`}
                    >
                        <option value="pending" className="bg-[#1C1813] text-amber-400">Pending</option>
                        <option value="paid"    className="bg-[#1C1813] text-emerald-400">Paid</option>
                        <option value="failed"  className="bg-[#1C1813] text-red-400">Failed</option>
                    </select>
                    </td>

                    {/* Order Status */}
                    <td className="py-4">
                    <select
                        value={o.status}
                        disabled={updatingId === o._id}
                        onChange={e => updateStatus(o._id, e.target.value)}
                        className={`bg-[#1C1813] border border-white/15 px-3 py-2 text-xs focus:outline-none focus:border-[#B8924A] disabled:opacity-50 ${statusColor(o.status)}`}
                    >
                        {ORDER_STATUSES.map(s => (
                        <option key={s} value={s} className="bg-[#1C1813] text-white">{s}</option>
                        ))}
                    </select>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    )
    }

    // ── FRAGRANCES TAB ───────────────────────────────────────
    const emptyForm = {
    name: '', category: 'Floral', description: '', duration: 'Medium',
    pricePerMl: '', imageUrl: '', color: '#B8924A', emoji: '🌸', inStock: true,
    }

    function FragrancesAdmin() {
    const [fragrances, setFragrances] = useState([])
    const [loading,    setLoading]    = useState(true)
    const [showForm,   setShowForm]   = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [form,       setForm]       = useState(emptyForm)
    const [submitting, setSubmitting] = useState(false)
    const [error,      setError]      = useState('')

    useEffect(() => { load() }, [])

    function load() {
        setLoading(true)
        apiFetch('/api/fragrances')
        .then(d => { if (d.success) setFragrances(d.data) })
        .catch(console.error)
        .finally(() => setLoading(false))
    }

    function openCreate() { setEditTarget(null); setForm(emptyForm); setError(''); setShowForm(true) }
    function openEdit(f) {
        setEditTarget(f)
        setForm({
        name:        f.name        || '',
        category:    f.category    || 'Floral',
        description: f.description || '',
        duration:    f.duration    || 'Medium',
        pricePerMl:  String(f.pricePerMl || ''),
        imageUrl:    f.imageUrl    || '',
        color:       f.color       || '#B8924A',
        emoji:       f.emoji       || '🌸',
        inStock:     f.inStock !== undefined ? f.inStock : true,
        })
        setError('')
        setShowForm(true)
    }
    function closeForm() { setShowForm(false); setEditTarget(null); setError('') }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        const payload = { ...form, pricePerMl: Number(form.pricePerMl) }

        try {
        if (editTarget) {
            const data = await apiFetch(`/api/fragrances/${editTarget._id}`, {
            method: 'PATCH', headers: adminHeaders(), body: JSON.stringify(payload),
            })
            if (!data.success) throw new Error(data.message || 'Update failed')
            setFragrances(prev => prev.map(f => f._id === editTarget._id ? data.data : f))
        } else {
            const data = await apiFetch('/api/fragrances', {
            method: 'POST', headers: adminHeaders(), body: JSON.stringify(payload),
            })
            if (!data.success) throw new Error(data.message || 'Create failed')
            setFragrances(prev => [data.data, ...prev])
        }
        closeForm()
        } catch (err) {
        setError(err.message)
        } finally {
        setSubmitting(false)
        }
    }

    async function handleDelete(id, name) {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
        try {
        const data = await apiFetch(`/api/fragrances/${id}`, {
            method: 'DELETE', headers: adminHeaders(),
        })
        if (data.success) {
            setFragrances(prev => prev.filter(f => f._id !== id))
        } else {
            alert('Delete failed: ' + data.message)
        }
        } catch (err) {
        alert('Delete error: ' + err.message)
        }
    }

    return (
        <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <p className="text-xs text-[#F5EFE6]/30 uppercase tracking-[0.15em]">{fragrances.length} fragrances</p>
            <button onClick={openCreate}
            className="px-5 py-2.5 text-xs uppercase tracking-[0.12em] bg-[#B8924A] text-[#100E0B] hover:bg-[#C9A45A] transition-colors">
            + New Fragrance
            </button>
        </div>

        {/* Edit / Create modal */}
        {showForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1A1714] border border-white/10 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                <h2 className="font-[family-name:var(--font-display)] text-xl">
                    {editTarget ? `Edit — ${editTarget.name}` : 'New Fragrance'}
                </h2>
                <button onClick={closeForm} className="text-[#F5EFE6]/40 hover:text-white text-2xl leading-none">×</button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

                <input required placeholder="Name" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="col-span-2 bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A]" />

                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="bg-[#1C1813] border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A]">
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1C1813]">{c}</option>)}
                </select>

                <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                    className="bg-[#1C1813] border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A]">
                    {DURATIONS.map(d => <option key={d} value={d} className="bg-[#1C1813]">{d}</option>)}
                </select>

                <textarea required rows={3} placeholder="Description" value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="col-span-2 bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A] resize-none" />

                <input required type="number" placeholder="Price per ml (₦)" value={form.pricePerMl}
                    onChange={e => setForm({ ...form, pricePerMl: e.target.value })}
                    className="bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A]" />

                <input placeholder="Emoji" value={form.emoji}
                    onChange={e => setForm({ ...form, emoji: e.target.value })}
                    className="bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A]" />

                <input placeholder="Image URL (/images/...)" value={form.imageUrl}
                    onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                    className="col-span-2 bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A]" />

                {/* ── IN STOCK TOGGLE ── */}
                <div className="col-span-2 flex items-center justify-between border border-white/10 px-4 py-3">
                    <div>
                    <p className="text-sm text-[#F5EFE6]/70">Stock Status</p>
                    <p className="text-xs text-[#F5EFE6]/30 mt-0.5">
                        {form.inStock
                        ? 'In Stock — customers can add to cart'
                        : 'Out of Stock — product still visible, Add to Cart disabled'}
                    </p>
                    </div>
                    <button
                    type="button"
                    onClick={() => setForm({ ...form, inStock: !form.inStock })}
                    className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${form.inStock ? 'bg-emerald-500' : 'bg-red-500/60'}`}
                    >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.inStock ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>

                {error && <p className="col-span-2 text-sm text-red-400">{error}</p>}

                <div className="col-span-2 flex gap-3 pt-2">
                    <button type="button" onClick={closeForm}
                    className="flex-1 py-3 text-xs uppercase tracking-[0.12em] border border-white/15 text-[#F5EFE6]/50 hover:border-[#B8924A] hover:text-[#B8924A] transition-colors">
                    Cancel
                    </button>
                    <button type="submit" disabled={submitting}
                    className="flex-1 py-3 text-xs uppercase tracking-[0.12em] bg-[#B8924A] text-[#100E0B] hover:bg-[#C9A45A] transition-colors disabled:opacity-50">
                    {submitting ? 'Saving…' : editTarget ? 'Save Changes' : 'Create'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        {loading ? (
            <p className="text-sm text-[#F5EFE6]/40">Loading…</p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fragrances.map(f => (
                <div key={f._id} className="border border-white/10 p-4 flex flex-col gap-3 hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between">
                    <div>
                    <p className="font-[family-name:var(--font-display)] text-base">{f.emoji} {f.name}</p>
                    <p className="text-xs text-[#B8924A]">{f.category} · {f.duration}</p>
                    </div>
                    <span className={`text-[9px] uppercase tracking-[0.1em] px-2 py-1 border shrink-0
                    ${f.inStock
                        ? 'border-emerald-500/30 text-emerald-400/60'
                        : 'border-red-500/30 text-red-400/60'}`}>
                    {f.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>

                <p className="text-xs text-[#F5EFE6]/40 line-clamp-2">{f.description}</p>

                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <p className="text-sm text-[#B8924A]">₦{f.pricePerMl?.toLocaleString()}/ml</p>
                    <div className="flex gap-4">
                    <button onClick={() => openEdit(f)}
                        className="text-xs text-[#F5EFE6]/40 hover:text-[#B8924A] uppercase tracking-[0.1em] transition-colors">
                        Edit
                    </button>
                    <button onClick={() => handleDelete(f._id, f.name)}
                        className="text-xs text-[#F5EFE6]/30 hover:text-red-400 uppercase tracking-[0.1em] transition-colors">
                        Delete
                    </button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    )
    }