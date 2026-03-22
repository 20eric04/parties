'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Car, MapPin, Users, Clock, Star } from 'lucide-react'
import { db } from '@/lib/supabase'

type Vehicle = {
  id: string
  vehicle_type: string
  make: string
  model: string
  year: number
  capacity: number
  rate_per_hour: number
  metro: string
  img_url: string | null
  available: boolean
}

const TYPES = ['All', 'Sedan', 'SUV', 'Sports', 'Sprinter', 'Exotic']

export default function CarsPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('All')

  useEffect(() => {
    db.query('fleet_vehicles', 'select=*&available=eq.true&order=rate_per_hour.asc')
      .then(data => setVehicles(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = type === 'All' ? vehicles : vehicles.filter(v => v.vehicle_type === type.toLowerCase())

  return (
    <div className="min-h-dvh bg-white pt-14 pb-24">
      <div className="px-5 mb-5">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="text-parties-text"><ChevronLeft size={22} /></button>
          <h1 className="text-[26px] font-bold text-parties-text">Cars</h1>
        </div>
        <p className="text-sm text-parties-secondary ml-[34px]">Luxury transportation, on demand.</p>
      </div>

      <div className="px-5 mb-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${
                type === t ? 'bg-parties-accent text-white' : 'bg-parties-soft text-parties-secondary'
              }`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="space-y-4">{[0,1,2].map(i => <div key={i} className="h-[180px] rounded-2xl bg-parties-soft animate-pulse" />)}</div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((v, i) => (
              <div key={v.id} className="rounded-2xl overflow-hidden border border-black/[0.06] animate-fade-up"
                style={{ animationDelay: `${i*0.06}s`, opacity: 0 }}>
                <div className="relative h-[160px] bg-parties-soft">
                  {v.img_url ? (
                    <img src={v.img_url} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car size={40} className="text-parties-muted" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-[17px] font-bold text-parties-text">{v.year} {v.make} {v.model}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[13px] text-parties-secondary flex items-center gap-1">
                      <Users size={12} /> {v.capacity} seats
                    </span>
                    <span className="text-[13px] text-parties-secondary flex items-center gap-1">
                      <MapPin size={12} /> {v.metro}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[12px] text-parties-muted capitalize">{v.vehicle_type}</span>
                    <span className="text-lg font-bold text-parties-accent">
                      ${(v.rate_per_hour / 100).toLocaleString()}<span className="text-[12px] font-normal text-parties-muted">/hr</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-parties-soft flex items-center justify-center mx-auto mb-4">
              <Car size={36} className="text-parties-muted" />
            </div>
            <h3 className="text-lg font-semibold text-parties-text mb-2">Luxury Fleet Coming Soon</h3>
            <p className="text-sm text-parties-secondary max-w-[280px] mx-auto mb-6">
              Rolls-Royce, Lamborghini, Mercedes Sprinter, and more. Arriving in all markets Q2 2026.
            </p>
            <div className="grid grid-cols-3 gap-3 max-w-[300px] mx-auto">
              {['Rolls-Royce', 'Lamborghini', 'Bentley', 'G-Wagon', 'Sprinter', 'Escalade'].map(car => (
                <div key={car} className="px-3 py-2 rounded-lg bg-parties-soft text-[11px] text-parties-secondary text-center font-medium">
                  {car}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
