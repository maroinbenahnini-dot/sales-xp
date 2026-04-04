import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({ variable: '--font-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SalesXP — Maîtrise la vente complexe',
  description: 'RPG de carrière commerciale pour Sales ESN',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-full antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
