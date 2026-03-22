'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Compass, Heart, Calendar, User } from 'lucide-react'

const TABS = [
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/saved', icon: Heart, label: 'Saved' },
  { href: '/bookings', icon: Calendar, label: 'Bookings' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // Hide tab bar on venue detail pages
  const hideTabBar = pathname.startsWith('/venue/')

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <main className="flex-1 pb-[88px]">
        {children}
      </main>

      {!hideTabBar && (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-gradient-to-t from-white via-white to-transparent pt-3 px-5 pb-7">
            <div className="flex justify-around items-center bg-white border border-black/[0.06] rounded-[20px] py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
              {TABS.map(tab => {
                const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
                return (
                  <button
                    key={tab.href}
                    onClick={() => router.push(tab.href)}
                    className="flex flex-col items-center gap-1 min-w-[60px]"
                  >
                    <tab.icon
                      size={22}
                      className={active ? 'text-parties-accent' : 'text-parties-muted'}
                      fill={active ? '#E8730C' : 'none'}
                    />
                    <span className={`text-[10px] font-semibold ${active ? 'text-parties-accent' : 'text-parties-muted'}`}>
                      {tab.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  )
}
