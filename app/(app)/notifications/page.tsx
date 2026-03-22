'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Bell, Calendar, Star, Gift, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { fetchNotifications, markNotificationRead } from '@/lib/supabase'

type Notification = {
  id: string
  type: string
  title: string
  body: string | null
  read: boolean
  sent_at: string
  data: Record<string, unknown>
}

const TYPE_ICONS: Record<string, typeof Bell> = {
  booking: Calendar,
  promo: Gift,
  review: Star,
  system: Bell,
}

function timeAgo(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationsPage() {
  const router = useRouter()
  const { session } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!session?.access_token || !session?.user?.id) { setLoading(false); return }
    try {
      const data = await fetchNotifications(session.user.id, session.access_token)
      setNotifications(data)
    } catch { }
    setLoading(false)
  }, [session])

  useEffect(() => { load() }, [load])

  const handleMarkRead = async (id: string) => {
    if (!session?.access_token) return
    try {
      await markNotificationRead(id, session.access_token)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch { }
  }

  return (
    <div className="min-h-dvh bg-white pt-14 pb-24">
      <div className="px-5 flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-parties-text">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-[22px] font-bold text-parties-text">Notifications</h1>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-parties-soft animate-pulse" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-parties-soft flex items-center justify-center mb-4">
              <Bell size={28} className="text-parties-muted" />
            </div>
            <h3 className="text-lg font-semibold text-parties-text mb-1">All caught up</h3>
            <p className="text-sm text-parties-secondary">No new notifications.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => {
              const Icon = TYPE_ICONS[n.type] || Bell
              return (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={`flex gap-3.5 p-3.5 rounded-xl transition-all animate-fade-up ${
                    n.read ? 'bg-white' : 'bg-parties-accentMuted'
                  }`}
                  style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    n.read ? 'bg-parties-soft' : 'bg-parties-accent/10'
                  }`}>
                    <Icon size={18} className={n.read ? 'text-parties-muted' : 'text-parties-accent'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold ${n.read ? 'text-parties-secondary' : 'text-parties-text'}`}>
                      {n.title}
                    </h4>
                    {n.body && (
                      <p className="text-[12px] text-parties-muted mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-[11px] text-parties-muted mt-1">{timeAgo(n.sent_at)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-parties-accent mt-1.5 flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
