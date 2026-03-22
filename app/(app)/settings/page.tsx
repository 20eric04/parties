'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Globe, Moon, Bell, Shield, CreditCard, CircleHelp, FileText, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-[50px] h-[30px] rounded-full transition-colors duration-200 flex-shrink-0 ${on ? 'bg-parties-accent' : 'bg-parties-panel'}`}
    >
      <div
        className={`w-[26px] h-[26px] rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}
      />
    </button>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { signOut } = useAuth()
  const [pushNotifs, setPushNotifs] = useState(true)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)
  const [currency, setCurrency] = useState('USD')

  const handleSignOut = async () => {
    await signOut()
    router.replace('/')
  }

  return (
    <div className="min-h-dvh bg-white pt-14 pb-24">
      <div className="px-5 flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="text-parties-text">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-[17px] font-bold text-parties-text">Settings</h1>
        <div className="w-[22px]" />
      </div>

      <div className="px-5">
        {/* Notifications section */}
        <p className="text-[11px] font-bold text-parties-muted tracking-widest uppercase mb-3 pl-1">
          Notifications
        </p>
        <div className="space-y-1 mb-6">
          <div className="flex items-center justify-between py-3.5 px-1 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-parties-soft flex items-center justify-center">
                <Bell size={17} className="text-parties-secondary" />
              </div>
              <span className="text-[15px] font-medium text-parties-text">Push Notifications</span>
            </div>
            <Toggle on={pushNotifs} onToggle={() => setPushNotifs(!pushNotifs)} />
          </div>
          <div className="flex items-center justify-between py-3.5 px-1 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-parties-soft flex items-center justify-center">
                <Bell size={17} className="text-parties-secondary" />
              </div>
              <span className="text-[15px] font-medium text-parties-text">Email Updates</span>
            </div>
            <Toggle on={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} />
          </div>
          <div className="flex items-center justify-between py-3.5 px-1 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-parties-soft flex items-center justify-center">
                <Bell size={17} className="text-parties-secondary" />
              </div>
              <span className="text-[15px] font-medium text-parties-text">SMS Alerts</span>
            </div>
            <Toggle on={smsNotifs} onToggle={() => setSmsNotifs(!smsNotifs)} />
          </div>
        </div>

        {/* Preferences section */}
        <p className="text-[11px] font-bold text-parties-muted tracking-widest uppercase mb-3 pl-1">
          Preferences
        </p>
        <div className="space-y-1 mb-6">
          <div className="flex items-center justify-between py-3.5 px-1 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-parties-soft flex items-center justify-center">
                <Globe size={17} className="text-parties-secondary" />
              </div>
              <span className="text-[15px] font-medium text-parties-text">Currency</span>
            </div>
            <div className="flex gap-1.5">
              {['USD', 'EUR', 'MXN'].map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                    currency === c
                      ? 'bg-parties-accent text-white'
                      : 'bg-parties-soft text-parties-secondary'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <button className="w-full flex items-center justify-between py-3.5 px-1 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-parties-soft flex items-center justify-center">
                <Moon size={17} className="text-parties-secondary" />
              </div>
              <span className="text-[15px] font-medium text-parties-text">Appearance</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-parties-muted">Light</span>
              <ChevronRight size={16} className="text-parties-muted" />
            </div>
          </button>
        </div>

        {/* Payment section */}
        <p className="text-[11px] font-bold text-parties-muted tracking-widest uppercase mb-3 pl-1">
          Payment
        </p>
        <div className="space-y-1 mb-6">
          <button className="w-full flex items-center justify-between py-3.5 px-1 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-parties-soft flex items-center justify-center">
                <CreditCard size={17} className="text-parties-secondary" />
              </div>
              <span className="text-[15px] font-medium text-parties-text">Payment Methods</span>
            </div>
            <ChevronRight size={16} className="text-parties-muted" />
          </button>
        </div>

        {/* Support section */}
        <p className="text-[11px] font-bold text-parties-muted tracking-widest uppercase mb-3 pl-1">
          Support
        </p>
        <div className="space-y-1 mb-6">
          {[
            { icon: CircleHelp, label: 'Help Center' },
            { icon: FileText, label: 'Terms of Service' },
            { icon: Shield, label: 'Privacy Policy' },
          ].map(item => (
            <button
              key={item.label}
              className="w-full flex items-center justify-between py-3.5 px-1 border-b border-black/[0.06]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-parties-soft flex items-center justify-center">
                  <item.icon size={17} className="text-parties-secondary" />
                </div>
                <span className="text-[15px] font-medium text-parties-text">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-parties-muted" />
            </button>
          ))}
        </div>

        <button
          onClick={handleSignOut}
          className="w-full mt-4 py-4 rounded-[14px] border border-red-500/30 text-[#FF3B30] text-[15px] font-semibold flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Sign Out
        </button>

        <p className="text-center mt-6 text-xs text-parties-muted">
          Parties v1.0.0 · Made in Miami
        </p>
      </div>
    </div>
  )
}
