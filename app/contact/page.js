/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState } from 'react'

export default function ContactPage() {
    const [form, setForm]         = useState({ name: '', email: '', subject: '', message: '' })
    const [submitting, setSubmitting] = useState(false)
    const [sent, setSent]         = useState(false)
    const [error, setError]       = useState('')

    function update(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
        const res  = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.message || 'Failed to send')
        setSent(true)
        } catch (err) {
        setError(err.message)
        } finally {
        setSubmitting(false)
        }
    }

    return (
        <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6]">
        <section className="border-b border-white/10">
            <div className="max-w-2xl mx-auto px-6 sm:px-8 py-14 sm:py-20 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#B8924A] mb-3">We're here</p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl mb-4">Contact Us</h1>
            <p className="text-sm text-[#F5EFE6]/50 leading-relaxed">
                Questions about an order, a custom blend, or anything else — we respond within 24 hours.
            </p>
            </div>
        </section>

        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">

            {/* Form */}
            <div>
            {sent ? (
                <div className="text-center py-16">
                <p className="text-4xl mb-4">✉️</p>
                <p className="font-[family-name:var(--font-display)] text-2xl mb-2">Message sent</p>
                <p className="text-sm text-[#F5EFE6]/50">We'll get back to you within 24 hours.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input required placeholder="Your Name" value={form.name}
                    onChange={e => update('name', e.target.value)}
                    className="bg-white/5 border border-white/15 px-5 py-3.5 text-sm focus:outline-none focus:border-[#B8924A] transition-colors" />
                    <input required type="email" placeholder="Email Address" value={form.email}
                    onChange={e => update('email', e.target.value)}
                    className="bg-white/5 border border-white/15 px-5 py-3.5 text-sm focus:outline-none focus:border-[#B8924A] transition-colors" />
                </div>
                <select value={form.subject} onChange={e => update('subject', e.target.value)}
                    className="bg-[#1C1813] border border-white/15 px-5 py-3.5 text-sm focus:outline-none focus:border-[#B8924A] transition-colors">
                    <option value="">Select a subject</option>
                    <option value="Order Inquiry">Order Inquiry</option>
                    <option value="Custom Blend">Custom Blend</option>
                    <option value="Delivery Issue">Delivery Issue</option>
                    <option value="Return / Refund">Return / Refund</option>
                    <option value="General Question">General Question</option>
                </select>
                <textarea required rows={6} placeholder="Your message…" value={form.message}
                    onChange={e => update('message', e.target.value)}
                    className="bg-white/5 border border-white/15 px-5 py-4 text-sm focus:outline-none focus:border-[#B8924A] transition-colors resize-none" />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button type="submit" disabled={submitting}
                    className="bg-[#B8924A] text-[#100E0B] py-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C9A45A] transition-colors disabled:opacity-50">
                    {submitting ? 'Sending…' : 'Send Message'}
                </button>
                </form>
            )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-6">
            {[
                { label: 'Email', value: 'hello@auraluxe.com', icon: '✉️' },
                { label: 'WhatsApp', value: '+234 800 000 0000', icon: '💬' },
                { label: 'Studio Hours', value: 'Mon–Sat, 9am–6pm WAT', icon: '🕐' },
                { label: 'Location', value: 'Lagos, Nigeria', icon: '📍' },
            ].map(item => (
                <div key={item.label} className="flex gap-4 items-start">
                <span className="text-xl">{item.icon}</span>
                <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#B8924A] mb-1">{item.label}</p>
                    <p className="text-sm text-[#F5EFE6]/70">{item.value}</p>
                </div>
                </div>
            ))}

            <div className="border-t border-white/10 pt-6">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#B8924A] mb-3">Follow Us</p>
                <div className="flex gap-4 text-sm text-[#F5EFE6]/50">
                <a href="#" className="hover:text-[#B8924A] transition-colors">Instagram</a>
                <a href="#" className="hover:text-[#B8924A] transition-colors">Twitter</a>
                <a href="#" className="hover:text-[#B8924A] transition-colors">TikTok</a>
                </div>
            </div>
            </div>
        </div>
        </main>
    )
}