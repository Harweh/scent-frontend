    'use client'

    import { useState, useEffect } from 'react'
    import { useRouter } from 'next/navigation'
    import Link from 'next/link'
    import { useCart } from '@/lib/CartContext'
    import { DELIVERY_FEES } from '@/lib/pricing'
    import { apiFetch } from '@/lib/api'

    const NIGERIAN_STATES = [
    'Lagos','Abuja (FCT)','Rivers','Kano','Oyo','Delta','Anambra','Ogun',
    'Kaduna','Imo','Enugu','Edo','Akwa Ibom','Osun','Kwara','Kogi','Benue',
    'Plateau','Ondo','Abia','Cross River','Bauchi','Gombe','Kebbi','Niger',
    'Sokoto','Taraba','Yobe','Zamfara','Jigawa','Nasarawa','Ebonyi','Bayelsa',
    'Adamawa','Ekiti',
    ]

    const INTERNATIONAL = [
    'United Kingdom','United States','Canada','Germany','France',
    'Netherlands','UAE','South Africa','Ghana','Kenya',
    ]

    function getDeliveryZone(state) {
    if (state === 'Lagos') return 'local'
    if (NIGERIAN_STATES.includes(state)) return 'national'
    return 'international'
    }

    export default function CheckoutPage() {
    const { items, clearCart } = useCart()
    const router = useRouter()

    const [form, setForm] = useState({
        name: '', email: '', countryCode: '+234', phone: '', address: '', state: 'Lagos', paymentMethod: 'cod',
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState('')
    const [deliveryCalc, setDeliveryCalc] = useState({
        fee: null, distanceKm: null, method: null, loading: false, error: '',
    })

    const subtotal     = items.reduce((sum, i) => sum + i.pricePerMl * i.volume * i.qty, 0)
    const deliveryZone = getDeliveryZone(form.state)
    // Use the live distance-based fee once calculated; fall back to the
    // flat zone rate while it's loading or if the calculation failed —
    // so checkout is never blocked by a geocoding/routing hiccup.
    const deliveryFee  = deliveryCalc.fee ?? DELIVERY_FEES[deliveryZone]
    const total        = subtotal + deliveryFee

    function update(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

    // Debounced live delivery fee lookup — fires ~800ms after the customer
    // stops typing their address or changes state, so we're not hammering
    // the geocoding API on every keystroke.
    useEffect(() => {
        if (!form.address.trim() || form.address.trim().length < 5) {
        setDeliveryCalc({ fee: null, distanceKm: null, method: null, loading: false, error: '' })
        return
        }

        const timer = setTimeout(async () => {
        setDeliveryCalc(prev => ({ ...prev, loading: true, error: '' }))
        try {
            const fullAddress = `${form.address}, ${form.state}${deliveryZone !== 'international' ? ', Nigeria' : ''}`
            const data = await apiFetch('/api/delivery-fee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: fullAddress, isInternational: deliveryZone === 'international' }),
            })
            if (data.success) {
            setDeliveryCalc({
                fee: data.fee,
                distanceKm: data.distanceKm ?? null,
                method: data.method,
                loading: false,
                error: '',
            })
            } else {
            throw new Error(data.message || 'Could not calculate delivery fee')
            }
        } catch (err) {
            // Fall back silently to the flat zone rate — deliveryFee above
            // already handles this via the ?? DELIVERY_FEES[deliveryZone] fallback
            setDeliveryCalc({ fee: null, distanceKm: null, method: null, loading: false, error: err.message })
        }
        }, 800)

        return () => clearTimeout(timer)
    }, [form.address, form.state])

    async function handleSubmit(e) {
        e.preventDefault()
        if (items.length === 0) { setError('Your cart is empty.'); return }

        const outOfStock = items.filter(i => i.inStock === false)
        if (outOfStock.length > 0) {
        setError(`Remove out of stock items before checking out: ${outOfStock.map(i => i.name).join(', ')}`)
        return
        }
        setSubmitting(true)
        setError('')

        const notes = items.map(item => ({
        fragranceId:  item.fragranceId,
        name:         item.name,
        emoji:        item.emoji,
        pricePerMl:   item.pricePerMl,
        mlUsed:       item.volume * item.qty,
        }))

        try {
        const orderData = await apiFetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            purchaseType: 'as_is',
            deliveryZone,
            notes,
            fragranceCost: subtotal,
            paymentMethod: form.paymentMethod,
            customer: {
                name:    form.name,
                address: `${form.address}, ${form.state}`,
                phone:   `${form.countryCode}${form.phone.replace(/^0+/, '')}`,
                email:   form.email,
            },
            }),
        })
        if (!orderData.success) throw new Error(orderData.message || 'Order failed')

        if (form.paymentMethod === 'online') {
            const payData = await apiFetch('/api/payment/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: orderData.data._id, email: form.email }),
            })
            if (!payData.success) throw new Error(payData.message || 'Payment initialization failed')
            clearCart()
            window.location.href = payData.authorizationUrl
        } else {
            clearCart()
            router.push(`/orders?email=${encodeURIComponent(form.email)}`)
        }
        } catch (err) {
        setError(err.message)
        setSubmitting(false)
        }
    }

    if (items.length === 0) return (
        <main className="bg-[#100E0B] text-[#F5EFE6] min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
            <p className="text-4xl mb-4">🛍️</p>
            <p className="font-[family-name:var(--font-display)] text-2xl mb-2">Your bag is empty</p>
            <Link href="/catalog" className="text-xs uppercase tracking-[0.15em] text-[#B8924A] hover:underline">
            Browse Collection →
            </Link>
        </div>
        </main>
    )

    return (
        <main className="bg-[#100E0B] text-[#F5EFE6] min-h-screen">
        <div className="border-b border-white/10">
            <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
            <p className="text-xs uppercase tracking-[0.25em] text-[#B8924A] mb-2">Almost there</p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl">Checkout</h1>
            </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10">
            <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">

                {/* LEFT — Form */}
                <div className="flex flex-col gap-8">

                {/* Contact */}
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#F5EFE6]/40 mb-4">Contact Information</p>
                    <div className="flex flex-col gap-3">
                    <input
                        required placeholder="Full Name"
                        value={form.name} onChange={e => update('name', e.target.value)}
                        className="bg-white/5 border border-white/15 px-5 py-3.5 text-sm focus:outline-none focus:border-[#B8924A] transition-colors"
                    />
                    <input
                        required type="email" placeholder="Email address"
                        value={form.email} onChange={e => update('email', e.target.value)}
                        className="bg-white/5 border border-white/15 px-5 py-3.5 text-sm focus:outline-none focus:border-[#B8924A] transition-colors"
                    />
                    <div className="flex gap-3">
                        <select
                        value={form.countryCode} onChange={e => update('countryCode', e.target.value)}
                        className="bg-[#1C1813] border border-white/15 px-3 py-3.5 text-sm focus:outline-none focus:border-[#B8924A] transition-colors w-32 shrink-0"
                        >
                        <option value="+234">🇳🇬 +234</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+233">🇬🇭 +233</option>
                        <option value="+27">🇿🇦 +27</option>
                        <option value="+254">🇰🇪 +254</option>
                        </select>
                        <input
                        required type="tel" placeholder="Phone number"
                        value={form.phone} onChange={e => update('phone', e.target.value)}
                        className="flex-1 bg-white/5 border border-white/15 px-5 py-3.5 text-sm focus:outline-none focus:border-[#B8924A] transition-colors"
                        />
                    </div>
                    </div>
                </div>

                {/* Delivery */}
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#F5EFE6]/40 mb-4">Delivery Address</p>
                    <div className="flex flex-col gap-3">
                    <input
                        required placeholder="Street address"
                        value={form.address} onChange={e => update('address', e.target.value)}
                        className="bg-white/5 border border-white/15 px-5 py-3.5 text-sm focus:outline-none focus:border-[#B8924A] transition-colors"
                    />
                    <select
                        value={form.state} onChange={e => update('state', e.target.value)}
                        className="bg-[#1C1813] border border-white/15 px-5 py-3.5 text-sm focus:outline-none focus:border-[#B8924A] transition-colors"
                    >
                        <optgroup label="── Nigeria" className="bg-[#1C1813]">
                        {NIGERIAN_STATES.map(s => (
                            <option key={s} value={s} className="bg-[#1C1813]">{s}</option>
                        ))}
                        </optgroup>
                        <optgroup label="── International" className="bg-[#1C1813]">
                        {INTERNATIONAL.map(s => (
                            <option key={s} value={s} className="bg-[#1C1813]">{s}</option>
                        ))}
                        </optgroup>
                    </select>
                    <p className="text-xs text-[#F5EFE6]/30">
                        Delivery zone: <span className="text-[#B8924A] capitalize">{deliveryZone}</span>
                        {' · '}
                        {deliveryCalc.loading ? (
                        <span className="text-[#F5EFE6]/40">Calculating…</span>
                        ) : (
                        <>
                            ₦{deliveryFee.toLocaleString()} fee
                            {deliveryCalc.distanceKm != null && (
                            <span className="text-[#F5EFE6]/30"> ({deliveryCalc.distanceKm}km {deliveryCalc.method === 'driving' ? 'drive' : 'away'})</span>
                            )}
                            {deliveryCalc.fee == null && form.address.trim().length >= 5 && (
                            <span className="text-[#F5EFE6]/20"> · standard rate</span>
                            )}
                        </>
                        )}
                    </p>
                    </div>
                </div>

                {/* Payment method */}
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#F5EFE6]/40 mb-4">Payment Method</p>
                    <div className="grid grid-cols-2 gap-3">
                    {[
                        { value: 'cod',    label: 'Cash on Delivery', sub: 'Pay when it arrives' },
                        { value: 'online', label: 'Pay Online',       sub: 'Secure card payment' },
                    ].map(opt => (
                        <button
                        key={opt.value}
                        type="button"
                        onClick={() => update('paymentMethod', opt.value)}
                        className={`text-left p-4 border transition-colors
                            ${form.paymentMethod === opt.value
                            ? 'border-[#B8924A] bg-[#B8924A]/10'
                            : 'border-white/15 hover:border-[#B8924A]/50'
                            }`}
                        >
                        <p className={`text-sm font-medium mb-0.5 ${form.paymentMethod === opt.value ? 'text-[#B8924A]' : ''}`}>
                            {opt.label}
                        </p>
                        <p className="text-xs text-[#F5EFE6]/40">{opt.sub}</p>
                        </button>
                    ))}
                    </div>
                </div>
                </div>

                {/* RIGHT — Order summary */}
                <div className="lg:sticky lg:top-24 h-fit">
                <div className="border border-white/10 p-6">
                    <h2 className="font-[family-name:var(--font-display)] text-xl mb-6">Your Order</h2>

                    {/* Items */}
                    <div className="flex flex-col gap-3 mb-6">
                    {items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-[#F5EFE6]/60 flex items-center gap-2">
                            <span>{item.emoji}</span>
                            <span>{item.name}</span>
                            <span className="text-xs text-[#F5EFE6]/30">×{item.qty}</span>
                        </span>
                        <span>₦{(item.pricePerMl * item.volume * item.qty).toLocaleString()}</span>
                        </div>
                    ))}
                    </div>

                    {/* Pricing breakdown */}
                    <div className="border-t border-white/10 pt-4 flex flex-col gap-2 text-sm mb-4">
                    <div className="flex justify-between">
                        <span className="text-[#F5EFE6]/50">Subtotal</span>
                        <span>₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[#F5EFE6]/50">Delivery ({deliveryZone})</span>
                        <span>₦{deliveryFee.toLocaleString()}</span>
                    </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 mb-6 flex justify-between items-center">
                    <span className="text-xs uppercase tracking-[0.15em] text-[#F5EFE6]/50">Total</span>
                    <span className="font-[family-name:var(--font-display)] text-2xl text-[#B8924A]">
                        ₦{total.toLocaleString()}
                    </span>
                    </div>

                    {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

                    <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#B8924A] text-[#100E0B] py-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C9A45A] transition-colors disabled:opacity-50"
                    >
                    {submitting ? 'Placing Order…' : form.paymentMethod === 'online' ? 'Pay Now' : 'Place Order'}
                    </button>

                    <Link href="/cart" className="block text-center mt-3 text-xs text-[#F5EFE6]/30 hover:text-[#B8924A] transition-colors">
                    ← Edit Cart
                    </Link>
                </div>
                </div>
            </div>
            </form>
        </div>
        </main>
    )
}