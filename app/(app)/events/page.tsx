'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Clock, Music, ChevronLeft, Star } from 'lucide-react'
import { fetchEvents } from '@/lib/supabase'

type EventData = {
  id: string
  name: string
  event_date: string
  doors_time: string
  dj: string | null
  theme: string | null
  img_url: string | null
  featured: boolean
  venue_id: number
  venues?: { name: string; city: string; metro: string; img_url: string }
}

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
      .then(data => setEvents(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-dvh bg-white pt-14 pb-24">
      <div className="px-5 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="text-parties-text">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-[26px] font-bold text-parties-text">Events</h1>
        </div>
        <p className="text-sm text-parties-secondary ml-[34px]">What's happening this week.</p>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-parties-soft animate-pulse h-[200px]" />
          ))
        ) : events.length > 0 ? (
          events.map((event, i) => (
            <div
              key={event.id}
              onClick={() => router.push(`/venue/${event.venue_id}`)}
              className="rounded-2xl overflow-hidden border border-black/[0.06] cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg animate-fade-up"
              style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
            >
              <div className="relative h-[160px]">
                <img
                  src={event.img_url || event.venues?.img_url || ''}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                {event.featured && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-parties-accent rounded-full flex items-center gap-1">
                    <Star size={10} className="text-white" fill="white" />
                    <span className="text-[10px] font-bold text-white">FEATURED</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-lg font-bold text-white mb-0.5">{event.name}</h3>
                  <p className="text-[13px] text-white/70 flex items-center gap-1">
                    <MapPin size={12} /> {event.venues?.name} · {event.venues?.city}
                  </p>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center gap-4 bg-white">
                <div className="flex items-center gap-1.5 text-[13px] text-parties-secondary">
                  <Calendar size={14} className="text-parties-accent" />
                  {formatEventDate(event.event_date)}
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-parties-secondary">
                  <Clock size={14} className="text-parties-accent" />
                  {event.doors_time}
                </div>
                {event.dj && (
                  <div className="flex items-center gap-1.5 text-[13px] text-parties-secondary">
                    <Music size={14} className="text-parties-accent" />
                    {event.dj}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-semibold text-parties-text mb-1">No upcoming events</h3>
            <p className="text-sm text-parties-secondary">Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
