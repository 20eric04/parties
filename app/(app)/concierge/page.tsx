"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Plane, Car, UtensilsCrossed, Hotel, Ticket, Sparkles, Wine, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { fetchConciergeMessages, sendConciergeMessage } from "@/lib/supabase";

interface Message {
  id?: string;
  message: string;
  sender: "user" | "concierge";
  created_at: string;
  request_type?: string | null;
  status?: string;
}

const QUICK_ACTIONS = [
  { label: "Book a Table", icon: Wine, type: "table", template: "I'd like to book a VIP table at " },
  { label: "Restaurant", icon: UtensilsCrossed, type: "restaurant", template: "I'd like a reservation at " },
  { label: "Car Service", icon: Car, type: "car", template: "I need a car service — " },
  { label: "Private Jet", icon: Plane, type: "jet", template: "I'd like to arrange a private jet from " },
  { label: "Hotel", icon: Hotel, type: "hotel", template: "I need a hotel booking at " },
  { label: "Event Tickets", icon: Ticket, type: "event", template: "I'd like tickets to " },
  { label: "Custom Request", icon: Sparkles, type: "custom", template: "" },
];

const WELCOME_MESSAGE: Message = {
  message: "Welcome to PARTIES. I'm your personal concierge. How can I help you tonight?",
  sender: "concierge",
  created_at: new Date().toISOString(),
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function groupMessagesByDay(messages: Message[]) {
  const groups: { label: string; messages: Message[] }[] = [];
  let currentLabel = "";
  for (const msg of messages) {
    const label = formatDateLabel(msg.created_at);
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }
  return groups;
}

export default function ConciergePage() {
  const router = useRouter();
  const { session, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    if (!session) return;
    loadMessages();
  }, [session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  async function loadMessages() {
    setLoading(true);
    try {
      const token = session?.access_token;
      const data = await fetchConciergeMessages(token);
      if (Array.isArray(data) && data.length > 0) {
        setMessages(data);
      } else {
        setMessages([WELCOME_MESSAGE]);
      }
    } catch {
      setMessages([WELCOME_MESSAGE]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const token = session?.access_token;
    if (!token) return;

    const userMsg: Message = {
      message: text,
      sender: "user",
      created_at: new Date().toISOString(),
      request_type: activeType,
      status: "sent",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setActiveType(null);
    setSending(true);

    try {
      await sendConciergeMessage(token, text, activeType || undefined);
    } catch {
      // message still shows locally
    }

    setSending(false);

    // Simulate concierge auto-reply
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const autoReply: Message = {
        message: "Thank you for your request. A member of our concierge team will respond shortly. We typically reply within minutes.",
        sender: "concierge",
        created_at: new Date().toISOString(),
        status: "delivered",
      };
      setMessages((prev) => [...prev, autoReply]);
    }, 1500 + Math.random() * 1000);
  }

  function handleChipTap(action: typeof QUICK_ACTIONS[number]) {
    setActiveType(action.type);
    setInput(action.template);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const groups = groupMessagesByDay(messages);
  const hasMessages = messages.length > 1 || (messages.length === 1 && messages[0] !== WELCOME_MESSAGE);

  return (
    <div className="fixed inset-0 bg-parties-bg flex flex-col z-40">
      {/* Header */}
      <div className="shrink-0 pt-[env(safe-area-inset-top)] bg-parties-bg border-b border-white/[0.06]">
        <div className="flex items-center gap-3 px-5 py-3">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] active:bg-white/10 transition-colors">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-parties-accent to-orange-600 flex items-center justify-center shadow-lg shadow-parties-accent/20">
              <span className="font-display text-lg font-bold text-white leading-none">P</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-[15px] leading-tight">PARTIES Concierge</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-[11px] text-white/50">Available now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1 no-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-parties-accent/30 border-t-parties-accent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {groups.map((group, gi) => (
              <div key={gi}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <span className="text-[11px] text-white/30 bg-white/[0.04] px-3 py-1 rounded-full">{group.label}</span>
                </div>
                {group.messages.map((msg, mi) => (
                  <div
                    key={`${gi}-${mi}`}
                    className={`flex mb-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    style={{ animation: mi === group.messages.length - 1 && gi === groups.length - 1 ? (msg.sender === "user" ? "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" : "fadeIn 0.4s ease-out") : "none" }}
                  >
                    {msg.sender === "concierge" && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-parties-accent to-orange-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                        <span className="font-display text-xs font-bold text-white leading-none">P</span>
                      </div>
                    )}
                    <div className={`max-w-[78%] ${msg.sender === "user" ? "order-1" : ""}`}>
                      <div
                        className={`px-4 py-2.5 text-[14px] leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-white/[0.12] text-white rounded-2xl rounded-br-md"
                            : "bg-white/[0.04] border border-parties-accent/20 text-white/90 rounded-2xl rounded-bl-md"
                        }`}
                      >
                        {msg.message}
                      </div>
                      <p className={`text-[10px] text-white/25 mt-1 ${msg.sender === "user" ? "text-right mr-1" : "ml-1"}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start mb-2" style={{ animation: "fadeIn 0.3s ease-out" }}>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-parties-accent to-orange-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                  <span className="font-display text-xs font-bold text-white leading-none">P</span>
                </div>
                <div className="bg-white/[0.04] border border-parties-accent/20 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="shrink-0 px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.type}
              onClick={() => handleChipTap(action)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium transition-colors ${
                activeType === action.type
                  ? "bg-parties-accent text-white"
                  : "bg-white/[0.06] text-white/60 active:bg-white/10"
              }`}
            >
              <action.icon size={13} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="shrink-0 px-4 pb-[env(safe-area-inset-bottom)] bg-parties-bg border-t border-white/[0.06]">
        <div className="flex items-center gap-3 py-3">
          <div className="flex-1 bg-white/[0.06] rounded-2xl px-4 py-2.5 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your concierge anything..."
              className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/30 outline-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              input.trim()
                ? "bg-parties-accent active:scale-95 shadow-lg shadow-parties-accent/30"
                : "bg-white/[0.06]"
            }`}
          >
            <Send size={18} className={input.trim() ? "text-white" : "text-white/30"} />
          </button>
        </div>
      </div>
    </div>
  );
}
