"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, UserCheck, EyeOff } from "lucide-react";
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
          (c.requester_id === userId && c.recipient_id === otherParticipant.user_id) ||
          (c.requester_id === otherParticipant.user_id && c.recipient_id === userId)
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
    <div className="flex flex-col h-full max-w-2xl mx-auto border-x border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.push("/chat")} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{otherName}</p>
          {otherParticipant?.is_anonymous && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <EyeOff className="w-3 h-3" />
              <span>Anonymous</span>
            </div>
          )}
          {!otherParticipant?.is_anonymous && (
            <div className="flex items-center gap-1 text-xs text-green-500">
              <UserCheck className="w-3 h-3" />
              <span>Connected</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Say hello! Remember, both of you are anonymous.
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.type === "system") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {msg.content}
                  </span>
                </div>
              );
            }

            if (msg.type === "connection_request") {
              const connId = msg.metadata?.connection_id;
              const isIncoming = msg.metadata?.recipient_id === userId;
              return (
                <ConnectionRequestCard
                  key={msg.id}
                  connectionId={connId}
                  isIncoming={isIncoming}
                  status={connection?.status}
                  onAction={async (action) => {
                    const res = await fetch(`/api/connections/${connId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action }),
                    });
                    if (res.ok) {
                      if (action === "accept") {
                        toast.success("Connected! Identities revealed.");
                        fetchParticipants();
                        fetchConnection();
                        fetchMessages();
                      } else {
                        toast.info("Request declined");
                        fetchConnection();
                      }
                    }
                  }}
                />
              );
            }

            return (
              <div key={msg.id} className={`flex ${msg.sender_is_me ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] ${msg.sender_is_me ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  {!msg.sender_is_me && (
                    <span className="text-xs text-gray-400 px-1">
                      {msg.sender_is_anonymous ? msg.sender_alias : msg.sender_profile?.display_name || msg.sender_profile?.username}
                    </span>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm ${
                      msg.sender_is_me
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-900 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-xs text-gray-300 px-1">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Connection prompt */}
        {showConnectionPrompt && !connection && (
          <div className="flex justify-center py-2">
            <button
              onClick={async () => {
                if (!otherParticipant) return;
                const res = await fetch("/api/connections", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    recipient_id: otherParticipant.user_id,
                    conversation_id: conversationId,
                  }),
                });
                if (res.ok) {
                  toast.success("Connection request sent!");
                  fetchConnection();
                  fetchMessages();
                } else {
                  const err = await res.json();
                  toast.error(err.error || "Failed to send request");
                }
              }}
              className="text-xs text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors"
            >
              <UserCheck className="w-3 h-3 inline mr-1" />
              Reveal your identity to connect
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex items-center gap-2 p-4 border-t bg-white shrink-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          autoComplete="off"
        />
        <Button type="submit" disabled={!input.trim() || sending} size="icon" className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
