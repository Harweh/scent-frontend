/* eslint-disable react-hooks/immutability */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'aura-admin-2026'
const adminHeaders = () => ({ 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET })
const CATEGORIES   = ['Floral', 'Woody', 'Fresh', 'Oriental', 'Citrus']
const DURATIONS    = ['Short', 'Medium', 'Long']
const emptyForm    = { name: '', category: 'Floral', description: '', duration: 'Medium', pricePerMl: '', imageUrl: '', color: '#B8924A', emoji: '🌸', inStock: true }

export default function AdminFragrancesPage() {
    const router = useRouter()
    const [fragrances, setFragrances] = useState([])
    const [loading,    setLoading]    = useState(true)
    const [showForm,   setShowForm]   = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [form,       setForm]       = useState(emptyForm)
    const [submitting, setSubmitting] = useState(false)
    const [error,      setError]      = useState('')
    const [uploading,  setUploading]  = useState(false)

    useEffect(() => {
        if (sessionStorage.getItem('aura_admin_authed') !== 'true') { router.push('/admin'); return }
        load()
    }, [])

    function load() {
        setLoading(true)
        apiFetch('/api/fragrances').then(d => { if (d.success) setFragrances(d.data) }).catch(console.error).finally(() => setLoading(false))
    }

    function openCreate() { setEditTarget(null); setForm(emptyForm); setError(''); setShowForm(true) }
    function openEdit(f)  { setEditTarget(f); setForm({ ...f, pricePerMl: String(f.pricePerMl) }); setError(''); setShowForm(true) }
    function closeForm()  { setShowForm(false); setEditTarget(null); setError('') }

    async function handleImageUpload(e) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        setError('')
        try {
        const body = new FormData()
        body.append('file', file)
        const data = await apiFetch('/api/upload', {
            method: 'POST',
            headers: { 'x-admin-secret': ADMIN_SECRET }, // no Content-Type — browser sets multipart boundary
            body,
        })
        if (!data.success) throw new Error(data.message || 'Upload failed')
        setForm(prev => ({ ...prev, imageUrl: data.url }))
        } catch (err) {
        setError(err.message)
        } finally {
        setUploading(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        const payload = { ...form, pricePerMl: Number(form.pricePerMl) }
        try {
        if (editTarget) {
            const data = await apiFetch(`/api/fragrances/${editTarget._id}`, { method: 'PATCH', headers: adminHeaders(), body: JSON.stringify(payload) })
            if (!data.success) throw new Error(data.message)
            setFragrances(prev => prev.map(f => f._id === editTarget._id ? data.data : f))
        } else {
            const data = await apiFetch('/api/fragrances', { method: 'POST', headers: adminHeaders(), body: JSON.stringify(payload) })
            if (!data.success) throw new Error(data.message)
            setFragrances(prev => [data.data, ...prev])
        }
        closeForm()
        } catch (err) { setError(err.message) }
        finally { setSubmitting(false) }
    }

    async function handleDelete(id, name) {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
        try {
        const data = await apiFetch(`/api/fragrances/${id}`, { method: 'DELETE', headers: adminHeaders() })
        if (data.success) setFragrances(prev => prev.filter(f => f._id !== id))
        else alert('Delete failed: ' + data.message)
        } catch (err) { alert(err.message) }
    }

    return (
        <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6]">
        <section className="border-b border-white/10">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
            <div className="flex gap-6 text-xs uppercase tracking-[0.15em] mb-6">
                <Link href="/admin" className="text-[#F5EFE6]/40 hover:text-[#B8924A] pb-3">Dashboard</Link>
                <Link href="/admin/orders" className="text-[#F5EFE6]/40 hover:text-[#B8924A] pb-3">Orders</Link>
                <Link href="/admin/customers" className="text-[#F5EFE6]/40 hover:text-[#B8924A] pb-3">Customers</Link>
                <span className="text-[#B8924A] border-b-2 border-[#B8924A] pb-3">Fragrances</span>
            </div>
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl">Fragrances</h1>
            </div>
            <button onClick={openCreate} className="bg-[#B8924A] text-[#100E0B] px-5 py-2.5 text-xs uppercase tracking-[0.12em] hover:bg-[#C9A45A] transition-colors">
                + New
            </button>
            </div>
            </div>
        </section>

        {/* Edit/Create Modal */}
        {showForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1A1714] border border-white/10 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                <h2 className="font-[family-name:var(--font-display)] text-xl">{editTarget ? `Edit — ${editTarget.name}` : 'New Fragrance'}</h2>
                <button onClick={closeForm} className="text-[#F5EFE6]/40 hover:text-white text-2xl leading-none">×</button>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <input required placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="col-span-2 bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A]" />
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="bg-[#1C1813] border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A]">
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1C1813]">{c}</option>)}
                </select>
                <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                    className="bg-[#1C1813] border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A]">
                    {DURATIONS.map(d => <option key={d} value={d} className="bg-[#1C1813]">{d}</option>)}
                </select>
                <textarea required rows={3} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className="col-span-2 bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A] resize-none" />
                <input required type="number" placeholder="Price per ml (₦)" value={form.pricePerMl} onChange={e => setForm({ ...form, pricePerMl: e.target.value })}
                    className="bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A]" />
                <input placeholder="Emoji" value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })}
                    className="bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A]" />
                <div className="col-span-2 flex flex-col gap-3">
                    <p className="text-xs text-[#F5EFE6]/50">Product Image</p>
                    <div className="flex items-center gap-4">
                    {form.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-sm border border-white/15" />
                    ) : (
                        <div className="w-16 h-16 flex items-center justify-center text-2xl bg-white/5 border border-white/15 rounded-sm">
                        {form.emoji || '🌸'}
                        </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageUpload} disabled={uploading} className="hidden" />
                        <span className="block text-center py-3 text-xs uppercase tracking-[0.12em] border border-white/15 text-[#F5EFE6]/50 hover:border-[#B8924A] hover:text-[#B8924A] transition-colors">
                        {uploading ? 'Uploading…' : form.imageUrl ? 'Change Image' : 'Upload Image'}
                        </span>
                    </label>
                    </div>
                </div>
                <div className="col-span-2 flex items-center justify-between border border-white/10 px-4 py-3">
                    <div>
                    <p className="text-sm text-[#F5EFE6]/70">Stock Status</p>
                    <p className="text-xs text-[#F5EFE6]/30 mt-0.5">{form.inStock ? 'In Stock — customers can add to cart' : 'Out of Stock — visible but cannot be purchased'}</p>
                    </div>
                    <button type="button" onClick={() => setForm({ ...form, inStock: !form.inStock })}
                    className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${form.inStock ? 'bg-emerald-500' : 'bg-red-500/60'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.inStock ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>
                {error && <p className="col-span-2 text-sm text-red-400">{error}</p>}
                <div className="col-span-2 flex gap-3 pt-2">
                    <button type="button" onClick={closeForm} className="flex-1 py-3 text-xs uppercase tracking-[0.12em] border border-white/15 text-[#F5EFE6]/50 hover:border-[#B8924A] hover:text-[#B8924A] transition-colors">Cancel</button>
                    <button type="submit" disabled={submitting || uploading} className="flex-1 py-3 text-xs uppercase tracking-[0.12em] bg-[#B8924A] text-[#100E0B] hover:bg-[#C9A45A] transition-colors disabled:opacity-50">
                    {submitting ? 'Saving…' : editTarget ? 'Save Changes' : 'Create'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
            {loading ? <p className="text-sm text-[#F5EFE6]/30">Loading…</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fragrances.map(f => (
                <div key={f._id} className="border border-white/10 p-4 flex flex-col gap-3 hover:border-white/20 transition-colors">
                    <div className="flex items-start justify-between">
                    <div>
                        <p className="font-[family-name:var(--font-display)] text-base">{f.emoji} {f.name}</p>
                        <p className="text-xs text-[#B8924A]">{f.category} · {f.duration}</p>
                    </div>
                    <span className={`text-[9px] uppercase tracking-[0.1em] px-2 py-1 border shrink-0 ${f.inStock ? 'border-emerald-500/30 text-emerald-400/60' : 'border-red-500/30 text-red-400/60'}`}>
                        {f.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    </div>
                    <p className="text-xs text-[#F5EFE6]/40 line-clamp-2">{f.description}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <p className="text-sm text-[#B8924A]">₦{f.pricePerMl?.toLocaleString()}/ml</p>
                    <div className="flex gap-4">
                        <button onClick={() => openEdit(f)} className="text-xs text-[#F5EFE6]/40 hover:text-[#B8924A] uppercase tracking-[0.1em] transition-colors">Edit</button>
                        <button onClick={() => handleDelete(f._id, f.name)} className="text-xs text-[#F5EFE6]/30 hover:text-red-400 uppercase tracking-[0.1em] transition-colors">Delete</button>
                    </div>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </main>
    )
}