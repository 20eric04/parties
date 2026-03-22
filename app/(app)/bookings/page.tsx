'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Users, Clock, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { fetchUserBookings } from '@/lib/supabase'

type Booking = {
  id: string
  venue_id: number
  event_date: string
  party_size: number
  total: number
  status: string
  confirmation_code: string
  created_at: string
  guests: number
  vertical: string
  venues: { name: string; city: string; img_url: string }
  table_options: { name: string; is_vip: boolean } | null
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  confirmed: { bg: 'bg-green-50', text: 'text-green-600', label: 'Confirmed' },
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Pending' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-500', label: 'Cancelled' },
  checked_in: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Checked In' },
}

export default function BookingsPage() {
  const router = useRouter()
  const { session } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  const load = useCallback(async () => {
    if (!session?.access_token || !session?.user?.id) { setLoading(false); return }
    try {
      const data = await fetchUserBookings(session.user.id, session.access_token)
      setBookings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => { load() }, [load])

  const today = new Date().toISOString().split('T')[0]
  const upcoming = bookings.filter(b => b.event_date >= today && b.status !== 'cancelled')
  const past = bookings.filter(b => b.event_date < today || b.status === 'cancelled')
  const displayed = tab === 'upcoming' ? upcoming : past

  return (
    <div className="min-h-dvh bg-white pt-14 px-5 pb-24">
      <h1 className="text-[26px] font-bold text-parties-text mb-1">Bookings</h1>
      <p className="text-sm text-parties-secondary mb-5">Your reservations and past experiences.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['upcoming', 'past'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
              tab === t
                ? 'bg-parties-accent text-white'
                : 'bg-parties-soft text-parties-secondary'
            }`}
          >
            {t === 'upcoming' ? `Upcoming${upcoming.length > 0 ? ` (${upcoming.length})` : ''}` : 'Past'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1].map(i => <div key={i} className="h-28 rounded-2xl bg-parties-soft animate-pulse" />)}
        </div>
      ) : !session ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-parties-soft flex items-center justify-center mb-4">
            <Calendar size={28} className="text-parties-muted" />
          </div>
          <h3 className="text-lg font-semibold text-parties-text mb-1">Sign in to see bookings</h3>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-3 rounded-[14px] bg-parties-accent text-white font-bold text-sm"
          >
            Sign In
          </button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-parties-soft flex items-center justify-center mb-4">
            <Calendar size={28} className="text-parties-muted" />
          </div>
          <h3 className="text-lg font-semibold text-parties-text mb-1">
            {tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
          </h3>
          <p className="text-sm text-parties-secondary text-center max-w-[260px] mb-4">
            {tab === 'upcoming' ? 'Book a table to get started.' : 'Your past experiences will show here.'}
          </p>
          {tab === 'upcoming' && (
            <button
              onClick={() => router.push('/explore')}
              className="px-6 py-3 rounded-[14px] bg-parties-accent text-white font-bold text-sm"
            >
              Explore Venues
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map((b, i) => {
            const status = STATUS_STYLES[b.status] || STATUS_STYLES.pending
            const eventDate = new Date(b.event_date + 'T00:00:00')
            return (
              <div
                key={b.id}
                onClick={() => router.push(`/venue/${b.venue_id}`)}
                className="flex gap-3.5 p-3.5 rounded-2xl border border-black/[0.06] cursor-pointer transition-all hover:shadow-md animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <div className="w-[80px] h-[80px] rounded-xl overflow-hidden flex-shrink-0">
                  {b.venues?.img_url && (
                    <img src={b.venues.img_url} alt={b.venues.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-[15px] font-bold text-parties-text truncate pr-2">
                      {b.venues?.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${status.bg} ${status.text} flex-shrink-0`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-[12px] text-parties-secondary mb-1.5">
                    {b.table_options?.name || 'Table'} · {b.venues?.city}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-parties-muted flex items-center gap-1">
                      <Calendar size={11} /> {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[12px] text-parties-muted flex items-center gap-1">
                      <Users size={11} /> {b.guests || b.party_size}
                    </span>
                    <span className="text-[12px] font-bold text-parties-accent">
                      ${(b.total / 100).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-parties-muted mt-1 font-mono">
                    {b.confirmation_code}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
