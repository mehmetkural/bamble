"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import ConnectionRequestCard from "./ConnectionRequestCard";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: "text" | "system" | "connection_request";
  metadata: any;
  created_at: string;
  sender_alias: string;
  sender_is_anonymous: boolean;
  sender_is_me: boolean;
  sender_profile?: { username: string; display_name: string | null; avatar_url: string | null } | null;
}

interface Participant {
  user_id: string;
  anonymous_alias: string;
  is_anonymous: boolean;
  profiles?: { username: string; display_name: string | null; avatar_url: string | null };
}

export default function ChatPage({ conversationId, userId }: { conversationId: string; userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connection, setConnection] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
  }, [conversationId]);

  const fetchParticipants = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("conversation_participants")
      .select("user_id, anonymous_alias, is_anonymous, profiles:user_id(username, display_name, avatar_url)")
      .eq("conversation_id", conversationId);
    if (data) setParticipants(data as any);
  }, [conversationId]);

  const fetchConnection = useCallback(async () => {
    const res = await fetch("/api/connections");
    if (res.ok) {
      const conns = await res.json();
      const otherParticipant = participants.find((p) => p.user_id !== userId);
      if (otherParticipant) {
        const conn = conns.find((c: any) =>
          c.conversation_id === conversationId && (
            (c.requester_id === userId && c.recipient_id === otherParticipant.user_id) ||
            (c.requester_id === otherParticipant.user_id && c.recipient_id === userId)
          )
        );
        setConnection(conn);
      }
    }
  }, [participants, userId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMessages(), fetchParticipants()]).finally(() => setLoading(false));
  }, [fetchMessages, fetchParticipants]);

  useEffect(() => {
    if (participants.length > 0) fetchConnection();
  }, [participants, fetchConnection]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, () => {
        fetchMessages();
      })
      .subscribe();

    // Listen for connection status changes
    const connChannel = supabase
      .channel(`connections:${userId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "connections",
        filter: `recipient_id=eq.${userId}`,
      }, (payload) => {
        if (payload.new.status === "accepted") {
          toast.success("Identity revealed! You are now connected.");
          fetchParticipants();
          fetchConnection();
          fetchMessages();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(connChannel);
    };
  }, [conversationId, userId, fetchMessages, fetchParticipants, fetchConnection]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim() }),
    });
    if (res.ok) {
      setInput("");
      await fetchMessages();
    } else {
      toast.error("Failed to send message");
    }
    setSending(false);
  }

  const otherParticipant = participants.find((p) => p.user_id !== userId);
  const myParticipant = participants.find((p) => p.user_id === userId);
  const otherName = otherParticipant?.is_anonymous === false && (otherParticipant as any)?.profiles
    ? (otherParticipant as any).profiles.display_name || (otherParticipant as any).profiles.username
    : otherParticipant?.anonymous_alias ?? "Unknown";

  const textMessages = messages.filter((m) => m.type === "text");
  const showConnectionPrompt = textMessages.length >= 3 && !connection && otherParticipant;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50/20 via-[#f7f9fb] to-[#f7f9fb]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-100 shrink-0">
        <button onClick={() => router.push("/chat")} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <span className="material-symbols-outlined text-[#596064]">arrow_back</span>
        </button>
        <div className="w-10 h-10 rounded-full bg-[#fdd2fd] flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-[#654568]" style={{ fontFamily: "var(--font-headline)" }}>
            {otherName.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#2c3437] truncate" style={{ fontFamily: "var(--font-headline)" }}>
            {otherName} {otherParticipant?.is_anonymous ? "(Anonymous)" : ""}
          </p>
          {!otherParticipant?.is_anonymous ? (
            <p className="text-xs text-green-500 font-medium">Connected</p>
          ) : connection?.status === "pending" ? (
            <p className="text-xs text-amber-500 font-medium mt-0.5">Reveal request pending…</p>
          ) : (
            <p className="text-xs text-[#596064]">Privacy Mode Active</p>
          )}
        </div>
        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <span className="material-symbols-outlined text-slate-400 text-xl">report</span>
        </button>
      </div>

      {/* Identity reveal banner */}
      {otherParticipant?.is_anonymous && connection?.status !== "pending" && connection?.status !== "accepted" && (
        <button
          onClick={async () => {
            const res = await fetch("/api/connections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipient_id: otherParticipant.user_id, conversation_id: conversationId }) });
            if (res.ok) { toast.success("Connection request sent!"); fetchConnection(); fetchMessages(); }
            else { const err = await res.json(); toast.error(err.error || "Failed"); }
          }}
          className="shrink-0 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 border-b border-indigo-100 hover:bg-indigo-100 active:bg-indigo-200 transition-colors"
        >
          <span className="material-symbols-outlined text-indigo-500 text-base">visibility</span>
          <span className="text-sm font-semibold text-indigo-600">Reveal identity</span>
        </button>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[#596064] text-sm">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#596064] text-sm">
            Say hello! Remember, both of you are anonymous.
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.type === "system") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <span className="px-4 py-1 rounded-full bg-[#e3e9ed] text-[#596064] text-[10px] font-bold uppercase tracking-widest">
                    {msg.content}
                  </span>
                </div>
              );
            }
            if (msg.type === "connection_request") {
              const connId = msg.metadata?.connection_id;
              const isIncoming = msg.metadata?.recipient_id === userId;
              return (
                <ConnectionRequestCard key={msg.id} connectionId={connId} isIncoming={isIncoming} status={connection?.status}
                  onAction={async (action) => {
                    const res = await fetch(`/api/connections/${connId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
                    if (res.ok) { if (action === "accept") { toast.success("Connected! Identities revealed."); fetchParticipants(); fetchConnection(); fetchMessages(); } else { toast.info("Request declined"); fetchConnection(); } }
                  }} />
              );
            }
            return (
              <div key={msg.id} className={`flex flex-col ${msg.sender_is_me ? "items-end" : "items-start"} max-w-[80%] ${msg.sender_is_me ? "ml-auto" : ""} gap-1`}>
                <div className={`px-5 py-3 font-medium leading-relaxed shadow-sm ${
                  msg.sender_is_me
                    ? "bg-indigo-600 text-white rounded-t-xl rounded-bl-xl rounded-br-sm"
                    : "bg-[#e3e9ed] text-[#2c3437] rounded-t-xl rounded-br-xl rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-[#596064] font-bold px-1 uppercase">
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: false })} ago
                </span>
              </div>
            );
          })
        )}

        {showConnectionPrompt && !connection && (
          <div className="flex justify-center py-2">
            <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-6 text-center max-w-xs">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-indigo-600 text-2xl">visibility</span>
              </div>
              <p className="font-bold text-[#2c3437] text-sm mb-1" style={{ fontFamily: "var(--font-headline)" }}>Curious who you're talking to?</p>
              <p className="text-xs text-[#596064] mb-4">Both must agree to reveal identities.</p>
              <button onClick={async () => {
                if (!otherParticipant) return;
                const res = await fetch("/api/connections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipient_id: otherParticipant.user_id, conversation_id: conversationId }) });
                if (res.ok) { toast.success("Connection request sent!"); fetchConnection(); fetchMessages(); } else { const err = await res.json(); toast.error(err.error || "Failed"); }
              }} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
                Request Identity Reveal
              </button>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-white/80 backdrop-blur-xl border-t border-slate-100 px-5 py-4 shrink-0">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-transparent border-0 border-b-2 border-[#dce4e8] focus:border-indigo-500 focus:ring-0 py-2 text-base text-[#2c3437] placeholder:text-[#acb3b7] outline-none transition-colors"
              autoComplete="off"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e as any); } }}
            />
          </div>
          <button type="submit" disabled={!input.trim() || sending}
            className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-90 transition-all disabled:opacity-40">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
