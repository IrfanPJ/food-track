import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Green Power Gym – Stronger Every Day',
  description: 'Professional Gym ERP & CRM for managing members, memberships, payments, and more.',
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  themeColor: '#22c55e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-[#0f172a] text-[#f8fafc] antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
