'use client'

import Link from 'next/link'
import { useCart } from '@/lib/CartContext'

export default function CartPage() {
    const { items, removeItem, updateQty, clearCart } = useCart()

    const subtotal = items.reduce((sum, i) => sum + i.pricePerMl * i.volume * i.qty, 0)

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
            <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8 flex items-center justify-between">
            <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#B8924A] mb-2">Your Selection</p>
                <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl">Cart</h1>
            </div>
            <button
                onClick={clearCart}
                className="text-xs uppercase tracking-[0.15em] text-[#F5EFE6]/40 hover:text-[#B8924A] transition-colors"
            >
                Clear Cart
            </button>
            </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">

            {/* LEFT — Item list */}
            <div className="flex flex-col gap-4">
                {items.map((item, i) => (
                <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 border border-white/10 p-4 sm:p-5"
                >
                    {/* Image / emoji */}
                    <div
                    className="w-16 h-16 shrink-0 flex items-center justify-center text-3xl rounded-sm"
                    style={{ backgroundColor: (item.color || '#B8924A') + '20' }}
                    >
                    {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-sm" />
                    ) : (
                        <span>{item.emoji || '🌸'}</span>
                    )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                    <p className="font-[family-name:var(--font-display)] text-lg truncate">{item.name}</p>
                    <p className="text-xs text-[#F5EFE6]/40 mt-1">
                        {item.isFlat ? 'Custom Blend' : `${item.volume}ml`}
                        {item.inStock === false && (
                        <span className="text-red-400 ml-2">Out of stock</span>
                        )}
                    </p>
                    {item.scentDescription && (
                        <p className="text-xs text-[#F5EFE6]/30 mt-2 line-clamp-2">{item.scentDescription}</p>
                    )}
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-3 border border-white/15 px-3 py-2 self-start sm:self-center">
                    <button
                        onClick={() => updateQty(i, item.qty - 1)}
                        className="text-[#F5EFE6]/60 hover:text-[#B8924A] transition-colors w-4 text-center"
                        aria-label="Decrease quantity"
                    >
                        −
                    </button>
                    <span className="text-sm w-4 text-center">{item.qty}</span>
                    <button
                        onClick={() => updateQty(i, item.qty + 1)}
                        className="text-[#F5EFE6]/60 hover:text-[#B8924A] transition-colors w-4 text-center"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>
                    </div>

                    {/* Price + remove */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1 sm:w-24 shrink-0">
                    <span className="text-sm font-medium">
                        ₦{(item.pricePerMl * item.volume * item.qty).toLocaleString()}
                    </span>
                    <button
                        onClick={() => removeItem(i)}
                        className="text-xs text-[#F5EFE6]/30 hover:text-red-400 transition-colors"
                        aria-label="Remove item"
                    >
                        Remove
                    </button>
                    </div>
                </div>
                ))}
            </div>

            {/* RIGHT — Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
                <div className="border border-white/10 p-6">
                <h2 className="font-[family-name:var(--font-display)] text-xl mb-6">Summary</h2>

                <div className="border-t border-white/10 pt-4 mb-6 flex justify-between items-center">
                    <span className="text-xs uppercase tracking-[0.15em] text-[#F5EFE6]/50">Subtotal</span>
                    <span className="font-[family-name:var(--font-display)] text-2xl text-[#B8924A]">
                    ₦{subtotal.toLocaleString()}
                    </span>
                </div>

                <p className="text-xs text-[#F5EFE6]/30 mb-6">
                    Delivery fees are calculated at checkout based on your location.
                </p>

                <Link
                    href="/checkout"
                    className="block text-center w-full bg-[#B8924A] text-[#100E0B] py-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C9A45A] transition-colors"
                >
                    Proceed to Checkout
                </Link>

                <Link
                    href="/catalog"
                    className="block text-center mt-3 text-xs text-[#F5EFE6]/30 hover:text-[#B8924A] transition-colors"
                >
                    ← Continue Shopping
                </Link>
                </div>
            </div>

            </div>
        </div>
        </main>
    )
}