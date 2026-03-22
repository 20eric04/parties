'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, MapPin, Star, Heart, ChevronDown, ChevronRight,
  Filter, Bell, User, TrendingUp, ArrowRight,
  Wine, UtensilsCrossed, Car, Plane, BedDouble,
} from 'lucide-react'
import { fetchVenues } from '@/lib/supabase'
import type { Venue } from '@/lib/types'

const METROS = ['Miami', 'New York', 'Las Vegas', 'Ibiza', 'London', 'Mykonos', 'Tulum']

const VERTICALS = [
  { key: 'tables', label: 'Tables', icon: Wine },
  { key: 'dining', label: 'Dining', icon: UtensilsCrossed },
  { key: 'cars', label: 'Cars', icon: Car },
  { key: 'jets', label: 'Jets', icon: Plane },
  { key: 'hotels', label: 'Hotels', icon: BedDouble },
]

function VenueCard({ venue, delay }: { venue: Venue; delay: number }) {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push(`/venue/${venue.id}`)}
      className="rounded-[18px] overflow-hidden bg-white border border-black/[0.06] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] animate-fade-up"
      style={{ animationDelay: `${delay}s`, opacity: 0 }}
    >
      <div className="relative pt-[62%] overflow-hidden">
        {venue.img_url && (
          <img
            src={venue.img_url}
            alt={venue.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {venue.hot && (
            <span className="px-2.5 py-1 bg-parties-accent rounded-full text-[11px] font-bold text-white flex items-center gap-1">
              <TrendingUp size={11} /> HOT
            </span>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation() }}
          className="absolute top-3 right-3 w-[34px] h-[34px] rounded-full bg-white/85 backdrop-blur-lg flex items-center justify-center"
        >
          <Heart size={16} className="text-parties-text" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[17px] font-bold tracking-tight text-parties-text mb-0.5">
              {venue.name}
            </h3>
            <p className="text-[13px] text-parties-secondary flex items-center gap-1">
              <MapPin size={12} /> {venue.city}
            </p>
          </div>
          {venue.rating && (
            <div className="flex items-center gap-1 bg-parties-accentMuted px-2.5 py-1 rounded-lg">
              <Star size={12} fill="#E8730C" className="text-parties-accent" />
              <span className="text-[13px] font-bold text-parties-accent">{venue.rating}</span>
            </div>
          )}
        </div>

        <div className="flex gap-1.5 mt-2.5 flex-wrap">
          {(venue.tags || []).slice(0, 3).map(tag => (
            <span key={tag} className="px-2.5 py-0.5 bg-parties-elevated rounded-md text-[11px] text-parties-secondary font-medium">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-3 flex justify-between items-center">
          <span className="text-[13px] text-parties-muted">From</span>
          <span className="text-[17px] font-bold text-parties-accent">
            ${venue.price_min?.toLocaleString()}
            <span className="text-[12px] font-normal text-parties-muted"> min spend</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default function ExplorePage() {
  const router = useRouter()
  const [metro, setMetro] = useState('Miami')
  const [vertical, setVertical] = useState('tables')
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQ, setSearchQ] = useState('')

  const loadVenues = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchVenues(metro)
      setVenues(data)
    } catch (err) {
      console.error('Failed to load venues:', err)
    } finally {
      setLoading(false)
    }
  }, [metro])

  useEffect(() => { loadVenues() }, [loadVenues])

  const filtered = searchQ
    ? venues.filter(v => v.name.toLowerCase().includes(searchQ.toLowerCase()))
    : venues

  return (
    <div className="min-h-dvh bg-white">
      {/* Header */}
      <div className="px-5 pt-14">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[13px] text-parties-muted mb-0.5">Good evening</p>
            <div className="flex items-center gap-1.5">
              <MapPin size={16} className="text-parties-accent" />
              <button className="text-[18px] font-bold text-parties-text flex items-center gap-1 tracking-tight">
                {metro} <ChevronDown size={16} className="text-parties-muted" />
              </button>
            </div>
          </div>
          <div className="flex gap-2.5">
            <div
              onClick={() => router.push('/notifications')}
              className="relative w-10 h-10 rounded-xl bg-parties-soft border border-black/[0.06] flex items-center justify-center cursor-pointer"
            >
              <Bell size={18} className="text-parties-secondary" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-parties-accent border-2 border-white" />
            </div>
            <div
              onClick={() => router.push('/profile')}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-parties-accent to-parties-accentHover flex items-center justify-center cursor-pointer"
            >
              <User size={18} className="text-white" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="text-parties-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search venues, events..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`w-full py-3.5 pl-12 pr-12 bg-parties-soft border rounded-[14px] text-[15px] text-parties-text font-body outline-none transition-colors placeholder:text-parties-muted ${
              searchFocused ? 'border-parties-accent' : 'border-black/[0.06]'
            }`}
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[10px] bg-parties-elevated flex items-center justify-center">
            <Filter size={16} className="text-parties-secondary" />
          </button>
        </div>
      </div>

      {/* Vertical tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {VERTICALS.map(v => {
            const Icon = v.icon
            const active = vertical === v.key
            const verticalRoutes: Record<string, string> = {
              dining: '/dining',
              cars: '/cars',
              jets: '/jets',
              hotels: '/hotels',
            }
            return (
              <button
                key={v.key}
                onClick={() => {
                  if (verticalRoutes[v.key]) {
                    router.push(verticalRoutes[v.key])
                  } else {
                    setVertical(v.key)
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-[13px] font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'border-parties-accent bg-parties-accentMuted text-parties-accent'
                    : 'border-black/[0.06] bg-transparent text-parties-secondary'
                }`}
              >
                <Icon size={15} /> {v.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Metro pills */}
      <div className="px-5 mb-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {METROS.map(city => (
            <button
              key={city}
              onClick={() => setMetro(city)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${
                metro === city
                  ? 'bg-parties-accent text-white'
                  : 'bg-parties-elevated text-parties-secondary'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Featured banner */}
      {vertical === 'tables' && venues.length > 0 && (
        <div className="px-5 mb-5">
          <div
            onClick={() => router.push('/events')}
            className="rounded-[20px] overflow-hidden relative h-[150px] bg-parties-dark cursor-pointer"
          >
            {venues[0]?.img_url && (
              <img
                src={venues[0].img_url}
                className="absolute inset-0 w-full h-full object-cover opacity-50"
                alt=""
              />
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(10,10,10,0.9) 0%, transparent 70%)' }} />
            <div className="relative z-10 p-[22px] h-full flex flex-col justify-center">
              <span className="text-[11px] font-bold tracking-widest text-parties-accent uppercase mb-1.5">
                This Weekend
              </span>
              <h2 className="font-display text-[22px] font-medium text-white mb-0.5">
                Friday at {venues[0]?.name}
              </h2>
              <p className="text-[13px] text-white/60">
                World-class DJs · 11 PM · Limited tables
              </p>
            </div>
            <div className="absolute right-[18px] top-1/2 -translate-y-1/2 z-10">
              <div className="w-[42px] h-[42px] rounded-full bg-parties-accent flex items-center justify-center">
                <ArrowRight size={18} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section header */}
      <div className="px-5 mb-3.5 flex justify-between items-center">
        <h2 className="text-[19px] font-bold tracking-tight text-parties-text">Hot Tonight</h2>
        <button className="flex items-center gap-1 text-[13px] font-semibold text-parties-accent">
          See all <ChevronRight size={14} />
        </button>
      </div>

      {/* Venue list */}
      <div className="px-5 flex flex-col gap-4 pb-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[18px] bg-parties-soft animate-pulse h-[280px]" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((venue, i) => (
            <VenueCard key={venue.id} venue={venue} delay={i * 0.06} />
          ))
        ) : (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔜</div>
            <h3 className="text-lg font-semibold text-parties-text mb-1">Coming soon to {metro}</h3>
            <p className="text-sm text-parties-secondary">We're onboarding venues here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
