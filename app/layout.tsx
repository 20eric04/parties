import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Parties — Tables. Dining. Cars. Jets. Hotels.',
  description: 'The all-in-one luxury lifestyle booking app.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0A0A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body bg-parties-dark min-h-dvh">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
