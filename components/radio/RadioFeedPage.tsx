"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { RadioMessage, RadioFeedItem, PinPublic } from "@/types/database";
import RadioPinCard from "./RadioPinCard";

export default function RadioFeedPage({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<RadioMessage[]>([]);
  const [pins, setPins] = useState<PinPublic[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch("/api/radio");
    if (res.ok) setMessages(await res.json());
  }, []);

  const fetchPins = useCallback(async () => {
    const res = await fetch("/api/radio/pins");
    if (res.ok) setPins(await res.json());
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMessages(), fetchPins()]).finally(() => setLoading(false));
  }, [fetchMessages, fetchPins]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("radio:messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "radio_messages" }, () => {
        fetchMessages();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchMessages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/radio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim() }),
    });
    if (res.ok) {
      setInput("");
      await fetchMessages();
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Failed to send message");
    }
    setSending(false);
  }

  // Merge messages and pins into a single feed sorted by created_at
  const feed: RadioFeedItem[] = [
    ...messages.map((m): RadioFeedItem => ({ kind: "message", data: m })),
    ...pins.map((p): RadioFeedItem => ({ kind: "pin", data: p })),
  ].sort((a, b) => new Date(a.data.created_at).getTime() - new Date(b.data.created_at).getTime());

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50/20 via-[#f7f9fb] to-[#f7f9fb]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-100 shrink-0">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-indigo-600 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>radio</span>
        </div>
        <div className="flex-1">
          <p className="font-bold text-[#2c3437]" style={{ fontFamily: "var(--font-headline)" }}>Bamberg Radio</p>
          <p className="text-xs text-[#596064]">Public · Anonymous · Everyone in Bamberg</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-bold text-green-600">Live</span>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col justify-end min-h-full py-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#596064] text-sm">Loading...</div>
        ) : feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#596064]">
            <span className="material-symbols-outlined text-5xl text-slate-300">radio</span>
            <p className="text-sm font-medium">No activity yet — say something to Bamberg!</p>
          </div>
        ) : (
          feed.map((item) => {
            if (item.kind === "pin") {
              return <RadioPinCard key={`pin-${item.data.id}`} pin={item.data} />;
            }
            const msg = item.data as RadioMessage;
            return (
              <div
                key={`msg-${msg.id}`}
                className={`flex flex-col px-4 ${msg.is_mine ? "items-end" : "items-start"}`}
              >
                {!msg.is_mine && (
                  <span className="text-[10px] font-bold text-[#596064] mb-1 px-1 uppercase tracking-wide">
                    {msg.anon_alias}
                  </span>
                )}
                <div
                  className={`max-w-[78%] px-4 py-2.5 font-medium leading-relaxed shadow-sm text-sm ${
                    msg.is_mine
                      ? "bg-indigo-600 text-white rounded-t-xl rounded-bl-xl rounded-br-sm"
                      : "bg-[#e3e9ed] text-[#2c3437] rounded-t-xl rounded-br-xl rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-[#acb3b7] font-bold px-1 mt-0.5 uppercase">
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: false })} ago
                  {msg.is_mine && " · You"}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-white/80 backdrop-blur-xl border-t border-slate-100 px-5 py-4 shrink-0">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <div className="flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Say something to Bamberg... (anonymous)"
              className="w-full bg-transparent border-0 border-b-2 border-[#dce4e8] focus:border-indigo-500 focus:ring-0 py-2 text-base text-[#2c3437] placeholder:text-[#acb3b7] outline-none transition-colors"
              autoComplete="off"
              maxLength={500}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e as any); } }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-90 transition-all disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
