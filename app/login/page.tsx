"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, ChevronRight } from "lucide-react";
import { signUp, signIn, sendOTP, verifyOTP } from "@/lib/supabase";

const CITIES = ["Miami","NYC","Las Vegas","Scottsdale","St. Martin","St. Barths","Tulum","Cabo","Ibiza","Mykonos","London","Paris","Amsterdam","Barcelona","Milan"];
type Step = "email" | "details" | "phone" | "otp" | "cities";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const refs = useRef<(HTMLInputElement|null)[]>([]);

  const next = async () => {
    setError(""); setLoading(true);
    try {
      if (step === "email") { if (!email.includes("@")) { setError("Enter a valid email"); return; } setStep("details"); }
      else if (step === "details") {
        if (!firstName || password.length < 6) { setError("Name required, password 6+ chars"); return; }
        const r = await signUp(email, password);
        if (r.error) { const s = await signIn(email, password); if (s.error) { setError(s.error.message || "Auth failed"); return; } }
        setStep("phone");
      }
      else if (step === "phone") { setStep("otp"); if (phone.length >= 10) await sendOTP(`+1${phone.replace(/\D/g,"")}`).catch(()=>{}); }
      else if (step === "otp") {
        const code = otp.join("");
        if (code.length === 6 && phone) {
          const r = await verifyOTP(`+1${phone.replace(/\D/g, "")}`, code);
          if (r.error) { setError(r.error.message || "Invalid code. Please try again."); return; }
        }
        setStep("cities");
      }
      else if (step === "cities") { router.push("/explore"); }
    } catch (e: any) { setError(e.message || "Something went wrong"); } finally { setLoading(false); }
  };

  const otpChange = (i: number, v: string) => {
    if (v.length > 1) v = v[v.length-1];
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) refs.current[i+1]?.focus();
  };

  const toggle = (c: string) => setCities(p => p.includes(c) ? p.filter(x=>x!==c) : [...p, c]);
  const ok = () => { if (step==="email") return email.length>0; if (step==="details") return firstName.length>0&&password.length>=6; if (step==="cities") return cities.length>0; return true; };
  const back = () => { const s: Step[] = ["email","details","phone","otp","cities"]; const i = s.indexOf(step); if (i>0) setStep(s[i-1]); };

  return (
    <div className="min-h-dvh bg-parties-bg text-white flex flex-col">
      <div className="flex items-center px-5 pt-14 pb-4">
        {step !== "email" && <button onClick={back} className="p-2 -ml-2 text-white/60"><ArrowLeft size={22}/></button>}
      </div>
      <div className="flex gap-1.5 px-5 mb-10">
        {(["email","details","phone","otp","cities"] as Step[]).map((s,i) => (
          <div key={s} className={`h-[3px] flex-1 rounded-full transition-colors ${(["email","details","phone","otp","cities"] as Step[]).indexOf(step)>=i ? "bg-parties-accent" : "bg-white/10"}`}/>
        ))}
      </div>
      <div className="flex-1 px-5">
        {step==="email" && <div className="animate-slide-up"><h2 className="font-display text-3xl text-white mb-2">What&apos;s your email?</h2><p className="text-sm text-white/50 mb-8">We&apos;ll use this to sign you in.</p>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@email.com" autoFocus className="w-full bg-transparent border-b-2 border-white/20 focus:border-parties-accent text-lg py-3 outline-none text-white placeholder:text-white/25 transition-colors" onKeyDown={e=>e.key==="Enter"&&ok()&&next()}/></div>}
        {step==="details" && <div className="animate-slide-up"><h2 className="font-display text-3xl text-white mb-2">Create your account</h2><p className="text-sm text-white/50 mb-8">Just a few details.</p>
          <div className="space-y-6"><div className="flex gap-3">
            <input type="text" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name" autoFocus className="flex-1 bg-transparent border-b-2 border-white/20 focus:border-parties-accent text-lg py-3 outline-none text-white placeholder:text-white/25 transition-colors"/>
            <input type="text" value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name" className="flex-1 bg-transparent border-b-2 border-white/20 focus:border-parties-accent text-lg py-3 outline-none text-white placeholder:text-white/25 transition-colors"/></div>
          <div className="relative"><input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (6+ characters)" className="w-full bg-transparent border-b-2 border-white/20 focus:border-parties-accent text-lg py-3 outline-none text-white placeholder:text-white/25 transition-colors pr-12" onKeyDown={e=>e.key==="Enter"&&ok()&&next()}/>
            <button onClick={()=>setShowPw(!showPw)} className="absolute right-0 top-3 p-1 text-white/40">{showPw?<EyeOff size={20}/>:<Eye size={20}/>}</button></div></div></div>}
        {step==="phone" && <div className="animate-slide-up"><h2 className="font-display text-3xl text-white mb-2">Phone number</h2><p className="text-sm text-white/50 mb-8">For booking confirmations.</p>
          <div className="flex items-center gap-3"><span className="text-lg text-white/50 border-b-2 border-white/20 py-3 px-1">+1</span>
          <input type="tel" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="(555) 000-0000" autoFocus className="flex-1 bg-transparent border-b-2 border-white/20 focus:border-parties-accent text-lg py-3 outline-none text-white placeholder:text-white/25 transition-colors"/></div>
          <button onClick={next} className="mt-6 text-sm text-parties-accent">Skip for now</button></div>}
        {step==="otp" && <div className="animate-slide-up"><h2 className="font-display text-3xl text-white mb-2">Enter code</h2><p className="text-sm text-white/50 mb-8">Sent to +1 {phone||"..."}</p>
          <div className="flex items-center justify-center gap-2">{otp.map((d,i)=>(<div key={i} className="flex items-center gap-2">
            <input ref={el=>{refs.current[i]=el}} type="text" inputMode="numeric" maxLength={1} value={d} onChange={e=>otpChange(i,e.target.value)} onKeyDown={e=>{if(e.key==="Backspace"&&!d&&i>0) refs.current[i-1]?.focus()}}
              className="w-12 h-14 text-center text-xl font-semibold bg-white/5 border border-white/15 rounded-xl text-white outline-none focus:border-parties-accent transition-colors"/>
            {i===2&&<span className="text-white/20 text-xl mx-1">-</span>}</div>))}</div>
          <p className="mt-8 text-center text-sm text-white/40">Didn&apos;t get a code? <button onClick={()=>{if(phone) sendOTP(`+1${phone.replace(/\D/g,"")}`).catch(()=>{})}} className="text-parties-accent">Resend</button></p>
          <button onClick={()=>{setOtp(["","","","","",""]); setStep("cities")}} className="mt-4 block mx-auto text-sm text-parties-accent">Skip for now</button></div>}
        {step==="cities" && <div className="animate-slide-up"><h2 className="font-display text-3xl text-white mb-2">Pick your cities</h2><p className="text-sm text-white/50 mb-8">We&apos;ll show you what&apos;s happening there.</p>
          <div className="grid grid-cols-2 gap-3">{CITIES.map(c=>(<button key={c} onClick={()=>toggle(c)} className={`py-3.5 px-4 rounded-xl text-sm font-medium text-left transition-all ${cities.includes(c)?"bg-parties-accent text-white border border-parties-accent":"bg-white/5 text-white/70 border border-white/10"}`}>{c}{cities.includes(c)&&<span className="float-right">✓</span>}</button>))}</div></div>}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
      <div className="p-5 pb-10">
        <button onClick={next} disabled={!ok()||loading} className={`w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${ok()&&!loading?"bg-parties-accent text-white":"bg-white/10 text-white/30"}`}>
          {loading?<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<>{step==="cities"?"Start exploring":step==="phone"?"Send code":"Next"}<ChevronRight size={18}/></>}
        </button>
      </div>
    </div>
  );
}
