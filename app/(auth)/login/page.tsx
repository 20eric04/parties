'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { auth } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

const METROS = [
  { name: 'Miami', emoji: '🌴' },
  { name: 'New York', emoji: '🗽' },
  { name: 'Las Vegas', emoji: '🎰' },
  { name: 'Ibiza', emoji: '🏝️' },
  { name: 'London', emoji: '🇬🇧' },
  { name: 'Mykonos', emoji: '🇬🇷' },
  { name: 'Tulum', emoji: '🌮' },
  { name: 'St. Barths', emoji: '🏖️' },
]

type Step = 'email' | 'details' | 'phone' | 'otp' | 'cities'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()

  const [step, setStep] = useState<Step>('email')
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isNewUser, setIsNewUser] = useState(true)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const go = (next: Step) => {
    setDirection('forward')
    setError('')
    setStep(next)
  }

  const goBack = () => {
    setDirection('back')
    setError('')
    const order: Step[] = ['email', 'details', 'phone', 'otp', 'cities']
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
    else router.back()
  }

  // ─── Step: Email ───
  const handleEmail = async () => {
    if (!email.includes('@')) { setError('Enter a valid email'); return }
    setLoading(true)
    setError('')
    // For the flow: always go to details (signup). If they have an account, they can enter password there.
    setLoading(false)
    go('details')
  }

  // ─── Step: Details (name + password) ───
  const handleDetails = async () => {
    if (!firstName.trim()) { setError('First name is required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    try {
      // Try sign up first
      const data = await signUp(email, password, {
        full_name: `${firstName} ${lastName}`.trim(),
        name: firstName,
      })
      // If signup succeeds, continue to phone
      go('phone')
    } catch (err: any) {
      // If user exists, try sign in
      if (err.message?.includes('already registered') || err.message?.includes('already been registered')) {
        try {
          await signIn(email, password)
          router.replace('/explore')
          return
        } catch (signInErr: any) {
          setError(signInErr.message || 'Invalid password')
        }
      } else {
        setError(err.message || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── Step: Phone ───
  const handlePhone = async () => {
    if (phone.length < 10) { setError('Enter a valid phone number'); return }
    setLoading(true)
    setError('')
    try {
      // In production, this would send a real SMS via Supabase or Twilio
      // For now, advance to OTP step
      go('otp')
    } catch (err: any) {
      setError(err.message || 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  // ─── Step: OTP ───
  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Enter the full 6-digit code'); return }
    setLoading(true)
    // In production: verify OTP with Supabase
    // For demo: advance to city selection
    setTimeout(() => {
      setLoading(false)
      go('cities')
    }, 800)
  }

  // ─── Step: Cities ───
  const toggleCity = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    )
  }

  const handleCitiesDone = async () => {
    setLoading(true)
    // In production: update user profile with selected cities
    // Then sign in and redirect
    try {
      await signIn(email, password)
      router.replace('/explore')
    } catch {
      // If sign-in fails, still redirect (session might already exist)
      router.replace('/explore')
    }
  }

  const stepContent = {
    // ════════════════════════════════
    // STEP 1: EMAIL
    // ════════════════════════════════
    email: (
      <div className="page-enter flex flex-col h-full">
        <div className="flex-1">
          <h1 className="text-[26px] font-bold text-white mb-2">Enter your email address</h1>
          <p className="text-sm text-white/40 mb-8">We'll check if you have an account.</p>

          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
            Email Address
          </label>
          <input
            type="email"
            className="auth-input"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleEmail()}
          />
        </div>

        <div className="pb-8">
          {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}
          <button
            onClick={handleEmail}
            disabled={!email || loading}
            className="w-full py-4 rounded-[14px] bg-white text-parties-dark font-bold text-base disabled:opacity-30 active:scale-[0.98] transition-all"
          >
            {loading ? 'Checking...' : 'Next'}
          </button>
        </div>
      </div>
    ),

    // ════════════════════════════════
    // STEP 2: NAME + PASSWORD
    // ════════════════════════════════
    details: (
      <div className="page-enter flex flex-col h-full">
        <div className="flex-1">
          <h1 className="text-[26px] font-bold text-white mb-2">Create Account</h1>
          <p className="text-sm text-white/40 mb-8">Enter a few more details to finish creating your account.</p>

          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
            First Name *
          </label>
          <input
            type="text"
            className="auth-input mb-5"
            placeholder="First name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            autoFocus
          />

          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
            Last Name *
          </label>
          <input
            type="text"
            className="auth-input mb-5"
            placeholder="Last name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />

          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              className="auth-input pr-12"
              placeholder="Create your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDetails()}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPw ? <EyeOff size={18} className="text-white/30" /> : <Eye size={18} className="text-white/30" />}
            </button>
          </div>
          <p className="text-xs text-white/30 mt-2">
            Password must be at least 6 characters.
          </p>
        </div>

        <div className="pb-8">
          {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}
          <button
            onClick={handleDetails}
            disabled={!firstName || !password || loading}
            className="w-full py-4 rounded-[14px] bg-white text-parties-dark font-bold text-base disabled:opacity-30 active:scale-[0.98] transition-all"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>
      </div>
    ),

    // ════════════════════════════════
    // STEP 3: PHONE
    // ════════════════════════════════
    phone: (
      <div className="page-enter flex flex-col h-full">
        <div className="flex-1">
          <h1 className="text-[26px] font-bold text-white mb-2">Welcome, {firstName}</h1>
          <p className="text-sm text-white/40 mb-8">
            We just need to confirm your mobile number to finish setting up your account.
          </p>

          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
            Mobile Number *
          </label>
          <div className="flex gap-3">
            <div className="auth-input w-16 flex items-center justify-center text-white/60 flex-shrink-0">
              +1
            </div>
            <input
              type="tel"
              className="auth-input flex-1"
              placeholder="Mobile number"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handlePhone()}
            />
          </div>
          <p className="text-xs text-white/30 mt-3 leading-relaxed">
            By providing your mobile number, you agree that it may be used to send you text messages and call you to confirm and manage your reservations.
          </p>
        </div>

        <div className="pb-8">
          {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}
          <button
            onClick={handlePhone}
            disabled={phone.length < 10 || loading}
            className="w-full py-4 rounded-[14px] bg-white text-parties-dark font-bold text-base disabled:opacity-30 active:scale-[0.98] transition-all"
          >
            {loading ? 'Sending...' : 'Next'}
          </button>
          <button
            onClick={() => go('cities')}
            className="w-full py-3 mt-3 text-sm text-white/40 font-medium"
          >
            Skip for now
          </button>
        </div>
      </div>
    ),

    // ════════════════════════════════
    // STEP 4: OTP VERIFICATION
    // ════════════════════════════════
    otp: (
      <div className="page-enter flex flex-col h-full">
        <div className="flex-1">
          <h1 className="text-[22px] font-bold text-white mb-2 leading-tight">
            Enter the code we sent to your mobile number ({phone ? `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}` : ''})
          </h1>

          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block mt-6">
            Verification Code
          </label>
          <div className="flex gap-2 items-center">
            {[0, 1, 2].map(i => (
              <input
                key={i}
                ref={el => { otpRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp-box"
                value={otp[i]}
                onChange={e => handleOTPChange(i, e.target.value)}
                onKeyDown={e => handleOTPKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
            <span className="text-white/30 text-lg mx-1">–</span>
            {[3, 4, 5].map(i => (
              <input
                key={i}
                ref={el => { otpRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp-box"
                value={otp[i]}
                onChange={e => handleOTPChange(i, e.target.value)}
                onKeyDown={e => handleOTPKeyDown(i, e)}
              />
            ))}
          </div>

          <button className="text-parties-accent text-sm font-semibold mt-4">
            Need help?
          </button>
        </div>

        <div className="pb-8">
          {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}
          <button
            onClick={handleVerifyOTP}
            disabled={otp.join('').length < 6 || loading}
            className="w-full py-4 rounded-[14px] bg-white text-parties-dark font-bold text-base disabled:opacity-30 active:scale-[0.98] transition-all"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <div className="flex gap-4 mt-4 justify-center">
            <button className="text-sm text-white/40 font-medium">Resend code</button>
            <span className="text-white/10">|</span>
            <button onClick={() => go('cities')} className="text-sm text-white/40 font-medium">
              Skip for now
            </button>
          </div>
        </div>
      </div>
    ),

    // ════════════════════════════════
    // STEP 5: CITY SELECTION (multi-select)
    // ════════════════════════════════
    cities: (
      <div className="page-enter flex flex-col h-full">
        <div className="flex-1">
          {/* Progress bar */}
          <div className="flex gap-1 mb-8">
            {[0, 1, 2].map(i => (
              <div key={i} className={`flex-1 h-[3px] rounded-full ${i < 3 ? 'bg-parties-accent' : 'bg-white/10'}`} />
            ))}
          </div>

          <h1 className="font-display text-[30px] font-normal text-white mb-2">
            Where do you go out?
          </h1>
          <p className="text-sm text-white/40 mb-7">
            Pick your cities. You can always browse others.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {METROS.map((city, i) => {
              const sel = selectedCities.includes(city.name)
              return (
                <button
                  key={city.name}
                  onClick={() => toggleCity(city.name)}
                  className="relative p-4 rounded-2xl text-center transition-all duration-200 animate-fade-up"
                  style={{
                    animationDelay: `${i * 0.04}s`,
                    opacity: 0,
                    background: sel ? 'rgba(232,115,12,0.1)' : '#141414',
                    border: sel ? '1.5px solid #E8730C' : '1.5px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {sel && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-parties-accent flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  <span className="text-[28px] block mb-1.5">{city.emoji}</span>
                  <span className={`text-[15px] ${sel ? 'text-parties-accent font-bold' : 'text-white font-medium'}`}>
                    {city.name}
                  </span>
                </button>
              )
            })}
          </div>

          {selectedCities.length > 0 && (
            <p className="text-center text-sm text-white/40 mt-4 animate-fade-in">
              {selectedCities.length} {selectedCities.length === 1 ? 'city' : 'cities'} selected
            </p>
          )}
        </div>

        <div className="pb-8">
          <button
            onClick={handleCitiesDone}
            disabled={selectedCities.length === 0 || loading}
            className="w-full py-4 rounded-[14px] bg-parties-accent flex items-center justify-center gap-2 font-bold text-base disabled:opacity-30 active:scale-[0.98] transition-all"
          >
            <span className="text-white">{loading ? 'Setting up...' : 'Continue'}</span>
            {!loading && <ArrowRight size={18} className="text-white" />}
          </button>
        </div>
      </div>
    ),
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 pt-14 pb-2">
      {/* Back button */}
      {step !== 'email' && (
        <button onClick={goBack} className="mb-6 -ml-1 flex items-center gap-1 text-white/60">
          <ChevronLeft size={22} />
        </button>
      )}
      {step === 'email' && (
        <button onClick={() => router.back()} className="mb-6 -ml-1 flex items-center gap-1 text-white/60">
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Step content */}
      <div className="flex-1 flex flex-col" key={step}>
        {stepContent[step]}
      </div>
    </div>
  )
}
