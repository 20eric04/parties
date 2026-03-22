'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, User, Bell, Heart, Calendar, Settings, Shield } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function ProfilePage() {
  const router = useRouter()
  const { session, signOut } = useAuth()
  const userName = (session?.user?.user_metadata?.name as string) || (session?.user?.user_metadata?.full_name as string) || 'Guest'

  const handleSignOut = async () => {
    await signOut()
    router.replace('/')
  }

  return (
    <div className="min-h-dvh bg-white pt-14">
      {/* Header */}
      <div className="px-5 flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-parties-text text-[15px]">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-[17px] font-bold text-parties-text">Profile</h2>
        <div className="w-[44px]" />
      </div>

      {/* Profile card */}
      <div className="mx-5 bg-parties-dark rounded-[20px] p-6 relative overflow-hidden mb-6">
        <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-parties-accent/10" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-parties-accent to-parties-accentHover flex items-center justify-center">
            <User size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{userName}</h2>
            <p className="text-[13px] text-white/40">
              {session?.user?.email || 'Member since 2026'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4 relative z-10">
          {[
            { v: '0', l: 'Bookings' },
            { v: '$0', l: 'Credits' },
            { v: '—', l: 'Tier' },
          ].map(s => (
            <div key={s.l} className="flex-1 bg-white/[0.06] rounded-xl py-2.5 px-3 text-center">
              <p className="text-xl font-bold text-white">{s.v}</p>
              <p className="text-[11px] text-white/40">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-5">
        <p className="text-[11px] font-bold text-parties-muted tracking-widest uppercase mb-3 pl-1">
          Account
        </p>
        {[
          { icon: User, label: 'Edit Profile', href: '/profile/edit' },
          { icon: Bell, label: 'Notifications', href: '/notifications' },
          { icon: Heart, label: 'Saved Venues', href: '/saved' },
          { icon: Calendar, label: 'My Bookings', href: '/bookings' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => router.push(item.href)}
            className="w-full flex items-center gap-3.5 py-4 px-1 border-b border-black/[0.06]"
          >
            <div className="w-[38px] h-[38px] rounded-[10px] bg-parties-soft flex items-center justify-center">
              <item.icon size={18} className="text-parties-secondary" />
            </div>
            <span className="flex-1 text-[15px] font-medium text-parties-text text-left">
              {item.label}
            </span>
            <ChevronRight size={18} className="text-parties-muted" />
          </button>
        ))}

        <p className="text-[11px] font-bold text-parties-muted tracking-widest uppercase mt-6 mb-3 pl-1">
          Preferences
        </p>
        {[
          { icon: Settings, label: 'Settings', href: '/settings' },
          { icon: Shield, label: 'Privacy & Security', href: '/settings' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => router.push(item.href)}
            className="w-full flex items-center gap-3.5 py-4 px-1 border-b border-black/[0.06]"
          >
            <div className="w-[38px] h-[38px] rounded-[10px] bg-parties-soft flex items-center justify-center">
              <item.icon size={18} className="text-parties-secondary" />
            </div>
            <span className="flex-1 text-[15px] font-medium text-parties-text text-left">
              {item.label}
            </span>
            <ChevronRight size={18} className="text-parties-muted" />
          </button>
        ))}

        <button
          onClick={handleSignOut}
          className="w-full mt-8 py-4 rounded-[14px] border border-red-500/30 text-[#FF3B30] text-[15px] font-semibold"
        >
          Sign Out
        </button>

        <p className="text-center mt-6 mb-10 text-xs text-parties-muted">
          Parties v1.0.0
        </p>
      </div>
    </div>
  )
}
