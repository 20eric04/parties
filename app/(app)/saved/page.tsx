'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MapPin, Star, Trash2, TrendingUp } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { fetchFavorites, removeFavorite } from '@/lib/supabase'
import type { Venue } from '@/lib/types'

type FavoriteWithVenue = {
  id: string
  venue_id: number
  venues: Venue
}

export default function SavedPage() {
  const router = useRouter()
  const { session } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteWithVenue[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!session?.access_token) { setLoading(false); return }
    try {
      const data = await fetchFavorites(session.access_token)
      setFavorites(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => { load() }, [load])

  const handleRemove = async (userId: string, venueId: number) => {
    if (!session?.access_token) return
    try {
      await removeFavorite(userId, venueId, session.access_token)
      setFavorites(prev => prev.filter(f => f.venue_id !== venueId))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-dvh bg-white pt-14 px-5 pb-24">
      <h1 className="text-[26px] font-bold text-parties-text mb-1">Saved</h1>
      <p className="text-sm text-parties-secondary mb-6">Your favorite venues and experiences.</p>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-parties-soft animate-pulse" />
          ))}
        </div>
      ) : !session ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-parties-soft flex items-center justify-center mb-4">
            <Heart size={28} className="text-parties-muted" />
          </div>
          <h3 className="text-lg font-semibold text-parties-text mb-1">Sign in to save venues</h3>
          <p className="text-sm text-parties-secondary text-center max-w-[260px] mb-4">
            Create an account to start saving your favorite spots.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 rounded-[14px] bg-parties-accent text-white font-bold text-sm"
          >
            Sign In
          </button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-parties-soft flex items-center justify-center mb-4">
            <Heart size={28} className="text-parties-muted" />
          </div>
          <h3 className="text-lg font-semibold text-parties-text mb-1">No saved venues yet</h3>
          <p className="text-sm text-parties-secondary text-center max-w-[260px] mb-4">
            Tap the heart on any venue to save it for later.
          </p>
          <button
            onClick={() => router.push('/explore')}
            className="px-6 py-3 rounded-[14px] bg-parties-accent text-white font-bold text-sm"
          >
            Explore Venues
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {favorites.map((fav, i) => {
            const v = fav.venues
            return (
              <div
                key={fav.id}
                className="flex gap-3.5 p-3 rounded-2xl border border-black/[0.06] animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <div
                  onClick={() => router.push(`/venue/${v.id}`)}
                  className="w-[90px] h-[90px] rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                >
                  {v.img_url && (
                    <img src={v.img_url} alt={v.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex justify-between items-start">
                    <div onClick={() => router.push(`/venue/${v.id}`)} className="cursor-pointer">
                      <h3 className="text-[15px] font-bold text-parties-text truncate">{v.name}</h3>
                      <p className="text-[12px] text-parties-secondary flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {v.city}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(session.user.id, v.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {v.rating && (
                      <span className="flex items-center gap-1 text-[12px] text-parties-accent font-semibold">
                        <Star size={11} fill="#E8730C" className="text-parties-accent" /> {v.rating}
                      </span>
                    )}
                    <span className="text-[12px] text-parties-accent font-bold">
                      ${v.price_min} min
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
