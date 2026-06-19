import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IT Update - Work Tracker',
  description: 'IT Department work tracking and management system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <main className="md:pl-56 min-h-screen">
            <div className="p-6 max-w-7xl mx-auto pt-14 md:pt-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
