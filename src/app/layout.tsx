import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { CartProvider } from '@/context/CartContext'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mohamed Store | متجر محمد',
  description: 'متجر إلكتروني حديث بأفضل المنتجات وأسعار لا تُقاوم',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={cairo.className}>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                {children}
                <Toaster
                  position="top-center"
                  toastOptions={{
                    style: {
                      fontFamily: 'Cairo, sans-serif',
                      fontWeight: '700',
                      borderRadius: '12px',
                    }
                  }}
                />
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
