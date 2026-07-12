/* eslint-disable react/no-unescaped-entities */
// // app/customizer/page.js
// export default function CustomizerPage() {
//     return <div>Customizer page coming soon</div>
// }

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/CartContext'
import { apiFetch } from '@/lib/api'

const MOOD_PROMPTS = [
    'Confident and bold, ready to walk into any room',
    'Warm and cozy, like a candlelit evening at home',
    'Fresh and energized, like the first morning of spring',
    'Mysterious and seductive, for a night out in Lagos',
    ]

    const GENDER_OPTIONS = [
    { value: 'unisex', label: 'No Preference' },
    { value: 'female', label: 'Feminine' },
    { value: 'male',   label: 'Masculine' },
    ]

    const VOLUME_OPTIONS = [15, 30, 50, 100]

    export default function BespokeLabPage() {
    const { addItem } = useCart()
    const [step,        setStep]        = useState(1)
    const [description, setDescription] = useState('')
    const [gender,      setGender]      = useState('unisex')
    const [volume,      setVolume]      = useState(30)
    const [loading,     setLoading]     = useState(false)
    const [error,       setError]       = useState('')
    const [result,      setResult]      = useState(null)
    const [added,       setAdded]       = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        if (description.trim().length < 5) {
        setError('Tell us a little more about how you want to feel.')
        return
        }
        setError('')
        setLoading(true)
        try {
        const data  = await apiFetch('/api/ai/describe-match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: description.trim(), gender, volume }),
        })
        if (!data.success) throw new Error(data.message || 'Something went wrong')
        setResult(data)
        setStep(2)
        } catch (err) {
        setError(err.message)
        } finally {
        setLoading(false)
        }
    }

    function handleAddToCart() {
        if (!result) return

        // Add as ONE flat-priced cart item — no per-ml calculation needed
        // totalAmount already includes fragrance cost + mixing fee + vial
        const heart = result.mixingInstructions.recipe.find(f => f.role === 'Heart') || result.mixingInstructions.recipe[0]
        addItem({
        fragranceId:      `blend-${Date.now()}`,
        name:             result.perfumeName,
        emoji:            '🧪',
        color:            heart?.color || '#B8924A',
        imageUrl:         heart?.imageUrl || null,
        // Store total as flat price: pricePerMl=totalAmount, volume=1, qty=1
        // So cart total = totalAmount × 1 × 1 = totalAmount ✓
        pricePerMl:       result.pricing.totalAmount,
        volume:           1,
        qty:              1,
        inStock:          true,
        isBlend:          true,
        isFlat:           true,  // flag so cart knows not to show /ml
        blendRecipe:      result.mixingInstructions,
        scentDescription: result.scentDescription,
        // Store notes for the order
        blendNotes:       result.mixingInstructions.recipe,
        totalMl:          result.mixingInstructions.totalVolumeMl,
        })
        setAdded(true)
        setTimeout(() => setAdded(false), 2500)
    }

    function startOver() {
        setStep(1)
        setResult(null)
        setDescription('')
        setError('')
        setAdded(false)
    }

    return (
        <main className="bg-[#100E0B] min-h-screen text-[#F5EFE6]">

        {/* Header */}
        <section className="border-b border-white/10">
            <div className="max-w-3xl mx-auto px-6 sm:px-8 py-14 sm:py-20 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#B8924A] mb-3">Bespoke Lab</p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl leading-tight mb-4">
                Your Scent, <em className="italic text-[#B8924A]">Digitally Mastered</em>
            </h1>
            <p className="text-sm text-[#F5EFE6]/50 max-w-md mx-auto leading-relaxed">
                Describe how you want to feel. Our AI selects and blends real fragrance
                notes into one unique scent — made just for you.
            </p>
            </div>
        </section>

        {/* Step bar */}
        <div className="max-w-xs mx-auto px-6 flex items-center gap-3 py-6">
            <div className={`h-0.5 flex-1 transition-colors ${step >= 1 ? 'bg-[#B8924A]' : 'bg-white/10'}`} />
            <span className={`text-[10px] uppercase tracking-[0.15em] ${step === 1 ? 'text-[#B8924A]' : 'text-white/30'}`}>Describe</span>
            <div className={`h-0.5 flex-1 transition-colors ${step >= 2 ? 'bg-[#B8924A]' : 'bg-white/10'}`} />
            <span className={`text-[10px] uppercase tracking-[0.15em] ${step === 2 ? 'text-[#B8924A]' : 'text-white/30'}`}>Your Blend</span>
            <div className="h-0.5 flex-1 bg-white/10" />
        </div>

        {/* ── STEP 1: DESCRIBE ─────────────────────────────────── */}
        {step === 1 && (
            <section className="max-w-2xl mx-auto px-6 sm:px-8 pb-24">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                <div>
                <label className="text-xs uppercase tracking-[0.2em] text-[#F5EFE6]/40 mb-3 block">
                    How do you want to feel?
                </label>
                <textarea
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. Warm, confident, and a little mysterious — like rain on sun-warmed earth..."
                    className="w-full bg-white/5 border border-white/15 px-5 py-4 text-sm text-[#F5EFE6] placeholder-[#F5EFE6]/25 focus:outline-none focus:border-[#B8924A] transition-colors resize-none"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                    {MOOD_PROMPTS.map(p => (
                    <button key={p} type="button" onClick={() => setDescription(p)}
                        className="text-[10px] uppercase tracking-[0.1em] px-3 py-2 border border-white/10 text-[#F5EFE6]/40 hover:border-[#B8924A] hover:text-[#B8924A] transition-colors">
                        {p.length > 36 ? p.slice(0, 36) + '…' : p}
                    </button>
                    ))}
                </div>
                </div>

                <div>
                <label className="text-xs uppercase tracking-[0.2em] text-[#F5EFE6]/40 mb-3 block">
                    Scent Lean <span className="normal-case tracking-normal text-[#F5EFE6]/20">(optional)</span>
                </label>
                <div className="flex gap-3">
                    {GENDER_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setGender(opt.value)}
                        className={`flex-1 py-3 text-xs uppercase tracking-[0.12em] border transition-colors
                        ${gender === opt.value
                            ? 'bg-[#B8924A] border-[#B8924A] text-[#100E0B]'
                            : 'border-white/15 text-[#F5EFE6]/50 hover:border-[#B8924A] hover:text-[#B8924A]'}`}>
                        {opt.label}
                    </button>
                    ))}
                </div>
                </div>

                <div>
                <label className="text-xs uppercase tracking-[0.2em] text-[#F5EFE6]/40 mb-3 block">
                    Blend Size
                </label>
                <div className="flex gap-3">
                    {VOLUME_OPTIONS.map(size => (
                    <button key={size} type="button" onClick={() => setVolume(size)}
                        className={`flex-1 py-3 text-xs uppercase tracking-[0.12em] border transition-colors
                        ${volume === size
                            ? 'bg-[#B8924A] border-[#B8924A] text-[#100E0B]'
                            : 'border-white/15 text-[#F5EFE6]/50 hover:border-[#B8924A] hover:text-[#B8924A]'}`}>
                        {size}ml
                    </button>
                    ))}
                </div>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button type="submit" disabled={loading}
                className="w-full bg-[#B8924A] text-[#100E0B] py-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C9A45A] transition-colors disabled:opacity-50">
                {loading ? 'Crafting your blend…' : 'Create My Blend'}
                </button>

                {loading && (
                <div className="flex items-center justify-center gap-3 text-xs text-[#F5EFE6]/40">
                    <div className="w-3 h-3 border-2 border-[#B8924A] border-t-transparent rounded-full animate-spin" />
                    Selecting notes and blending your fragrance…
                </div>
                )}
            </form>
            </section>
        )}

        {/* ── STEP 2: RESULT ───────────────────────────────────── */}
        {step === 2 && result && (
            <section className="max-w-2xl mx-auto px-6 sm:px-8 pb-24">
            {(() => {
                const recipe = result.mixingInstructions.recipe
                const heart = recipe.find(f => f.role === 'Heart') || recipe[0]
                return (
                <>
                {/* Blend hero — image + name + description */}
                <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                    <div className="relative w-44 h-56 sm:w-52 sm:h-64 shrink-0 overflow-hidden bg-[#1C1813]">
                    {heart?.imageUrl ? (
                        <Image
                        src={heart.imageUrl}
                        alt={result.perfumeName}
                        fill
                        className="object-cover object-center"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl"
                        style={{ backgroundColor: heart?.color || '#1C1813' }}>
                        {heart?.emoji}
                        </div>
                    )}
                    {/* Colour bar showing the notes blended, weighted by their share */}
                    <div className="absolute inset-x-0 bottom-0 flex h-1.5">
                        {recipe.map((f, i) => (
                        <div key={i} style={{ backgroundColor: f.color || '#B8924A', flex: f.percentageNum }} />
                        ))}
                    </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#B8924A] mb-2">Your Bespoke Blend</p>
                    <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl italic mb-3">
                        {result.perfumeName}
                    </h2>
                    <p className="text-sm text-[#F5EFE6]/60 leading-relaxed mb-3">
                        {result.scentDescription}
                    </p>
                    </div>
                </div>

                {/* What's inside — customer-facing, no ratios */}
                <div className="border border-white/10 p-6 mb-6">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#F5EFE6]/40 mb-4">
                    What's Inside · {result.mixingInstructions.totalVolumeMl}ml Blend
                    </p>
                    <div className="flex flex-col gap-3">
                    {recipe.map((f, i) => (
                        <div key={i} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.color || '#B8924A' }} />
                        <span className="text-sm">{f.emoji} {f.note}</span>
                        <span className="text-xs text-[#F5EFE6]/30 ml-auto">{f.category}</span>
                        </div>
                    ))}
                    </div>
                    <p className="text-xs text-[#F5EFE6]/25 mt-4 pt-4 border-t border-white/5">
                    Expertly blended by our perfumers into a single {result.mixingInstructions.totalVolumeMl}ml signature vial.
                    </p>
                </div>
                </>
                )
            })()}

            {/* Pricing */}
            <div className="border border-white/10 p-6 mb-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#F5EFE6]/40 mb-4">Price</p>
                <div className="flex flex-col gap-2 text-sm mb-4">
                <div className="flex justify-between">
                    <span className="text-[#F5EFE6]/50">Fragrance blend ({result.mixingInstructions.totalVolumeMl}ml)</span>
                    <span>₦{result.pricing.fragranceCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[#F5EFE6]/50">Mixing & blending</span>
                    <span>₦{result.pricing.mixingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[#F5EFE6]/50">Vial & packaging</span>
                    <span>₦{result.pricing.vialCost.toLocaleString()}</span>
                </div>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <span className="text-xs uppercase tracking-[0.15em] text-[#F5EFE6]/50">Total</span>
                <span className="font-[family-name:var(--font-display)] text-2xl text-[#B8924A]">
                    ₦{result.pricing.totalAmount.toLocaleString()}
                </span>
                </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleAddToCart}
                className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-medium transition-colors
                    ${added ? 'bg-emerald-600 text-white' : 'bg-[#B8924A] text-[#100E0B] hover:bg-[#C9A45A]'}`}>
                {added ? '✓ Added to Cart' : 'Add Blend to Cart'}
                </button>
                <button onClick={startOver}
                className="flex-1 py-4 text-xs uppercase tracking-[0.2em] border border-white/20 hover:border-[#B8924A] hover:text-[#B8924A] transition-colors">
                Try Another Mood
                </button>
            </div>

            {added && (
                <div className="mt-4 text-center">
                <Link href="/cart" className="text-xs text-[#B8924A] hover:underline uppercase tracking-[0.15em]">
                    View Cart & Checkout →
                </Link>
                </div>
            )}
            </section>
        )}
        </main>
    )
}