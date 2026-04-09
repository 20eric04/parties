"use client";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function BookingCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-parties-bg flex flex-col items-center justify-center px-5 py-12">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="mb-6"
      >
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
          <XCircle size={48} className="text-red-500" />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-10"
      >
        <h1 className="font-display text-2xl font-semibold text-white mb-2">Booking Cancelled</h1>
        <p className="text-sm text-white/50 max-w-[280px]">
          The payment was not completed. No charges have been made.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm space-y-3"
      >
        <button
          onClick={() => router.back()}
          className="w-full py-3.5 bg-parties-accent text-white text-sm font-semibold rounded-xl"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push("/explore")}
          className="w-full py-3.5 bg-parties-surface text-white/70 text-sm font-semibold rounded-xl"
        >
          Browse Venues
        </button>
      </motion.div>
    </div>
  );
}
