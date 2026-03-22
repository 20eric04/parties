'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check, Camera } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { fetchProfile, updateProfile } from '@/lib/supabase'

const CITIES = ['Miami', 'New York', 'Las Vegas', 'Ibiza', 'London', 'Mykonos', 'Tulum', 'St. Barths']

export default function EditProfilePage() {
  const router = useRouter()
  const { session } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Miami')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.access_token || !session?.user?.id) { setLoading(false); return }
    fetchProfile(session.user.id, session.access_token)
      .then(profile => {
        if (profile) {
          setName(profile.full_name || profile.name || '')
          setEmail(profile.email || session.user.email || '')
          setPhone(profile.phone || '')
          setCity(profile.city || 'Miami')
        } else {
          setEmail(session.user.email || '')
          setName((session.user.user_metadata?.full_name as string) || '')
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [session])

  const handleSave = async () => {
    if (!session?.access_token || !session?.user?.id) return
    setSaving(true)
    try {
      await updateProfile(session.user.id, {
        full_name: name,
        name: name.split(' ')[0],
        phone,
        city,
      }, session.access_token)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white pt-14 pb-24">
      <div className="px-5 flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="text-parties-text">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-[17px] font-bold text-parties-text">Edit Profile</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-parties-accent font-semibold text-[15px] disabled:opacity-40"
        >
          {saved ? <Check size={20} className="text-green-500" /> : saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-parties-accent to-parties-accentHover flex items-center justify-center text-white text-3xl font-display font-light">
            {name ? name[0].toUpperCase() : '?'}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-parties-dark flex items-center justify-center border-2 border-white">
            <Camera size={14} className="text-white" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="px-5 space-y-6">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-parties-soft animate-pulse" />)}
        </div>
      ) : (
        <div className="px-5 space-y-5">
          <div>
            <label className="text-xs font-semibold text-parties-muted uppercase tracking-wider mb-2 block">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-parties-soft border border-black/[0.06] text-parties-text text-[15px] outline-none focus:border-parties-accent transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-parties-muted uppercase tracking-wider mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3.5 rounded-xl bg-parties-elevated border border-black/[0.04] text-parties-muted text-[15px] cursor-not-allowed"
            />
            <p className="text-[11px] text-parties-muted mt-1">Email cannot be changed here.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-parties-muted uppercase tracking-wider mb-2 block">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-parties-soft border border-black/[0.06] text-parties-text text-[15px] outline-none focus:border-parties-accent transition-colors"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-parties-muted uppercase tracking-wider mb-2 block">
              Home City
            </label>
            <div className="flex gap-2 flex-wrap">
              {CITIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                    city === c
                      ? 'bg-parties-accent text-white'
                      : 'bg-parties-soft text-parties-secondary border border-black/[0.06]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
