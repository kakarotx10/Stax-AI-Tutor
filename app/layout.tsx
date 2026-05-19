import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navigation from '@/components/Navigation'

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const serif = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  axes: ['opsz'],
})

export const metadata: Metadata = {
  title: 'AI Tutor - Gamified CS Learning Platform',
  description: 'Next-generation AI-powered, gamified Computer Science learning platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${sans.variable} ${serif.variable} ${sans.className} overflow-x-hidden`}>
        <Navigation />
        <div className="pt-16 overflow-x-hidden">
          {children}
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 18px 60px rgba(0,0,0,0.28)',
            },
          }}
        />
      </body>
    </html>
  )
}

