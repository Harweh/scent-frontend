'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/CartContext'
import { apiFetch } from '@/lib/api'

const NIGERIAN_STATES = [
  'Lagos Island / VI / Ikoyi',
  'Lagos Mainland / Ikeja / Surulere',
  'Lagos Outskirts / Lekki / Ajah',
  'Ogun','Oyo','Osun','Ekiti','Ondo',
  'Rivers','Delta','Edo','Akwa Ibom','Bayelsa','Cross River',
  'Anambra','Imo','Enugu','Abia','Ebonyi',
  'Abuja (FCT)','Kano','Kaduna','Plateau','Benue','Kogi','Kwara','Niger','Nasarawa',
  'Sokoto','Zamfara','Yobe','Borno','Adamawa','Gombe','Bauchi','Taraba','Kebbi','Jigawa','Katsina',
]

const INTERNATIONAL = [
  'United Kingdom','United States','Canada','Germany','France',
  'Netherlands','UAE','South Africa','Ghana','Kenya',
]

// Jumia-style zone fees
const ZONE_FEES = {
  'Lagos Island / VI / Ikoyi':          1500,
  'Lagos Mainland / Ikeja / Surulere':  2000,
  'Lagos Outskirts / Lekki / Ajah':     2500,
  'Ogun': 3500, 'Oyo': 3500, 'Osun': 3500, 'Ekiti': 3500, 'Ondo': 3500,
  'Rivers': 4500, 'Delta': 4500, 'Edo': 4500, 'Akwa Ibom': 4500, 'Bayelsa': 4500, 'Cross River': 4500,
  'Anambra': 4500, 'Imo': 4500, 'Enugu': 4500, 'Abia': 4500, 'Ebonyi': 4500,
  'Abuja (FCT)': 5500, 'Kano': 5500, 'Kaduna': 5500, 'Plateau': 5500,
  'Benue': 5500, 'Kogi': 5500, 'Kwara': 5500, 'Niger': 5500, 'Nasarawa': 5500,
  'Sokoto': 6500, 'Zamfara': 6500, 'Yobe': 6500, 'Borno': 6500,
  'Adamawa': 6500, 'Gombe': 6500, 'Bauchi': 6500, 'Taraba': 6500,
  'Kebbi': 6500, 'Jigawa': 6500, 'Katsina': 6500,
  'United Kingdom': 25000, 'United States': 25000, 'Canada': 30000,
  'Germany': 30000, 'France': 30000, 'Netherlands': 30000,
  'UAE': 35000, 'South Africa': 20000, 'Ghana': 15000, 'Kenya': 20000,
}

const VAT_RATE = 0.075

function getDeliveryZone(state) {
  if (['United Kingdom','United States','Canada','Germany','France','Netherlands','UAE','South Africa','Ghana','Kenya'].includes(state))
    return 'international'
  if (state.includes('Lagos Island') || state.includes('VI') || state.includes('Ikoyi')) return 'local'
  if (state.includes('Lagos')) return 'local'
  return 'national'
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart()
  const router = useRouter()

  const [form, setForm] = useState({
    name: '', email: '', countryCode: '+234', phone: '',
    address: '', state: 'Lagos Mainland / Ikeja / Surulere', paymentMethod: 'cod',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  function update(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  const subtotal    = items.reduce((sum, i) => sum + i.pricePerMl * i.volume * i.qty, 0)
  const deliveryFee = ZONE_FEES[form.state] || 5500
  const vat         = Math.round(subtotal * VAT_RATE)
  const total       = subtotal + vat + deliveryFee
  const deliveryZone = getDeliveryZone(form.state)

  async function handleSubmit(e) {
    e.preventDefault()
    if (items.length === 0) { setError('Your cart is empty.'); return }
    const outOfStock = items.filter(i => i.inStock === false)
    if (outOfStock.length > 0) { setError(`Remove out of stock items: ${outOfStock.map(i => i.name).join(', ')}`); return }

    setSubmitting(true)
    setError('')

    const blendItem    = items.find(i => i.isBlend)
    const purchaseType = blendItem ? 'ai_match' : 'as_is'

    const notes = blendItem
      ? (blendItem.blendRecipe?.recipe || []).map(r => ({
          fragranceId: r.note, name: r.note, emoji: r.emoji || '🌿',
          role: r.role, pricePerMl: 1, mlUsed: r.volumeMl || r.volume || 2,
          percentage: r.percentageNum || r.percentage || 0,
        }))
      : items.map(item => ({
          fragranceId: item.fragranceId, name: item.name, emoji: item.emoji,
          pricePerMl: item.pricePerMl, mlUsed: item.volume * item.qty,
        }))

    const fragranceCost = blendItem?.pricing?.fragranceCost ?? subtotal

    try {
      const orderData = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseType, deliveryZone, notes, fragranceCost,
          vat, deliveryFee,
          paymentMethod:      form.paymentMethod,
          scentDescription:   blendItem?.scentDescription   || '',
          mixingInstructions: blendItem?.blendRecipe         || null,
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
        if (!payData.success) throw new Error(payData.message)
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
        <Link href="/catalog" className="text-xs uppercase tracking-[0.15em] text-[#B8924A] hover:underline">Browse Collection →</Link>
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

            {/* LEFT */}
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#F5EFE6]/40 mb-4">Contact Information</p>
                <div className="flex flex-col gap-3">
                  <input required placeholder="Full Name" value={form.name}
                    onChange={e => update('name', e.target.value)}
                    className="bg-white/5 border border-white/15 px-5 py-3.5 text-sm focus:outline-none focus:border-[#B8924A]" />
                  <input required type="email" placeholder="Email address" value={form.email}
                    onChange={e => update('email', e.target.value)}
                    className="bg-white/5 border border-white/15 px-5 py-3.5 text-sm focus:outline-none focus:border-[#B8924A]" />
                  <div className="flex gap-3">
                    <select value={form.countryCode} onChange={e => update('countryCode', e.target.value)}
                      className="bg-[#1C1813] border border-white/15 px-3 py-3.5 text-sm focus:outline-none focus:border-[#B8924A] w-32 shrink-0">
                      <option value="+234">🇳🇬 +234</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+233">🇬🇭 +233</option>
                      <option value="+27">🇿🇦 +27</option>
                      <option value="+254">🇰🇪 +254</option>
                    </select>
                    <input required type="tel" placeholder="Phone number" value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      className="flex-1 bg-white/5 border border-white/15 px-5 py-3.5 text-sm focus:outline-none focus:border-[#B8924A]" />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#F5EFE6]/40 mb-4">Delivery Address</p>
                <div className="flex flex-col gap-3">
                  <input required placeholder="Street address" value={form.address}
                    onChange={e => update('address', e.target.value)}
                    className="bg-white/5 border border-white/15 px-5 py-3.5 text-sm focus:outline-none focus:border-[#B8924A]" />
                  <select value={form.state} onChange={e => update('state', e.target.value)}
                    className="bg-[#1C1813] border border-white/15 px-5 py-3.5 text-sm focus:outline-none focus:border-[#B8924A]">
                    <optgroup label="── Lagos" className="bg-[#1C1813]">
                      {NIGERIAN_STATES.slice(0, 3).map(s => <option key={s} value={s} className="bg-[#1C1813]">{s}</option>)}
                    </optgroup>
                    <optgroup label="── Other Nigerian States" className="bg-[#1C1813]">
                      {NIGERIAN_STATES.slice(3).map(s => <option key={s} value={s} className="bg-[#1C1813]">{s}</option>)}
                    </optgroup>
                    <optgroup label="── International" className="bg-[#1C1813]">
                      {INTERNATIONAL.map(s => <option key={s} value={s} className="bg-[#1C1813]">{s}</option>)}
                    </optgroup>
                  </select>
                  <p className="text-xs text-[#F5EFE6]/30">
                    Delivery fee: <span className="text-[#B8924A]">₦{deliveryFee.toLocaleString()}</span>
                    {' · '}estimated 2–5 business days
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#F5EFE6]/40 mb-4">Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'cod',    label: 'Cash on Delivery', sub: 'Pay when it arrives' },
                    { value: 'online', label: 'Pay Online',       sub: 'Secure card payment' },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => update('paymentMethod', opt.value)}
                      className={`text-left p-4 border transition-colors
                        ${form.paymentMethod === opt.value ? 'border-[#B8924A] bg-[#B8924A]/10' : 'border-white/15 hover:border-[#B8924A]/50'}`}>
                      <p className={`text-sm font-medium mb-0.5 ${form.paymentMethod === opt.value ? 'text-[#B8924A]' : ''}`}>{opt.label}</p>
                      <p className="text-xs text-[#F5EFE6]/40">{opt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Order summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="border border-white/10 p-6">
                <h2 className="font-[family-name:var(--font-display)] text-xl mb-6">Order Summary</h2>

                <div className="flex flex-col gap-3 mb-6">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-[#F5EFE6]/60 flex items-center gap-2">
                        <span>{item.emoji}</span>
                        <span className="truncate max-w-[140px]">{item.name}</span>
                        {!item.isFlat && <span className="text-xs text-[#F5EFE6]/30">×{item.qty}</span>}
                      </span>
                      <span>₦{(item.pricePerMl * item.volume * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 flex flex-col gap-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#F5EFE6]/50">Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#F5EFE6]/50">VAT (7.5%)</span>
                    <span>₦{vat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#F5EFE6]/50">Delivery</span>
                    <span>₦{deliveryFee.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mb-6 flex justify-between items-center">
                  <span className="text-xs uppercase tracking-[0.15em] text-[#F5EFE6]/50">Total</span>
                  <span className="font-[family-name:var(--font-display)] text-2xl text-[#B8924A]">₦{total.toLocaleString()}</span>
                </div>

                {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

                <button type="submit" disabled={submitting}
                  className="w-full bg-[#B8924A] text-[#100E0B] py-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C9A45A] transition-colors disabled:opacity-50">
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