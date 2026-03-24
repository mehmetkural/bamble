"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  type: "direct" | "group";
  created_at: string;
  other_participant: {
    anonymous_alias: string;
    is_anonymous: boolean;
    profiles?: { display_name: string | null; username: string };
  } | null;
  last_message: { content: string; created_at: string; type: string } | null;
  unread_count: number;
}

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-rose-100 text-rose-600",
  "bg-slate-200 text-slate-600",
  "bg-purple-100 text-purple-600",
];

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function ConversationListPage({ userId }: { userId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => {
        setConversations(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Loading chats...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-10 pt-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#2c3437] mb-1" style={{ fontFamily: "var(--font-headline)" }}>
            Conversations
          </h2>
          <p className="text-[#596064] text-sm">Connect with the shadows around you.</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
          <span className="material-symbols-outlined text-5xl opacity-30">forum</span>
          <p className="text-sm font-medium">No chats yet</p>
          <p className="text-xs text-slate-300 text-center">Browse the map and tap a pin to start chatting</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = conv.other_participant;
            const name = other?.is_anonymous === false && other?.profiles
              ? other.profiles.display_name || other.profiles.username
              : other?.anonymous_alias ?? "Unknown";
            const initials = name.slice(0, 2).toUpperCase();
            const avatarColor = getAvatarColor(name);
            const hasUnread = conv.unread_count > 0;

            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="flex items-center p-4 rounded-2xl bg-white hover:bg-slate-50 transition-all duration-200 group"
              >
                <div className="relative shrink-0">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${avatarColor}`} style={{ fontFamily: "var(--font-headline)" }}>
                    {conv.type === "group"
                      ? <span className="material-symbols-outlined text-xl">groups</span>
                      : initials
                    }
                  </div>
                </div>

                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-base font-bold truncate text-[#2c3437]" style={{ fontFamily: "var(--font-headline)" }}>
                      {name}
                    </span>
                    {conv.last_message && (
                      <span className={`text-[11px] font-bold shrink-0 ml-2 ${hasUnread ? "text-indigo-600" : "text-[#596064]"}`}>
                        {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: false })} ago
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${hasUnread ? "font-semibold text-[#2c3437]" : "text-[#596064]"}`}>
                    {conv.last_message?.type === "system"
                      ? <span className="italic">{conv.last_message.content}</span>
                      : conv.last_message?.content ?? "No messages yet"
                    }
                  </p>
                </div>

                {hasUnread && (
                  <div className="ml-3 shrink-0 min-w-[22px] h-[22px] px-1.5 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white">
                      {conv.unread_count > 99 ? "99+" : conv.unread_count}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-12 text-center pb-8">
        <div className="inline-flex items-center gap-2 text-slate-300">
          <span className="material-symbols-outlined text-sm">lock</span>
          <span className="text-xs font-medium">All chats are anonymous and private.</span>
        </div>
      </div>
    </div>
  );
}
