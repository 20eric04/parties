"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getUser, fetchProfile, updateProfile } from "@/lib/supabase";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) { setLoading(false); return; }
    setFirstName(user.user_metadata?.first_name || "");
    setLastName(user.user_metadata?.last_name || "");
    setPhone(user.phone || "");
    fetchProfile(user.id)
      .then((p) => {
        if (p) {
          if (p.first_name) setFirstName(p.first_name);
          if (p.last_name) setLastName(p.last_name);
          if (p.phone) setPhone(p.phone);
          if (p.push_notifications !== undefined) setPushNotif(p.push_notifications);
          if (p.email_notifications !== undefined) setEmailNotif(p.email_notifications);
          if (p.sms_notifications !== undefined) setSmsNotif(p.sms_notifications);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    const user = getUser();
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        phone,
        push_notifications: pushNotif,
        email_notifications: emailNotif,
        sms_notifications: smsNotif,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-dvh bg-white pt-14 px-5 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1 text-parties-text">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-parties-text">Edit Profile</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="text-parties-muted animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Fields */}
          <div>
            <label className="block text-xs font-semibold text-parties-secondary uppercase tracking-wider mb-2">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-parties-soft rounded-xl py-3 px-4 text-sm text-parties-text outline-none focus:ring-2 focus:ring-parties-accent/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-parties-secondary uppercase tracking-wider mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-parties-soft rounded-xl py-3 px-4 text-sm text-parties-text outline-none focus:ring-2 focus:ring-parties-accent/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-parties-secondary uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-parties-soft rounded-xl py-3 px-4 text-sm text-parties-text placeholder:text-parties-muted outline-none focus:ring-2 focus:ring-parties-accent/30"
            />
          </div>

          {/* Notification toggles */}
          <div className="pt-2">
            <h2 className="text-xs font-semibold text-parties-secondary uppercase tracking-wider mb-4">
              Notifications
            </h2>
            <div className="space-y-4">
              <Toggle label="Push Notifications" value={pushNotif} onChange={setPushNotif} />
              <Toggle label="Email Notifications" value={emailNotif} onChange={setEmailNotif} />
              <Toggle label="SMS Notifications" value={smsNotif} onChange={setSmsNotif} />
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-parties-accent text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : saved ? (
              "Saved!"
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-parties-text">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative ${
          value ? "bg-parties-accent" : "bg-gray-200"
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
            value ? "translate-x-5.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
