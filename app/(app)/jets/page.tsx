'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plane, MapPin, Users, Clock, ArrowRight, Zap } from 'lucide-react'
import { db } from '@/lib/supabase'

type JetListing = {
  id: string
  aircraft_type: string
  capacity: number
  origin_airport: string
  dest_airport: string
  departure_time: string
  price: number
  empty_leg: boolean
  img_url: string | null
}

export default function JetsPage() {
  const router = useRouter()
  const [jets, setJets] = useState<JetListing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'empty_leg'>('all')

  useEffect(() => {
    db.query('jet_listings', 'select=*&available=eq.true&order=departure_time.asc')
      .then(data => setJets(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'empty_leg' ? jets.filter(j => j.empty_leg) : jets

  return (
    <div className="min-h-dvh bg-white pt-14 pb-24">
      <div className="px-5 mb-5">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="text-parties-text"><ChevronLeft size={22} /></button>
          <h1 className="text-[26px] font-bold text-parties-text">Jets</h1>
        </div>
        <p className="text-sm text-parties-secondary ml-[34px]">Private aviation, simplified.</p>
      </div>

      <div className="px-5 mb-5 flex gap-2">
        {[
          { key: 'all', label: 'All Flights' },
          { key: 'empty_leg', label: 'Empty Legs 🔥' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key as any)}
            className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
              filter === f.key ? 'bg-parties-accent text-white' : 'bg-parties-soft text-parties-secondary'
            }`}>{f.label}</button>
        ))}
      </div>

      <div className="px-5">
        {loading ? (
          <div className="space-y-4">{[0,1].map(i => <div key={i} className="h-[160px] rounded-2xl bg-parties-soft animate-pulse" />)}</div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((jet, i) => {
              const depTime = new Date(jet.departure_time)
              return (
                <div key={jet.id} className="rounded-2xl border border-black/[0.06] p-4 animate-fade-up"
                  style={{ animationDelay: `${i*0.06}s`, opacity: 0 }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-[16px] font-bold text-parties-text">{jet.aircraft_type}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Users size={13} className="text-parties-muted" />
                        <span className="text-[13px] text-parties-secondary">Up to {jet.capacity}</span>
                      </div>
                    </div>
                    {jet.empty_leg && (
                      <span className="px-2.5 py-1 bg-green-50 rounded-lg text-[11px] font-bold text-green-600 flex items-center gap-1">
                        <Zap size={10} /> EMPTY LEG
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 py-3 px-4 bg-parties-soft rounded-xl mb-3">
                    <div className="text-center">
                      <p className="text-[18px] font-bold text-parties-text">{jet.origin_airport}</p>
                      <p className="text-[11px] text-parties-muted">{depTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="h-px bg-parties-panel flex-1" />
                      <Plane size={16} className="text-parties-accent mx-2" />
                      <div className="h-px bg-parties-panel flex-1" />
                    </div>
                    <div className="text-center">
                      <p className="text-[18px] font-bold text-parties-text">{jet.dest_airport}</p>
                      <p className="text-[11px] text-parties-muted">
                        {depTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-parties-accent">
                      ${(jet.price / 100).toLocaleString()}
                    </span>
                    <button className="px-5 py-2.5 rounded-xl bg-parties-accent text-white text-[13px] font-bold flex items-center gap-1.5">
                      Inquire <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-parties-soft flex items-center justify-center mx-auto mb-4">
              <Plane size={36} className="text-parties-muted" />
            </div>
            <h3 className="text-lg font-semibold text-parties-text mb-2">Private Jets Coming Soon</h3>
            <p className="text-sm text-parties-secondary max-w-[280px] mx-auto mb-6">
              Charter flights and empty leg deals between Miami, New York, Vegas, Ibiza, and more. Launching Summer 2026.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-[300px] mx-auto">
              {['MIA → TEB', 'LAS → VNY', 'MIA → SXM', 'TEB → SJU', 'IBZ → NCE'].map(route => (
                <div key={route} className="px-3 py-2 rounded-lg bg-parties-soft text-[12px] text-parties-secondary font-medium font-mono">
                  {route}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
