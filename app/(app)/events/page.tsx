"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Ticket, LayoutList, ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchEvents } from "@/lib/supabase";
import {
  MAJOR_EVENTS,
  CATEGORY_COLORS,
  getUpcomingEvents,
  getEventsForMonth,
  getEventsForDate,
  formatDateRange,
  type MajorEvent,
  type EventCategory,
} from "@/lib/event-calendar";

function dateBadge(dateStr: string) {
  const d = new Date(dateStr);
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = d.getDate();
  return { month, day };
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/* ─── Calendar Month Grid ─── */
function MonthGrid({
  year,
  month,
  events,
  selectedDate,
  onSelectDate,
}: {
  year: number;
  month: number;
  events: MajorEvent[];
  selectedDate: Date | null;
  onSelectDate: (d: Date) => void;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month, 1).toLocaleString("en-US", { month: "long" });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  function eventsOnDay(day: number): MajorEvent[] {
    const d = new Date(year, month, day);
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => iso >= e.startDate && iso <= e.endDate);
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day;
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  return (
    <div className="shrink-0 w-full px-1">
      <h3 className="text-center text-sm font-semibold text-parties-text mb-3">
        {monthName} {year}
      </h3>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-parties-muted py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {blanks.map((b) => (
          <div key={`b-${b}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const dayEvents = eventsOnDay(day);
          const hasEvents = dayEvents.length > 0;
          const selected = isSelected(day);
          const todayMark = isToday(day);
          // Take up to 3 unique category dots
          const dots = [...new Set(dayEvents.map((e) => e.category))].slice(0, 3);

          return (
            <button
              key={day}
              onClick={() => onSelectDate(new Date(year, month, day))}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                selected
                  ? "bg-parties-accent text-white shadow-lg shadow-parties-accent/30"
                  : hasEvents
                  ? "bg-parties-soft hover:bg-parties-accent/10"
                  : "hover:bg-parties-soft/50"
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  selected ? "text-white" : todayMark ? "text-parties-accent font-bold" : "text-parties-text"
                }`}
              >
                {day}
              </span>
              {hasEvents && (
                <div className="flex gap-[2px] mt-0.5">
                  {dots.map((cat, i) => (
                    <span
                      key={i}
                      className={`w-[4px] h-[4px] rounded-full ${
                        selected ? "bg-white/80" : CATEGORY_COLORS[cat]?.dot || "bg-parties-accent"
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Event Detail Card ─── */
function EventDetailCard({ event, onBook }: { event: MajorEvent; onBook: (e: MajorEvent) => void }) {
  const colors = CATEGORY_COLORS[event.category];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden"
    >
      {/* Top gradient bar */}
      <div className={`h-1 ${colors.dot}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-parties-text">{event.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={12} className="text-parties-secondary shrink-0" />
              <span className="text-xs text-parties-secondary">{event.city}</span>
            </div>
          </div>
          <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
            {event.category}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          <Calendar size={12} className="text-parties-muted" />
          <span className="text-xs font-medium text-parties-text">
            {formatDateRange(event.startDate, event.endDate)}
          </span>
        </div>

        <p className="text-xs text-parties-secondary mt-3 leading-relaxed">{event.description}</p>

        {/* Pricing impact */}
        <div className="mt-3 bg-amber-500/8 border border-amber-500/15 rounded-xl px-3 py-2.5">
          <div className="flex items-start gap-2">
            <Sparkles size={12} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-700 leading-relaxed">{event.pricingNote}</p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onBook(event)}
          className="mt-4 w-full bg-parties-accent text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          Book for This Event
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "calendar">("list");

  // Calendar state
  const now = useMemo(() => new Date(), []);
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "All">("All");

  useEffect(() => {
    fetchEvents()
      .then((d) => setEvents(Array.isArray(d) ? d : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = events.filter((e) => e.featured || e.hot);
  const upcoming = events.filter((e) => new Date(e.event_date) >= now);

  // Calendar data
  const monthEvents = useMemo(() => getEventsForMonth(calYear, calMonth), [calYear, calMonth]);
  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDate(selectedDate);
  }, [selectedDate]);

  // All major events filtered by category
  const filteredMajorEvents = useMemo(() => {
    const upcomingMajor = getUpcomingEvents(now);
    if (selectedCategory === "All") return upcomingMajor;
    return upcomingMajor.filter((e) => e.category === selectedCategory);
  }, [selectedCategory, now]);

  const categories = useMemo(() => {
    const cats = [...new Set(MAJOR_EVENTS.map((e) => e.category))];
    return ["All" as const, ...cats.sort()];
  }, []);

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  }

  function handleBook(event: MajorEvent) {
    const msg = encodeURIComponent(event.conciergeMessage);
    router.push(`/concierge?message=${msg}`);
  }

  function handleDateSelect(d: Date) {
    if (selectedDate && d.getTime() === selectedDate.getTime()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(d);
    }
  }

  return (
    <div className="min-h-dvh bg-white pt-14 px-5 pb-28">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-[28px] font-semibold text-parties-text">Events</h1>
        <div className="flex items-center gap-1 bg-parties-soft rounded-lg p-1">
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-md transition-all ${
              view === "list" ? "bg-white shadow-sm text-parties-accent" : "text-parties-muted"
            }`}
          >
            <LayoutList size={16} />
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`p-2 rounded-md transition-all ${
              view === "calendar" ? "bg-white shadow-sm text-parties-accent" : "text-parties-muted"
            }`}
          >
            <Calendar size={16} />
          </button>
        </div>
      </div>
      <p className="text-sm text-parties-secondary mb-6">Discover upcoming experiences</p>

      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* ─── Major Events Section ─── */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-parties-text mb-3">Major Events</h2>

              {/* Category filter pills */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-3 mb-4">
                {categories.map((cat) => {
                  const active = selectedCategory === cat;
                  const colors = cat !== "All" ? CATEGORY_COLORS[cat as EventCategory] : null;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full transition-all ${
                        active
                          ? "bg-parties-accent text-white"
                          : colors
                          ? `${colors.bg} ${colors.text}`
                          : "bg-parties-soft text-parties-secondary"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Major event cards */}
              <div className="space-y-4">
                {filteredMajorEvents.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                  >
                    <EventDetailCard event={ev} onBook={handleBook} />
                  </motion.div>
                ))}
                {filteredMajorEvents.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-sm text-parties-muted">No events in this category</p>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Database Events (existing) ─── */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[200px] bg-parties-soft rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {featured.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-parties-text mb-3">Featured</h2>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
                      {featured.map((ev) => {
                        const badge = dateBadge(ev.event_date);
                        return (
                          <motion.button
                            key={ev.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => router.push(`/events/${ev.id}`)}
                            className="shrink-0 w-[280px] rounded-2xl overflow-hidden relative text-left"
                          >
                            <div className="relative h-[180px] bg-parties-surface">
                              {ev.img_url && (
                                <img src={ev.img_url} alt={ev.name} className="w-full h-full object-cover" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                              <div className="absolute top-3 right-3 bg-white rounded-lg px-2.5 py-1.5 text-center">
                                <p className="text-[10px] font-bold text-parties-accent leading-none">{badge.month}</p>
                                <p className="text-lg font-bold text-parties-text leading-none">{badge.day}</p>
                              </div>
                              <div className="absolute bottom-3 left-3 right-3">
                                <h3 className="text-base font-semibold text-white truncate">{ev.name}</h3>
                                <p className="text-xs text-white/70 mt-0.5">{ev.venue_name}</p>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <h2 className="text-lg font-semibold text-parties-text mb-3">Upcoming</h2>
                {upcoming.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-parties-soft flex items-center justify-center mx-auto mb-4">
                      <Calendar size={28} className="text-parties-muted" />
                    </div>
                    <h3 className="text-lg font-semibold text-parties-text mb-1">No upcoming events</h3>
                    <p className="text-sm text-parties-secondary">Check back soon for new events.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcoming.map((ev) => {
                      const badge = dateBadge(ev.event_date);
                      return (
                        <motion.button
                          key={ev.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => router.push(`/events/${ev.id}`)}
                          className="w-full text-left rounded-2xl overflow-hidden border border-black/[0.06] flex"
                        >
                          <div className="relative w-[110px] shrink-0 bg-parties-soft">
                            {ev.img_url && (
                              <img src={ev.img_url} alt={ev.name} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute top-2 left-2 bg-white rounded-lg px-2 py-1 text-center shadow-sm">
                              <p className="text-[9px] font-bold text-parties-accent leading-none">{badge.month}</p>
                              <p className="text-base font-bold text-parties-text leading-none">{badge.day}</p>
                            </div>
                          </div>
                          <div className="flex-1 p-3.5 flex flex-col justify-between">
                            <div>
                              <h3 className="text-sm font-semibold text-parties-text line-clamp-1">{ev.name}</h3>
                              <div className="flex items-center gap-1 mt-1 text-xs text-parties-secondary">
                                <MapPin size={12} />
                                <span className="truncate">{ev.venue_name}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1 text-xs text-parties-muted">
                                  <Clock size={12} />
                                  {formatTime(ev.event_date)}
                                </span>
                                {ev.price && (
                                  <span className="text-xs font-semibold text-parties-text">${ev.price}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-end mt-2">
                              <span className="px-3 py-1.5 bg-parties-accent text-white text-xs font-semibold rounded-lg flex items-center gap-1">
                                <Ticket size={12} />
                                Get Tickets
                              </span>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          /* ─── Calendar View ─── */
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="w-9 h-9 rounded-full bg-parties-soft flex items-center justify-center active:scale-95 transition-transform">
                <ChevronLeft size={18} className="text-parties-text" />
              </button>
              <span className="text-sm font-semibold text-parties-text">
                {new Date(calYear, calMonth, 1).toLocaleString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button onClick={nextMonth} className="w-9 h-9 rounded-full bg-parties-soft flex items-center justify-center active:scale-95 transition-transform">
                <ChevronRight size={18} className="text-parties-text" />
              </button>
            </div>

            {/* Month grid */}
            <div className="bg-white border border-black/[0.06] rounded-2xl p-3 mb-5">
              <MonthGrid
                year={calYear}
                month={calMonth}
                events={monthEvents}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
              />
            </div>

            {/* Category legend */}
            <div className="flex flex-wrap gap-2 mb-5">
              {monthEvents.length > 0 &&
                [...new Set(monthEvents.map((e) => e.category))].map((cat) => {
                  const c = CATEGORY_COLORS[cat];
                  return (
                    <span key={cat} className={`flex items-center gap-1.5 text-[10px] font-medium ${c.text} ${c.bg} px-2.5 py-1 rounded-full`}>
                      <span className={`w-[5px] h-[5px] rounded-full ${c.dot}`} />
                      {cat}
                    </span>
                  );
                })}
            </div>

            {/* Selected date events */}
            <AnimatePresence mode="wait">
              {selectedDate && selectedEvents.length > 0 ? (
                <motion.div
                  key={selectedDate.toISOString()}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-sm font-semibold text-parties-text">
                    Events on {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                  </h2>
                  {selectedEvents.map((ev) => (
                    <EventDetailCard key={ev.id} event={ev} onBook={handleBook} />
                  ))}
                </motion.div>
              ) : selectedDate && selectedEvents.length === 0 ? (
                <motion.div
                  key="no-events"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-10"
                >
                  <div className="w-12 h-12 rounded-full bg-parties-soft flex items-center justify-center mx-auto mb-3">
                    <Calendar size={20} className="text-parties-muted" />
                  </div>
                  <p className="text-sm text-parties-muted">No major events on this date</p>
                </motion.div>
              ) : (
                <motion.div
                  key="month-events"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {monthEvents.length > 0 ? (
                    <>
                      <h2 className="text-sm font-semibold text-parties-text">
                        This Month ({monthEvents.length} event{monthEvents.length !== 1 ? "s" : ""})
                      </h2>
                      {monthEvents.map((ev) => (
                        <EventDetailCard key={ev.id} event={ev} onBook={handleBook} />
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 rounded-full bg-parties-soft flex items-center justify-center mx-auto mb-3">
                        <Calendar size={20} className="text-parties-muted" />
                      </div>
                      <p className="text-sm text-parties-muted">No major events this month</p>
                      <p className="text-xs text-parties-muted/60 mt-1">Try navigating to another month</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
