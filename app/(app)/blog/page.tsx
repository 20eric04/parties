"use client";
import { useState } from "react";
import { ArrowLeft, Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["All", "Nightlife", "Travel", "Dining", "Lifestyle"];

const POSTS = [
  {
    id: 1,
    title: "The Best Rooftop Bars in Miami for 2026",
    excerpt: "From Brickell to South Beach, these elevated lounges offer the city's most stunning skyline views paired with world-class cocktails.",
    category: "Nightlife",
    date: "2026-03-15",
    readTime: "5 min read",
    img: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80",
    body: "Miami's rooftop scene continues to evolve, with stunning new additions joining beloved classics. Whether you're seeking a laid-back sunset session or an all-night celebration high above the city, these are the spots that define Miami's skyline nightlife.\n\nStarting in Brickell, the financial district's gleaming towers now host some of the most innovative cocktail programs in the country. The newest entrant, a glass-enclosed penthouse bar on the 60th floor, offers 360-degree views that stretch from the Everglades to the Atlantic.\n\nMoving to South Beach, the classic Art Deco hotels have upped their rooftop game with infinity pools that seem to merge with the ocean horizon. Live DJs spin deep house sets as the sun dips below the skyline, creating an atmosphere that's uniquely Miami.\n\nFor a more intimate experience, Wynwood's converted warehouse rooftops offer craft cocktails surrounded by murals from world-renowned street artists. These hidden gems are perfect for those who want to escape the mainstream scene while still enjoying the energy that makes Miami unforgettable.",
  },
  {
    id: 2,
    title: "Ibiza 2026: Your Complete Guide to the Island",
    excerpt: "Everything you need to know about the White Isle — from hidden beaches and farm-to-table restaurants to the legendary club scene.",
    category: "Travel",
    date: "2026-03-10",
    readTime: "8 min read",
    img: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80",
    body: "Ibiza has always been more than just a party destination. Behind the legendary clubs and world-famous DJs lies an island of extraordinary natural beauty, rich culture, and a culinary scene that rivals any Mediterranean hotspot.\n\nThe northern coast remains the island's best-kept secret, with secluded coves accessible only by boat or rugged hiking trails. Pack a picnic from one of the local markets and spend the day swimming in crystal-clear turquoise waters far from the crowds.\n\nThe farm-to-table movement has taken root across the island, with former farmhouses (fincas) transformed into outstanding restaurants. Local chefs celebrate Ibicenco traditions while incorporating techniques from their global travels.\n\nAnd yes, the nightlife is still unmatched. The 2026 season promises headline residencies that will draw music lovers from every corner of the globe. But the real magic happens at the smaller venues — intimate open-air clubs where you can dance under the stars until sunrise.",
  },
  {
    id: 3,
    title: "Inside Nobu's New Tulum Outpost",
    excerpt: "The iconic Japanese-Peruvian restaurant opens its most ambitious location yet, nestled in the Riviera Maya jungle.",
    category: "Dining",
    date: "2026-03-05",
    readTime: "4 min read",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    body: "When Nobu Matsuhisa chose the jungles of Tulum for his latest venture, he wasn't just opening another restaurant — he was creating an experience that merges his signature cuisine with one of the world's most magical settings.\n\nThe space itself is a masterwork of sustainable architecture. Open-air dining rooms flow between ancient ceiba trees, with a thatched palapa roof that lets dappled sunlight dance across the tables. At night, hundreds of candles transform the jungle into an enchanted dining room.\n\nThe menu draws inspiration from both the local Mayan culinary tradition and the Yucatan's incredible seafood. Dishes like miso-glazed grouper with habanero salsa and black cod with recado negro showcase the kitchen's ability to honor two distinct culinary traditions simultaneously.\n\nReservations are essential — the intimate 80-seat dining room fills up weeks in advance, though walk-ins can sometimes score a seat at the spectacular bar carved from a single piece of local limestone.",
  },
  {
    id: 4,
    title: "The Art of the Perfect Weekend Getaway",
    excerpt: "How to plan a luxurious two-day escape that feels like a full vacation — from packing light to maximizing every moment.",
    category: "Lifestyle",
    date: "2026-02-28",
    readTime: "6 min read",
    img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    body: "The modern weekend getaway is an art form. With the right planning, 48 hours can deliver the reset and rejuvenation of a much longer trip. The secret lies not in cramming more in, but in being intentional about every choice.\n\nStart with the destination. The best weekend escapes are close enough that travel doesn't eat into your time — ideally within a two-hour flight or drive. Think coastal towns, mountain retreats, or vibrant small cities that offer a complete change of scenery.\n\nPacking is where most people go wrong. A single carry-on with versatile pieces that transition from day to night will free you from luggage stress. Choose a color palette, pack layers, and invest in one statement piece that elevates everything.\n\nThe key to a transformative weekend is balance: one planned experience, one spontaneous discovery, and plenty of unstructured time. Book that restaurant you've been wanting to try, but leave room to wander and find the unexpected cafe, gallery, or sunset viewpoint that becomes the trip's defining memory.",
  },
];

export default function BlogPage() {
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState<typeof POSTS[number] | null>(null);

  const filtered = category === "All" ? POSTS : POSTS.filter((p) => p.category === category);

  return (
    <div className="min-h-dvh bg-white pt-14 px-5 pb-28">
      <div className="flex items-center gap-3 mb-1">
        <button onClick={() => router.back()} className="p-1 text-parties-text">
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-display text-[28px] font-semibold text-parties-text">Journal</h1>
      </div>
      <p className="text-sm text-parties-secondary mb-5 pl-8">Stories, guides, and inspiration</p>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === c
                ? "bg-parties-text text-white"
                : "bg-parties-soft text-parties-secondary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-5">
        {filtered.map((post, i) => (
          <motion.button
            key={post.id}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setSelectedPost(post)}
            className="w-full text-left rounded-2xl overflow-hidden border border-black/[0.06] active:scale-[0.99] transition-transform"
          >
            <div className="h-[200px] bg-parties-soft">
              <img src={post.img} alt={post.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-parties-accent/10 text-parties-accent text-[10px] font-semibold rounded-full">
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-parties-muted">
                  <Clock size={11} />
                  {post.readTime}
                </span>
              </div>
              <h3 className="text-base font-semibold text-parties-text mb-1 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-parties-secondary line-clamp-2">{post.excerpt}</p>
              <p className="text-[11px] text-parties-muted mt-2">
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Expanded post sheet */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl w-full max-h-[90dvh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-5 pt-4 pb-2 flex items-center justify-between border-b border-black/[0.06]">
                <div>
                  <span className="px-2.5 py-0.5 bg-parties-accent/10 text-parties-accent text-[10px] font-semibold rounded-full">
                    {selectedPost.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="w-8 h-8 rounded-full bg-parties-soft flex items-center justify-center"
                >
                  <X size={18} className="text-parties-text" />
                </button>
              </div>
              <div className="h-[240px]">
                <img
                  src={selectedPost.img}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-5 py-5">
                <h2 className="font-display text-2xl font-semibold text-parties-text mb-2">
                  {selectedPost.title}
                </h2>
                <div className="flex items-center gap-3 mb-5 text-xs text-parties-muted">
                  <span>
                    {new Date(selectedPost.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {selectedPost.readTime}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none">
                  {selectedPost.body.split("\n\n").map((para, i) => (
                    <p key={i} className="text-sm text-parties-secondary leading-relaxed mb-4">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
