'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, BedDouble, MapPin, Star, Waves, Dumbbell, Sparkles } from 'lucide-react'
import { fetchVenues } from '@/lib/supabase'
import type { Venue } from '@/lib/types'

export default function HotelsPage() {
  const router = useRouter()
  const [hotels, setHotels] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVenues(undefined, 'hotel')
      .then(data => setHotels(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-dvh bg-white pt-14 pb-24">
      <div className="px-5 mb-5">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="text-parties-text"><ChevronLeft size={22} /></button>
          <h1 className="text-[26px] font-bold text-parties-text">Hotels</h1>
        </div>
        <p className="text-sm text-parties-secondary ml-[34px]">Luxury stays in every market.</p>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="space-y-4">{[0,1,2].map(i => <div key={i} className="h-[240px] rounded-2xl bg-parties-soft animate-pulse" />)}</div>
        ) : hotels.length > 0 ? (
          <div className="space-y-4">
            {hotels.map((h, i) => (
              <div key={h.id} onClick={() => router.push(`/venue/${h.id}`)}
                className="rounded-2xl overflow-hidden border border-black/[0.06] cursor-pointer transition-all hover:shadow-lg animate-fade-up"
                style={{ animationDelay: `${i*0.06}s`, opacity: 0 }}>
                <div className="relative h-[180px]">
                  {h.img_url && <img src={h.img_url} alt={h.name} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">{h.name}</h3>
                    <p className="text-[13px] text-white/70 flex items-center gap-1">
                      <MapPin size={12} /> {h.city}, {h.metro}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {h.rating && (
                      <span className="flex items-center gap-1 text-[13px] font-bold text-parties-accent">
                        <Star size={12} fill="#E8730C" /> {h.rating}
                      </span>
                    )}
                    <span className="text-[13px] text-parties-secondary">5-Star</span>
                  </div>
                  <div className="flex gap-2">
                    {(h.amenities || []).slice(0, 3).map(a => (
                      <span key={a} className="px-2.5 py-1 bg-parties-soft rounded-md text-[11px] text-parties-secondary font-medium">{a}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/[0.04]">
                    <span className="text-[12px] text-parties-muted">From</span>
                    <span className="text-lg font-bold text-parties-accent">
                      ${h.price_min}<span className="text-[12px] font-normal text-parties-muted">/night</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-parties-soft flex items-center justify-center mx-auto mb-4">
              <BedDouble size={36} className="text-parties-muted" />
            </div>
            <h3 className="text-lg font-semibold text-parties-text mb-2">Hotels Coming Soon</h3>
            <p className="text-sm text-parties-secondary max-w-[280px] mx-auto mb-6">
              Partner rates at the best properties in every market. Launching Q2 2026.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-[300px] mx-auto">
              {[
                { icon: Star, label: '5-Star Properties' },
                { icon: Waves, label: 'Pool & Beach' },
                { icon: Sparkles, label: 'Spa & Wellness' },
                { icon: Dumbbell, label: 'Fitness Centers' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-parties-soft">
                  <f.icon size={14} className="text-parties-accent flex-shrink-0" />
                  <span className="text-[12px] text-parties-secondary font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
