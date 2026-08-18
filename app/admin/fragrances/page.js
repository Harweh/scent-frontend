'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { apiFetch } from '@/lib/api'

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'aura-admin-2026'
const adminHeaders = () => ({ 'x-admin-secret': ADMIN_SECRET })
const CATEGORIES   = ['Floral', 'Woody', 'Fresh', 'Oriental', 'Citrus']
const DURATIONS    = ['Short', 'Medium', 'Long']
const emptyForm    = {
  name: '', category: 'Floral', description: '', duration: 'Medium',
  pricePerMl: '', imageUrl: '', subImages: [], color: '#B8924A', emoji: '🌸', inStock: true,
}

export default function AdminFragrancesPage() {
  const router = useRouter()
  const [fragrances,  setFragrances]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [form,        setForm]        = useState(emptyForm)
  const [submitting,  setSubmitting]  = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => {
    if (sessionStorage.getItem('aura_admin_authed') !== 'true') { router.push('/admin'); return }
    load()
  }, [])

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
    setForm({ ...f, pricePerMl: String(f.pricePerMl), subImages: f.subImages || [] })
    setError('')
    setShowForm(true)
  }
  function closeForm() { setShowForm(false); setEditTarget(null); setError('') }

  async function uploadImage(file) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const data = await apiFetch('/api/upload', { method: 'POST', headers: adminHeaders(), body: fd })
      if (!data.success) throw new Error(data.message || 'Upload failed')
      return data.url
    } finally {
      setUploading(false)
    }
  }

  async function handleMainImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadImage(file)
      setForm(prev => ({ ...prev, imageUrl: url }))
    } catch (err) { setError(err.message) }
  }

  async function handleSubImages(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    try {
      const urls = await Promise.all(files.map(uploadImage))
      setForm(prev => ({ ...prev, subImages: [...(prev.subImages || []), ...urls] }))
    } catch (err) { setError(err.message) }
  }

  function removeSubImage(index) {
    setForm(prev => ({ ...prev, subImages: prev.subImages.filter((_, i) => i !== index) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const payload = { ...form, pricePerMl: Number(form.pricePerMl) }
    try {
      if (editTarget) {
        const data = await apiFetch(`/api/fragrances/${editTarget._id}`, {
          method: 'PATCH',
          headers: { ...adminHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!data.success) throw new Error(data.message)
        setFragrances(prev => prev.map(f => f._id === editTarget._id ? data.data : f))
      } else {
        const data = await apiFetch('/api/fragrances', {
          method: 'POST',
          headers: { ...adminHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!data.success) throw new Error(data.message)
        setFragrances(prev => [data.data, ...prev])
      }
      closeForm()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  async function handleToggle(e, f) {
    e.stopPropagation()
    e.preventDefault()
    try {
      const data = await apiFetch(`/api/fragrances/${f._id}`, {
        method: 'PATCH',
        headers: { ...adminHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: !f.inStock }),
      })
      if (data.success) setFragrances(prev => prev.map(x => x._id === f._id ? data.data : x))
      else alert(data.message)
    } catch (err) { alert(err.message) }
  }

  async function handleDelete(e, id, name) {
    e.stopPropagation()
    e.preventDefault()
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const data = await apiFetch(`/api/fragrances/${id}`, { method: 'DELETE', headers: adminHeaders() })
      if (data.success) setFragrances(prev => prev.filter(f => f._id !== id))
      else alert(data.message)
    } catch (err) { alert(err.message) }
  }

  return (
    <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6]">
      <section className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
          <div className="flex gap-6 text-xs uppercase tracking-[0.15em] mb-6">
            <Link href="/admin" className="text-[#F5EFE6]/40 hover:text-[#B8924A]">Dashboard</Link>
            <Link href="/admin/orders" className="text-[#F5EFE6]/40 hover:text-[#B8924A]">Orders</Link>
            <Link href="/admin/customers" className="text-[#F5EFE6]/40 hover:text-[#B8924A]">Customers</Link>
            <span className="text-[#B8924A] border-b-2 border-[#B8924A] pb-1">Fragrances</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl">Fragrances</h1>
            <button onClick={openCreate}
              className="bg-[#B8924A] text-[#100E0B] px-5 py-2.5 text-xs uppercase tracking-[0.12em] hover:bg-[#C9A45A] transition-colors">
              + New
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1714] border border-white/10 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-display)] text-xl">
                {editTarget ? `Edit — ${editTarget.name}` : 'New Fragrance'}
              </h2>
              <button onClick={closeForm} className="text-[#F5EFE6]/40 hover:text-white text-2xl">×</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <textarea required rows={3} placeholder="Description" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A] resize-none" />

              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Price per ml (₦)" value={form.pricePerMl}
                  onChange={e => setForm({ ...form, pricePerMl: e.target.value })}
                  className="bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A]" />
                <input placeholder="Emoji" value={form.emoji}
                  onChange={e => setForm({ ...form, emoji: e.target.value })}
                  className="bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#B8924A]" />
              </div>

              {/* Main image upload */}
              <div>
                <p className="text-xs text-[#F5EFE6]/40 mb-2 uppercase tracking-[0.1em]">Main Image</p>
                <div className="flex items-center gap-4">
                  {form.imageUrl ? (
                    <div className="relative w-20 h-24 shrink-0 overflow-hidden border border-white/15">
                      <Image src={form.imageUrl} alt="Main" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-24 shrink-0 flex items-center justify-center bg-white/5 border border-white/15 text-3xl">
                      {form.emoji || '🌸'}
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleMainImage} disabled={uploading} className="hidden" />
                    <span className={`block text-center py-3 text-xs uppercase tracking-[0.12em] border transition-colors
                      ${uploading ? 'border-white/10 text-[#F5EFE6]/20' : 'border-white/15 text-[#F5EFE6]/50 hover:border-[#B8924A] hover:text-[#B8924A]'}`}>
                      {uploading ? 'Uploading…' : form.imageUrl ? 'Change Image' : 'Upload Image'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Sub images */}
              <div>
                <p className="text-xs text-[#F5EFE6]/40 mb-2 uppercase tracking-[0.1em]">
                  Additional Images <span className="text-[#F5EFE6]/20 normal-case tracking-normal">(shown in product gallery)</span>
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(form.subImages || []).map((url, i) => (
                    <div key={i} className="relative w-16 h-16 group">
                      <Image src={url} alt={`Sub ${i + 1}`} fill className="object-cover border border-white/15" />
                      <button type="button" onClick={() => removeSubImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        ×
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 flex items-center justify-center border border-dashed border-white/20 text-[#F5EFE6]/30 hover:border-[#B8924A] hover:text-[#B8924A] cursor-pointer transition-colors text-2xl">
                    <input type="file" accept="image/*" multiple onChange={handleSubImages} disabled={uploading} className="hidden" />
                    +
                  </label>
                </div>
              </div>

              {/* Stock toggle */}
              <div className="flex items-center justify-between border border-white/10 px-4 py-3">
                <div>
                  <p className="text-sm text-[#F5EFE6]/70">Stock Status</p>
                  <p className="text-xs text-[#F5EFE6]/30 mt-0.5">
                    {form.inStock
                      ? 'In Stock — customers can purchase'
                      : 'Out of Stock — visible but Add to Cart is disabled'}
                  </p>
                </div>
                <button type="button" onClick={() => setForm({ ...form, inStock: !form.inStock })}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${form.inStock ? 'bg-emerald-500' : 'bg-red-500/70'}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.inStock ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="flex-1 py-3 text-xs uppercase tracking-[0.12em] border border-white/15 text-[#F5EFE6]/50 hover:border-[#B8924A] hover:text-[#B8924A] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || uploading}
                  className="flex-1 py-3 text-xs uppercase tracking-[0.12em] bg-[#B8924A] text-[#100E0B] hover:bg-[#C9A45A] transition-colors disabled:opacity-50">
                  {submitting ? 'Saving…' : editTarget ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
        {loading ? (
          <p className="text-sm text-[#F5EFE6]/30">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fragrances.map(f => (
              <div key={f._id} className="border border-white/10 p-4 flex flex-col gap-3 hover:border-white/20 transition-colors">
                {/* Product image preview */}
                {f.imageUrl && (
                  <div className="relative w-full h-40 overflow-hidden bg-[#1C1813]">
                    <Image src={f.imageUrl} alt={f.name} fill className="object-cover object-center" />
                    {/* Out of stock overlay */}
                    {!f.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-xs uppercase tracking-[0.15em] text-red-400 border border-red-500/50 px-3 py-1">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-base">{f.emoji} {f.name}</p>
                    <p className="text-xs text-[#B8924A]">{f.category} · {f.duration}</p>
                  </div>
                  {/* Stock toggle on card */}
                  <button onClick={(e) => handleToggle(e, f)}
                    title={f.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 mt-1 ${f.inStock ? 'bg-emerald-500' : 'bg-red-500/70'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${f.inStock ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <p className="text-xs text-[#F5EFE6]/40 line-clamp-2">{f.description}</p>

                {/* Sub images preview */}
                {f.subImages?.length > 0 && (
                  <div className="flex gap-1.5">
                    {f.subImages.slice(0, 4).map((url, i) => (
                      <div key={i} className="relative w-8 h-8 overflow-hidden border border-white/10">
                        <Image src={url} alt="" fill className="object-cover" />
                      </div>
                    ))}
                    {f.subImages.length > 4 && (
                      <span className="text-xs text-[#F5EFE6]/30 self-center">+{f.subImages.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <p className="text-sm text-[#B8924A]">₦{f.pricePerMl?.toLocaleString()}/ml</p>
                  <div className="flex gap-4">
                    <button onClick={() => openEdit(f)}
                      className="text-xs text-[#F5EFE6]/40 hover:text-[#B8924A] uppercase tracking-[0.1em] transition-colors">
                      Edit
                    </button>
                    <button onClick={(e) => handleDelete(e, f._id, f.name)}
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
    </main>
  )
}