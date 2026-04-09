"use client";
import { useState } from "react";
import { callEdgeFunction } from "./supabase";

interface CheckoutParams {
  venueId: number;
  tableOptionId: number;
  guests: number;
  date: string;
  time: string;
  userId: string;
  promoCode?: string;
}

export function useBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckout = async (params: CheckoutParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await callEdgeFunction("create-checkout", params);
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout session");
      }
      return data;
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createCheckout, loading, error };
}
