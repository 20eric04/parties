"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, Star, Users, Clock, MapPin, Tag, Share2, X, ChevronLeft, ChevronRight, Music, Shirt, Copy, Check, MessageCircle } from "lucide-react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { fetchVenue, fetchTableOptions, fetchVenueReviews, validatePromo, getUser } from "@/lib/supabase";
import { useBooking } from "@/lib/useBooking";
import PricingSeasonBadge from "@/components/PricingSeasonBadge";
import Link from "next/link";

const TIME_SLOTS = ["9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM", "12:00 AM", "12:30 AM"];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type TabKey = "overview" | "menu" | "reviews";

function formatReviewDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
    if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function VenueDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { createCheckout, loading: bookingLoading } = useBooking();
  const [venue, setVenue] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);
  const [sheet, setSheet] = useState(false);
  const [guests, setGuests] = useState(4);
  const [saved, setSaved] = useState(false);
  const [time, setTime] = useState("10:00 PM");
  const [promo, setPromo] = useState("");
  const [promoResult, setPromoResult] = useState<any>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [shareToast, setShareToast] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchVenue(Number(id)).then(setVenue);
      fetchTableOptions(Number(id)).then(d => setTables(Array.isArray(d) ? d : []));
      fetchVenueReviews(Number(id)).then(d => setReviews(Array.isArray(d) ? d : [])).catch(() => setReviews([]));
    }
  }, [id]);

  // Gallery images: use gallery_images array if available, fallback to img_url
  const galleryImages: string[] = venue
    ? (Array.isArray(venue.gallery_images) && venue.gallery_images.length > 0
      ? venue.gallery_images
      : venue.img_url ? [venue.img_url] : [])
    : [];

  // Operating hours parsing
  const operatingHours: { day: string; time: string }[] = venue?.operating_hours
    ? (Array.isArray(venue.operating_hours)
      ? venue.operating_hours
      : typeof venue.operating_hours === "object"
        ? DAYS.map((day) => ({ day, time: (venue.operating_hours as any)[day] || (venue.operating_hours as any)[day.toLowerCase()] || "Closed" }))
        : [])
    : [];

  // Menu data
  const menuSections: { name: string; items: { name: string; price: string | number }[] }[] =
    venue?.menu && Array.isArray(venue.menu) ? venue.menu : [];

  // Reviews average
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length)
    : 0;

  const handlePromo = async () => {
    if (!promo.trim()) return;
    setPromoLoading(true);
    try {
      const r = await validatePromo(promo.trim());
      setPromoResult(r ? { valid: true, discount: r.discount_percent || r.discount_amount, type: r.discount_percent ? "percent" : "fixed" } : { valid: false });
    } catch { setPromoResult({ valid: false }); }
    finally { setPromoLoading(false); }
  };

  const handleBook = async () => {
    const user = getUser();
    if (!user || !sel) return;
    await createCheckout({
      venueId: Number(id),
      tableOptionId: sel.id,
      guests,
      date: new Date().toISOString().split("T")[0],
      time,
      userId: user.id,
      promoCode: promoResult?.valid ? promo : undefined,
    });
  };

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const title = venue?.name || "Check out this venue";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      } catch { /* clipboard failed */ }
    }
  }, [venue]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxNav = (dir: number) => {
    setLightboxIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return galleryImages.length - 1;
      if (next >= galleryImages.length) return 0;
      return next;
    });
  };

  const handleLightboxDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 80) {
      lightboxNav(info.offset.x > 0 ? -1 : 1);
    }
    if (info.offset.y > 120) {
      setLightboxOpen(false);
    }
  };

  if (!venue) return <div className="min-h-dvh bg-white flex items-center justify-center"><div className="w-8 h-8 border-2 border-parties-accent/30 border-t-parties-accent rounded-full animate-spin" /></div>;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "menu", label: "Menu" },
    { key: "reviews", label: "Reviews" },
  ];

  return (
    <div className="min-h-dvh bg-white relative">
      {/* Photo Gallery */}
      {galleryImages.length > 0 && (
        <div className="relative">
          <div
            ref={galleryRef}
            className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory"
          >
            {galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => openLightbox(i)}
                className="shrink-0 w-full h-[340px] snap-center relative"
              >
                <img
                  src={img}
                  alt={`${venue.name} photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Gallery dots */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
              {galleryImages.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === 0 ? "bg-white" : "bg-white/40"}`} />
              ))}
            </div>
          )}

          {/* Header overlay */}
          <div className="absolute top-12 left-0 right-0 flex items-center justify-between px-5">
            <button onClick={() => router.back()} className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center">
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center">
                <Share2 size={18} className="text-white" />
              </button>
              <button onClick={() => setSaved(!saved)} className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center">
                <Heart size={20} className={saved ? "text-red-500 fill-red-500" : "text-white"} />
              </button>
            </div>
          </div>

          {/* Venue name overlay */}
          <div className="absolute bottom-6 left-5 right-5">
            <h1 className="font-display text-3xl text-white font-semibold">{venue.name}</h1>
            <p className="text-sm text-white/70 mt-1 flex items-center gap-2">
              <MapPin size={14} />{venue.city}
              {(avgRating > 0 || venue.rating) && (
                <span className="flex items-center gap-1 ml-2">
                  <Star size={14} className="text-parties-accent fill-parties-accent" />
                  {avgRating > 0 ? avgRating.toFixed(1) : venue.rating}
                  {reviews.length > 0 && <span className="text-white/50">({reviews.length})</span>}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Fallback if no gallery images */}
      {galleryImages.length === 0 && (
        <div className="relative h-[340px] bg-parties-soft">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-12 left-0 right-0 flex items-center justify-between px-5">
            <button onClick={() => router.back()} className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center"><ArrowLeft size={20} className="text-white" /></button>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center"><Share2 size={18} className="text-white" /></button>
              <button onClick={() => setSaved(!saved)} className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center"><Heart size={20} className={saved ? "text-red-500 fill-red-500" : "text-white"} /></button>
            </div>
          </div>
          <div className="absolute bottom-6 left-5 right-5">
            <h1 className="font-display text-3xl text-white font-semibold">{venue.name}</h1>
            <p className="text-sm text-white/70 mt-1 flex items-center gap-2"><MapPin size={14} />{venue.city}
              {venue.rating && <span className="flex items-center gap-1 ml-2"><Star size={14} className="text-parties-accent fill-parties-accent" />{venue.rating}</span>}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="sticky top-0 z-20 bg-white border-b border-black/[0.06]">
        <div className="flex px-5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-1 py-3.5 text-sm font-semibold text-center transition-colors ${activeTab === tab.key ? "text-parties-accent" : "text-parties-muted"}`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-parties-accent rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-5 pt-6 pb-32">
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Quick info cards */}
              <div className="flex gap-4 mb-6">
                {[
                  { icon: Clock, label: "Open", value: venue.hours || "10PM-4AM" },
                  { icon: Users, label: "Capacity", value: venue.capacity || "500+" },
                ].map((s, i) => (
                  <div key={i} className="flex-1 bg-parties-soft rounded-xl p-3.5 flex items-center gap-3">
                    <s.icon size={18} className="text-parties-accent" />
                    <div>
                      <p className="text-[10px] text-parties-muted uppercase">{s.label}</p>
                      <p className="text-sm font-semibold text-parties-text">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dress code & music tags */}
              {(venue.dress_code || venue.music_genre || venue.music_genres) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {venue.dress_code && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-parties-soft rounded-full text-xs font-semibold text-parties-text">
                      <Shirt size={12} className="text-parties-accent" />
                      {venue.dress_code}
                    </span>
                  )}
                  {(venue.music_genres || (venue.music_genre ? [venue.music_genre] : [])).map((genre: string, i: number) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-parties-soft rounded-full text-xs font-semibold text-parties-text">
                      <Music size={12} className="text-parties-accent" />
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* About */}
              {venue.description && (
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-parties-text mb-2">About</h3>
                  <p className="text-sm text-parties-secondary leading-relaxed">{venue.description}</p>
                </div>
              )}

              {/* Operating Hours */}
              {operatingHours.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-parties-text mb-3">Hours</h3>
                  <div className="bg-parties-soft rounded-xl p-4 space-y-2.5">
                    {operatingHours.map((h, i) => {
                      const dayLabel = DAYS_SHORT[DAYS.indexOf(h.day)] || h.day;
                      const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }) === h.day;
                      return (
                        <div key={i} className={`flex items-center justify-between text-sm ${isToday ? "font-semibold text-parties-text" : "text-parties-secondary"}`}>
                          <span className="flex items-center gap-2">
                            {dayLabel}
                            {isToday && <span className="text-[9px] font-bold bg-parties-accent text-white px-1.5 py-0.5 rounded-full">TODAY</span>}
                          </span>
                          <span>{h.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {venue.city && <PricingSeasonBadge city={venue.city} variant="detail" className="mb-6" />}

              {/* Time selection */}
              <h3 className="text-base font-semibold text-parties-text mb-3">Select a time</h3>
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
                {TIME_SLOTS.map((t) => (
                  <button key={t} onClick={() => setTime(t)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${time === t ? "bg-parties-accent text-white" : "bg-parties-soft text-parties-secondary"}`}>{t}</button>
                ))}
              </div>

              {/* Table selection */}
              <h3 className="text-base font-semibold text-parties-text mb-3">Select a table</h3>
              <div className="space-y-3">
                {tables.map(t => (
                  <button key={t.id} onClick={() => { setSel(t); setSheet(true); }} className={`w-full text-left p-4 rounded-xl border transition-colors ${sel?.id === t.id ? "border-parties-accent bg-red-50" : "border-black/[0.06] bg-white"}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-parties-text">{t.label || t.name}</h4>
                          {t.vip && <span className="text-[10px] font-bold bg-parties-accent text-white px-2 py-0.5 rounded-full">VIP</span>}
                        </div>
                        <p className="text-sm text-parties-secondary mt-1">Up to {t.max_guests || 10} guests</p>
                      </div>
                      <p className="text-lg font-bold text-parties-text">${t.min_spend || t.price || "--"}</p>
                    </div>
                  </button>
                ))}
                {tables.length === 0 && <p className="text-center text-sm text-parties-muted py-8">No tables available</p>}
              </div>

              {/* Promo code */}
              <div className="mt-6 mb-6">
                <h3 className="text-base font-semibold text-parties-text mb-3">Promo code</h3>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-parties-muted" />
                    <input type="text" value={promo} onChange={(e) => { setPromo(e.target.value.toUpperCase()); setPromoResult(null); }} placeholder="Enter code" className="w-full bg-parties-soft rounded-xl py-3 pl-9 pr-4 text-sm outline-none" />
                  </div>
                  <button onClick={handlePromo} disabled={promoLoading} className="px-4 py-3 bg-parties-text text-white text-sm font-semibold rounded-xl">
                    {promoLoading ? "..." : "Apply"}
                  </button>
                </div>
                {promoResult && (
                  <p className={`text-xs mt-2 ${promoResult.valid ? "text-green-600" : "text-red-500"}`}>
                    {promoResult.valid ? `Discount applied: ${promoResult.type === "percent" ? `${promoResult.discount}% off` : `$${promoResult.discount} off`}` : "Invalid promo code"}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* MENU TAB */}
          {activeTab === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {menuSections.length > 0 ? (
                <div className="space-y-8">
                  {menuSections.map((section, si) => (
                    <div key={si}>
                      <h3 className="text-base font-semibold text-parties-text mb-4 uppercase tracking-wide">{section.name}</h3>
                      <div className="space-y-3">
                        {section.items.map((item, ii) => (
                          <div key={ii} className="flex items-center justify-between p-4 bg-parties-soft rounded-xl">
                            <span className="text-sm font-medium text-parties-text">{item.name}</span>
                            <span className="text-sm font-bold text-parties-text ml-4 shrink-0">
                              {typeof item.price === "number" ? `$${item.price.toLocaleString()}` : item.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-parties-soft rounded-full flex items-center justify-center mb-4">
                    <MessageCircle size={24} className="text-parties-muted" />
                  </div>
                  <h3 className="text-base font-semibold text-parties-text mb-2">Menu available upon request</h3>
                  <p className="text-sm text-parties-secondary mb-6 max-w-[260px]">
                    Our concierge team can share the full menu and help with bottle packages.
                  </p>
                  <Link
                    href="/concierge"
                    className="px-6 py-3 bg-parties-accent text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition-transform"
                  >
                    Ask your concierge
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {reviews.length > 0 ? (
                <>
                  {/* Average rating header */}
                  <div className="flex items-center gap-4 mb-6 p-4 bg-parties-soft rounded-xl">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-parties-text">{avgRating.toFixed(1)}</p>
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            size={14}
                            className={j < Math.round(avgRating)
                              ? "text-parties-accent fill-parties-accent"
                              : "text-black/10"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-xs text-parties-muted mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                    </div>
                    {/* Rating distribution */}
                    <div className="flex-1 space-y-1">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews.filter((r: any) => r.rating === star).length;
                        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-parties-muted w-3 text-right">{star}</span>
                            <div className="flex-1 h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-parties-accent rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual reviews */}
                  <div className="space-y-3">
                    {reviews.map((r: any, i: number) => (
                      <motion.div
                        key={r.id || i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 bg-parties-soft rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-parties-text">
                            {r.user_first_name || r.first_name || r.name || "Guest"}
                          </span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: r.rating || 0 }).map((_, j) => (
                              <Star key={j} size={12} className="text-parties-accent fill-parties-accent" />
                            ))}
                          </div>
                        </div>
                        {r.text && <p className="text-sm text-parties-secondary">{r.text}</p>}
                        {r.comment && !r.text && <p className="text-sm text-parties-secondary">{r.comment}</p>}
                        <p className="text-xs text-parties-muted mt-2">
                          {r.created_at ? formatReviewDate(r.created_at) : r.date || ""}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-parties-soft rounded-full flex items-center justify-center mb-4">
                    <Star size={24} className="text-parties-muted" />
                  </div>
                  <h3 className="text-base font-semibold text-parties-text mb-2">No reviews yet</h3>
                  <p className="text-sm text-parties-secondary max-w-[260px]">
                    Be the first to share your experience at {venue.name}.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Booking bottom sheet */}
      {sheet && sel && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheet(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pb-10 animate-slide-up">
            <div className="w-10 h-1 bg-black/10 rounded-full mx-auto mb-6" />
            <h3 className="font-display text-2xl text-parties-text mb-4">Book {sel.label || sel.name}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-black/[0.06]"><span className="text-sm text-parties-secondary">Time</span><span className="text-sm font-semibold text-parties-text">{time}</span></div>
              <div className="flex items-center justify-between py-3 border-b border-black/[0.06]"><span className="text-sm text-parties-secondary">Guests</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-parties-text">-</button>
                  <span className="text-sm font-semibold w-6 text-center">{guests}</span>
                  <button onClick={() => setGuests(Math.min(20, guests + 1))} className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-parties-text">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between py-3"><span className="text-sm text-parties-secondary">Minimum spend</span><span className="text-lg font-bold text-parties-text">${sel.min_spend || sel.price || 0}</span></div>
              {promoResult?.valid && <div className="flex items-center justify-between py-3 border-t border-black/[0.06]"><span className="text-sm text-green-600">Promo discount</span><span className="text-sm font-semibold text-green-600">-{promoResult.type === "percent" ? `${promoResult.discount}%` : `$${promoResult.discount}`}</span></div>}
            </div>
            <button onClick={handleBook} disabled={bookingLoading} className="w-full mt-6 py-4 bg-parties-accent text-white text-base font-semibold rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center">
              {bookingLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Continue to Payment"}
            </button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && galleryImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-12 right-5 z-10 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center"
            >
              <X size={20} className="text-white" />
            </button>

            {/* Image counter */}
            <div className="absolute top-12 left-5 z-10 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full">
              <span className="text-sm text-white font-medium">{lightboxIndex + 1} / {galleryImages.length}</span>
            </div>

            {/* Navigation arrows (desktop) */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={() => lightboxNav(-1)}
                  className="absolute left-3 z-10 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft size={22} className="text-white" />
                </button>
                <button
                  onClick={() => lightboxNav(1)}
                  className="absolute right-3 z-10 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronRight size={22} className="text-white" />
                </button>
              </>
            )}

            {/* Draggable image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                drag={galleryImages.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={handleLightboxDragEnd}
                className="w-full h-full flex items-center justify-center px-4 cursor-grab active:cursor-grabbing"
              >
                <img
                  src={galleryImages[lightboxIndex]}
                  alt={`${venue.name} photo ${lightboxIndex + 1}`}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg select-none"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                {galleryImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === lightboxIndex ? "bg-white scale-125" : "bg-white/30"}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 bg-parties-text rounded-full flex items-center gap-2 shadow-lg"
          >
            <Check size={16} className="text-green-400" />
            <span className="text-sm text-white font-medium">Link copied to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
