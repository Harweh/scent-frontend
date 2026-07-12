import { Playfair_Display, Inter } from 'next/font/google'
import { BRAND_NAME } from '@/lib/brand'
import { CartProvider } from '@/lib/CartContext'
import Navbar from '@/components/Navbar'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-display', 
  display: 'swap' 
})

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-body', 
  display: 'swap' 
})

export const metadata = {
  title: BRAND_NAME,
  description: 'Artisan fragrances, curated and custom-blended. Lagos.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-[#100E0B] text-[#F5EFE6] font-[family-name:var(--font-body)] antialiased">
        <CartProvider>
          <Navbar />
          {children}
        </CartProvider>
      </body>
    </html>
  )
}