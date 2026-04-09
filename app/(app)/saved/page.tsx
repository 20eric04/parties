"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Star, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchFavorites, removeFavorite, getUser } from "@/lib/supabase";

export default function SavedPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    const user = getUser();
    if (!user) { setLoading(false); return; }
    fetchFavorites(user.id)
      .then((d) => setFavorites(Array.isArray(d) ? d : []))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(venueId: number) {
    const user = getUser();
    if (!user) return;
    setRemoving(venueId);
    try {
      await removeFavorite(user.id, venueId);
      setFavorites((prev) => prev.filter((f) => f.venue_id !== venueId));
    } catch {
      // ignore
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="min-h-dvh bg-white pt-14 px-5 pb-28">
      <h1 className="text-[26px] font-bold text-parties-text mb-2">Saved</h1>
      <p className="text-sm text-parties-secondary mb-6">Your favorite venues and experiences.</p>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[200px] bg-parties-soft rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-parties-soft flex items-center justify-center mb-4">
            <Heart size={28} className="text-parties-muted" />
          </div>
          <h3 className="text-lg font-semibold text-parties-text mb-1">No saves yet</h3>
          <p className="text-sm text-parties-secondary text-center max-w-[260px]">
            Tap the heart on any venue to save it here.
          </p>
          <button
            onClick={() => router.push("/explore")}
            className="mt-6 px-6 py-2.5 bg-parties-accent text-white text-sm font-semibold rounded-xl"
          >
            Browse venues
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {favorites.map((fav) => {
              const venue = fav.venues;
              if (!venue) return null;
              return (
                <motion.div
                  key={fav.venue_id}
                  layout
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="rounded-2xl overflow-hidden border border-black/[0.06]"
                >
                  <button
                    onClick={() => router.push(`/venue/${venue.id}`)}
                    className="w-full text-left active:scale-[0.99] transition-transform"
                  >
                    <div className="relative h-[160px] bg-parties-soft">
                      {venue.img_url && (
                        <img
                          src={venue.img_url}
                          alt={venue.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(fav.venue_id);
                        }}
                        disabled={removing === fav.venue_id}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
                      >
                        <Heart
                          size={18}
                          className={`text-parties-accent fill-parties-accent ${
                            removing === fav.venue_id ? "opacity-50" : ""
                          }`}
                        />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-parties-text">{venue.name}</h3>
                          <div className="flex items-center gap-1 mt-0.5 text-sm text-parties-secondary">
                            <MapPin size={13} />
                            {venue.city}
                          </div>
                        </div>
                        {venue.rating && (
                          <div className="flex items-center gap-1 text-sm font-semibold text-parties-text">
                            <Star size={14} className="text-parties-accent fill-parties-accent" />
                            {venue.rating}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
