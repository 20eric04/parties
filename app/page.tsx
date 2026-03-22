'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const METROS = ['Miami', 'New York', 'Las Vegas', 'Ibiza', 'London', 'Mykonos', 'Tulum', 'St. Barths', 'Cabo', 'Paris']

export default function SplashPage() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const [phase, setPhase] = useState(0) // 0=logo, 1=logo visible, 2=landing

  useEffect(() => {
    if (!loading && session) {
      router.replace('/explore')
      return
    }
    const t1 = setTimeout(() => setPhase(1), 200)
    const t2 = setTimeout(() => setPhase(2), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [loading, session, router])

  // Phase 0-1: Logo splash (dark)
  if (phase < 2) {
    return (
      <div className="fixed inset-0 bg-parties-dark flex items-center justify-center transition-opacity duration-600"
        style={{ opacity: phase === 0 ? 0 : 1 }}>
        <div className="text-center" style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'scale(1)' : 'scale(0.9)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div className="w-[72px] h-[72px] rounded-[20px] bg-parties-accent flex items-center justify-center mx-auto mb-5"
            style={{ boxShadow: '0 0 60px rgba(232,115,12,0.3)' }}>
            <span className="text-3xl">🎉</span>
          </div>
          <h1 className="font-display text-[44px] font-light text-white tracking-tight">Parties</h1>
        </div>
      </div>
    )
  }

  // Phase 2: Landing
  return (
    <div className="fixed inset-0 bg-parties-dark flex flex-col animate-fade-in">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&h=1200&fit=crop"
          alt="" className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, #0A0A0A 0%, transparent 30%, transparent 45%, #0A0A0A 80%)' }} />
      </div>

      {/* Warm glow */}
      <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(232,115,12,0.12) 0%, transparent 70%)' }} />

      {/* Content */}
      <div className="flex-1 flex flex-col justify-end px-7 pb-12 relative z-10">
        <div className="mb-6 animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <h1 className="font-display text-[48px] font-light text-white tracking-tight leading-none">Parties</h1>
          <div className="w-10 h-[3px] bg-parties-accent rounded-full mt-3" />
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <p className="text-xl font-light text-white leading-relaxed mb-2">
            Tables. Dining. Cars. Jets. Hotels.
          </p>
          <p className="text-[15px] text-white/50 leading-relaxed max-w-[300px]">
            One app for everything your night — and your trip — needs.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3.5 animate-fade-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-4 rounded-[14px] bg-parties-accent flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <span className="text-white font-bold text-base">Get Started</span>
            <ArrowRight size={18} className="text-white" />
          </button>
          <button
            onClick={() => router.push('/login')}
            className="py-2 text-center text-sm text-white/50"
          >
            Already have an account? <span className="text-white font-semibold">Sign in</span>
          </button>
        </div>

        {/* Scrolling cities */}
        <div className="mt-7 overflow-hidden opacity-40 animate-fade-up" style={{ animationDelay: '0.7s' }}>
          <div className="flex gap-5 whitespace-nowrap"
            style={{ animation: 'marquee 20s linear infinite' }}>
            {[...METROS, ...METROS].map((city, i) => (
              <span key={i} className="text-xs text-white/40 font-medium tracking-widest uppercase">
                {city} ·
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
