"use client";
import { useState, useEffect, useCallback } from "react";
import { fetchFavorites, addFavorite, removeFavorite } from "./supabase";

export function useFavorites(userId: string | null) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchFavorites(userId);
      setFavorites(Array.isArray(data) ? data : []);
    } catch { setFavorites([]); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const isFavorite = useCallback((venueId: number) => {
    return favorites.some((f) => f.venue_id === venueId);
  }, [favorites]);

  const toggle = useCallback(async (venueId: number) => {
    if (!userId) return;
    const exists = isFavorite(venueId);
    // Optimistic update
    if (exists) {
      setFavorites((prev) => prev.filter((f) => f.venue_id !== venueId));
      try { await removeFavorite(userId, venueId); } catch { load(); }
    } else {
      setFavorites((prev) => [...prev, { venue_id: venueId, user_id: userId }]);
      try { await addFavorite(userId, venueId); } catch { load(); }
    }
  }, [userId, isFavorite, load]);

  return { favorites, loading, isFavorite, toggle, reload: load };
}
