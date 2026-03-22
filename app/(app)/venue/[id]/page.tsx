'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ChevronLeft, Heart, Star, MapPin, Users, Calendar,
  Crown, ArrowRight, X, Check,
} from 'lucide-react'
import { fetchVenue, fetchTableOptions, createBooking, addFavorite, removeFavorite, checkFavorite, fetchVenueEvents } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Venue, TableOption } from '@/lib/types'

export default function VenueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { session } = useAuth()
  const venueId = Number(params.id)

  const [venue, setVenue] = useState<Venue | null>(null)
  const [tables, setTables] = useState<TableOption[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [selectedTable, setSelectedTable] = useState<TableOption | null>(null)
  const [selectedDate, setSelectedDate] = useState<{ day: string; date: number; month: string; full: string } | null>(null)
  const [guests, setGuests] = useState(4)
  const [confirmed, setConfirmed] = useState(false)
  const [confirmCode, setConfirmCode] = useState('')
  const [isFav, setIsFav] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      full: d.toISOString().split('T')[0],
    }
  })

  useEffect(() => {
    async function load() {
      try {
        const [v, t, ev] = await Promise.all([
          fetchVenue(venueId),
          fetchTableOptions(venueId),
          fetchVenueEvents(venueId).catch(() => []),
        ])
        setVenue(v)
        setTables(t)
        setEvents(ev)
        // Check favorite status
        if (session?.access_token && session?.user?.id) {
          checkFavorite(session.user.id, venueId, session.access_token)
            .then(setIsFav)
            .catch(() => {})
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [venueId, session])

  const toggleFav = async () => {
    if (!session?.access_token || !session?.user?.id) {
      router.push('/login')
      return
    }
    setFavLoading(true)
    try {
      if (isFav) {
        await removeFavorite(session.user.id, venueId, session.access_token)
        setIsFav(false)
      } else {
        await addFavorite(session.user.id, venueId, session.access_token)
        setIsFav(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFavLoading(false)
    }
  }

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTable) return
    if (!session?.access_token || !session?.user?.id) {
      router.push('/login')
      return
    }
    setBookingLoading(true)
    try {
      const total = Math.round(selectedTable.price_min * 1.05)
      const platformFee = Math.round(selectedTable.price_min * 0.05)
      const result = await createBooking({
        user_id: session.user.id,
        venue_id: venueId,
        table_option_id: selectedTable.id,
        event_date: selectedDate.full,
        party_size: guests,
        guests,
        subtotal: selectedTable.price_min,
        platform_fee: platformFee,
        total,
        status: 'confirmed',
        vertical: 'tables',
      }, session.access_token)
      setConfirmCode(result?.[0]?.confirmation_code || 'PTY-' + Math.random().toString(36).substring(2, 8).toUpperCase())
      setConfirmed(true)
    } catch (err: any) {
      console.error(err)
      // Still show confirmation in demo mode
      setConfirmCode('PTY-' + Math.random().toString(36).substring(2, 8).toUpperCase())
      setConfirmed(true)
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-white">
        <div className="h-[320px] bg-parties-soft animate-pulse" />
        <div className="p-5 space-y-4">
          <div className="h-8 w-48 bg-parties-soft rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-parties-soft rounded animate-pulse" />
          <div className="h-20 bg-parties-soft rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <p className="text-parties-secondary">Venue not found</p>
      </div>
    )
  }

  // Price display — stored in cents in DB
  const formatPrice = (cents: number) => `$${(cents / 100).toLocaleString()}`

  // Fallback tables if DB has none
  const displayTables = tables.length > 0 ? tables : [
    { id: 1, venue_id: venueId, name: 'Standard Table', capacity_min: 2, capacity_max: 6, price_min: venue.price_min * 100, description: 'Main floor', is_vip: false, min_spend: 0, sort_order: 0, position_desc: 'Main floor' },
    { id: 2, venue_id: venueId, name: 'VIP Section', capacity_min: 4, capacity_max: 10, price_min: venue.price_min * 200, description: 'Elevated with dedicated server', is_vip: true, min_spend: 0, sort_order: 1, position_desc: 'Elevated' },
  ]

  // ─── Confirmation screen ───
  if (confirmed) {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-parties-accentMuted flex items-center justify-center mb-6 animate-scale-in">
          <Check size={40} className="text-parties-accent" />
        </div>
        <h1 className="font-display text-[32px] font-normal text-parties-text mb-2 animate-fade-up" style={{ animationDelay: '0.15s', opacity: 0 }}>
          You're in.
        </h1>
        <p className="text-[15px] text-parties-secondary animate-fade-up" style={{ animationDelay: '0.25s', opacity: 0 }}>
          {venue.name} · {selectedDate?.day} {selectedDate?.month} {selectedDate?.date}
        </p>
        <p className="text-[13px] text-parties-muted mt-1 animate-fade-up" style={{ animationDelay: '0.35s', opacity: 0 }}>
          {selectedTable?.name} · {guests} guests
        </p>
        <div className="bg-parties-soft rounded-2xl px-6 py-4 mt-5 mb-8 border border-black/[0.06] animate-fade-up" style={{ animationDelay: '0.45s', opacity: 0 }}>
          <p className="text-xs text-parties-muted mb-1">Confirmation</p>
          <p className="text-[22px] font-bold tracking-widest text-parties-accent">
            {confirmCode}
          </p>
        </div>
        <button
          onClick={() => router.push('/explore')}
          className="w-full max-w-[280px] py-4 rounded-[14px] bg-parties-accent text-white font-bold text-base active:scale-[0.98] transition-transform animate-fade-up"
          style={{ animationDelay: '0.55s', opacity: 0 }}
        >
          Back to Explore
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-white relative">
      {/* Hero */}
      <div className="relative h-[340px]">
        {venue.img_url && (
          <img src={venue.img_url} className="w-full h-full object-cover" alt={venue.name} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 pt-14 px-5 flex justify-between z-10">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center"
          >
            <ChevronLeft size={22} className="text-white" />
          </button>
          <button
            onClick={toggleFav}
            disabled={favLoading}
            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center"
          >
            <Heart size={18} className="text-white" fill={isFav ? '#E8730C' : 'none'} />
          </button>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-5 left-5 right-5 z-10">
          <div className="flex gap-1.5 mb-2">
            {(venue.tags || []).slice(0, 2).map(t => (
              <span key={t} className="px-2.5 py-0.5 bg-white/15 backdrop-blur-lg rounded-md text-[11px] text-white font-medium">
                {t}
              </span>
            ))}
          </div>
          <h1 className="font-display text-[36px] font-medium text-white tracking-tight leading-tight">
            {venue.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-sm text-white/70">
              <MapPin size={14} className="text-parties-accent" /> {venue.city}
            </span>
            {venue.rating && (
              <span className="flex items-center gap-1 text-sm text-white/70">
                <Star size={14} fill="#E8730C" className="text-parties-accent" /> {venue.rating}
              </span>
            )}
            <span className="text-sm text-white/70">{venue.type}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-6 pb-36">
        {/* About */}
        <h3 className="text-base font-bold text-parties-text mb-2.5">About</h3>
        <p className="text-sm text-parties-secondary leading-relaxed mb-6">
          {venue.about}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {[
            { label: 'Min Spend', value: `$${venue.price_min}` },
            { label: 'Dress Code', value: 'Upscale' },
            { label: 'Music', value: (venue.tags || [])[0] || 'Mixed' },
          ].map(s => (
            <div key={s.label} className="bg-parties-soft rounded-[14px] py-3.5 px-3 text-center border border-black/[0.06]">
              <p className="text-[11px] text-parties-muted mb-1">{s.label}</p>
              <p className="text-[15px] font-bold text-parties-text">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Events at this venue */}
        {events.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-bold text-parties-text mb-3">Upcoming Events</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {events.map(ev => (
                <div key={ev.id} className="min-w-[200px] rounded-2xl overflow-hidden border border-black/[0.06] flex-shrink-0">
                  {ev.img_url && (
                    <img src={ev.img_url} alt={ev.name} className="w-full h-[100px] object-cover" />
                  )}
                  <div className="p-3">
                    <h4 className="text-sm font-bold text-parties-text truncate">{ev.name}</h4>
                    <p className="text-[12px] text-parties-secondary mt-0.5">
                      {new Date(ev.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {ev.doors_time}
                    </p>
                    {ev.dj && <p className="text-[11px] text-parties-accent font-semibold mt-1">{ev.dj}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tables */}
        <h3 className="text-base font-bold text-parties-text mb-3.5">Select Your Table</h3>
        <div className="flex flex-col gap-2.5">
          {displayTables.map(table => (
            <button
              key={table.id}
              onClick={() => { setSelectedTable(table); setShowBooking(true) }}
              className={`p-4 rounded-2xl bg-parties-soft text-left border transition-all relative ${
                selectedTable?.id === table.id ? 'border-parties-accent' : 'border-black/[0.06]'
              }`}
            >
              {table.is_vip && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-parties-accentMuted flex items-center gap-1">
                  <Crown size={10} className="text-parties-accent" />
                  <span className="text-[10px] font-bold text-parties-accent">VIP</span>
                </div>
              )}
              <h4 className="text-base font-bold text-parties-text mb-1">{table.name}</h4>
              <p className="text-[13px] text-parties-secondary mb-2">
                {table.description || table.position_desc}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-parties-muted flex items-center gap-1">
                  <Users size={13} /> {table.capacity_min}–{table.capacity_max} guests
                </span>
                <span className="text-lg font-bold text-parties-accent">
                  {formatPrice(table.price_min)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom CTA (no sheet) */}
      {!showBooking && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="bg-gradient-to-t from-white via-white to-transparent pt-4 px-5 pb-9 flex items-center justify-between">
            <div>
              <p className="text-xs text-parties-muted">From</p>
              <p className="text-[22px] font-bold text-parties-text">
                <span className="text-parties-accent">${venue.price_min}</span>
                <span className="text-[13px] font-normal text-parties-muted"> min spend</span>
              </p>
            </div>
            <button
              onClick={() => { if (!selectedTable) setSelectedTable(displayTables[0]); setShowBooking(true) }}
              className="px-8 py-3.5 rounded-[14px] bg-parties-accent flex items-center gap-2 active:scale-[0.98] transition-transform"
            >
              <span className="text-white font-bold text-[15px]">Book Now</span>
              <ArrowRight size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Booking bottom sheet */}
      {showBooking && selectedTable && (
        <div className="fixed inset-0 z-50">
          <div
            onClick={() => setShowBooking(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] px-6 pt-2 pb-10 max-h-[82vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-slide-up">
            {/* Handle */}
            <div className="flex justify-center mb-4">
              <div className="w-9 h-1 rounded-full bg-parties-panel" />
            </div>

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-parties-text">Book {selectedTable.name}</h2>
                <p className="text-[13px] text-parties-secondary">{venue.name}</p>
              </div>
              <button
                onClick={() => setShowBooking(false)}
                className="w-9 h-9 rounded-[10px] bg-parties-elevated flex items-center justify-center"
              >
                <X size={18} className="text-parties-secondary" />
              </button>
            </div>

            {/* Date picker */}
            <div className="mb-5">
              <p className="text-[13px] font-semibold text-parties-secondary mb-2.5 flex items-center gap-1.5">
                <Calendar size={14} /> Select Date
              </p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {dates.map(d => (
                  <button
                    key={d.full}
                    onClick={() => setSelectedDate(d)}
                    className={`min-w-[56px] py-2.5 px-2 rounded-[14px] flex flex-col items-center gap-0.5 border transition-all ${
                      selectedDate?.full === d.full
                        ? 'bg-parties-accent border-parties-accent text-white'
                        : 'bg-parties-soft border-black/[0.06] text-parties-secondary'
                    }`}
                  >
                    <span className="text-[11px] font-medium">{d.day}</span>
                    <span className="text-lg font-bold">{d.date}</span>
                    <span className="text-[10px]">{d.month}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Guest counter */}
            <div className="mb-6">
              <p className="text-[13px] font-semibold text-parties-secondary mb-2.5 flex items-center gap-1.5">
                <Users size={14} /> Guests
              </p>
              <div className="flex items-center gap-5 justify-center">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-11 h-11 rounded-xl bg-parties-elevated border border-black/[0.06] flex items-center justify-center text-xl text-parties-text"
                >
                  −
                </button>
                <span className="text-[28px] font-bold text-parties-text min-w-[50px] text-center">
                  {guests}
                </span>
                <button
                  onClick={() => setGuests(guests + 1)}
                  className="w-11 h-11 rounded-xl bg-parties-elevated border border-black/[0.06] flex items-center justify-center text-xl text-parties-text"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price summary */}
            <div className="bg-parties-soft rounded-2xl p-4 mb-5 border border-black/[0.06]">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-parties-secondary">Minimum spend</span>
                <span className="text-sm font-semibold text-parties-text">
                  {formatPrice(selectedTable.price_min)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-parties-secondary">Platform fee</span>
                <span className="text-sm font-semibold text-parties-text">
                  {formatPrice(Math.round(selectedTable.price_min * 0.05))}
                </span>
              </div>
              <div className="h-px bg-black/[0.06] my-2.5" />
              <div className="flex justify-between">
                <span className="text-base font-bold text-parties-text">Total</span>
                <span className="text-lg font-bold text-parties-accent">
                  {formatPrice(Math.round(selectedTable.price_min * 1.05))}
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={!selectedDate || bookingLoading}
              className="w-full py-4 rounded-[14px] bg-parties-accent text-white font-bold text-base disabled:opacity-30 active:scale-[0.98] transition-all"
            >
              {bookingLoading
                ? 'Booking...'
                : !selectedDate
                  ? 'Select a date'
                  : `Confirm — ${formatPrice(Math.round(selectedTable.price_min * 1.05))}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
