'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MapPin, Star, UtensilsCrossed, DollarSign } from 'lucide-react'
import { fetchVenues } from '@/lib/supabase'
import type { Venue } from '@/lib/types'

const CUISINES = ['All', 'Italian', 'Japanese', 'French', 'Steakhouse', 'Seafood', 'Asian Fusion', 'Mediterranean']

export default function DiningPage() {
  const router = useRouter()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [cuisine, setCuisine] = useState('All')

  useEffect(() => {
    fetchVenues(undefined, 'restaurant')
      .then(data => setVenues(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-dvh bg-white pt-14 pb-24">
      <div className="px-5 mb-5">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="text-parties-text">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-[26px] font-bold text-parties-text">Dining</h1>
        </div>
        <p className="text-sm text-parties-secondary ml-[34px]">Reserve at the best restaurants.</p>
      </div>

      {/* Cuisine filter */}
      <div className="px-5 mb-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CUISINES.map(c => (
            <button
              key={c}
              onClick={() => setCuisine(c)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${
                cuisine === c ? 'bg-parties-accent text-white' : 'bg-parties-soft text-parties-secondary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map(i => <div key={i} className="h-[200px] rounded-2xl bg-parties-soft animate-pulse" />)}
          </div>
        ) : venues.length > 0 ? (
          <div className="space-y-4">
            {venues.map((v, i) => (
              <div
                key={v.id}
                onClick={() => router.push(`/venue/${v.id}`)}
                className="rounded-2xl overflow-hidden border border-black/[0.06] cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
              >
                <div className="relative h-[160px]">
                  {v.img_url && <img src={v.img_url} alt={v.name} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <h3 className="text-lg font-bold text-white">{v.name}</h3>
                    <p className="text-[13px] text-white/70 flex items-center gap-1">
                      <MapPin size={12} /> {v.city}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center gap-4">
                  {v.rating && (
                    <span className="flex items-center gap-1 text-[13px] text-parties-accent font-bold">
                      <Star size={12} fill="#E8730C" /> {v.rating}
                    </span>
                  )}
                  <span className="text-[13px] text-parties-secondary">
                    {'$'.repeat(Math.min(4, Math.ceil(v.price_min / 100)))}
                  </span>
                  <span className="text-[13px] text-parties-accent font-bold ml-auto">
                    From ${v.price_min}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-parties-soft flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed size={28} className="text-parties-muted" />
            </div>
            <h3 className="text-lg font-semibold text-parties-text mb-1">Coming soon</h3>
            <p className="text-sm text-parties-secondary max-w-[260px] mx-auto">
              We're curating the best dining experiences. Restaurant reservations launch Q2 2026.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
