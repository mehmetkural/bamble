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

const ICON_COLORS = [
  "bg-[#959efd]/20 text-[#4c56af]",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-700",
  "bg-purple-100 text-purple-600",
];

const ICONS = ["storm", "psychology", "self_improvement", "bolt", "sunny", "rocket_launch"];

function getAvatarStyle(name: string) {
  const idx = name.charCodeAt(0) % ICON_COLORS.length;
  return { color: ICON_COLORS[idx], icon: ICONS[idx] };
}

export default function ConversationListPage({ userId }: { userId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => {
        setConversations(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const filtered = conversations.filter((conv) => {
    const other = conv.other_participant;
    const name = other?.is_anonymous === false && other?.profiles
      ? other.profiles.display_name || other.profiles.username
      : other?.anonymous_alias ?? "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="h-full flex flex-col bg-[#f8fafb] dark:bg-[#0f1415]">
      {/* Header */}
      <div className="px-6 md:px-8 pt-8 pb-4 bg-white dark:bg-[#0f1415] border-b border-[#e1e3e4]/60 dark:border-[#2e3839]/60">
        <h2 className="font-headline text-2xl font-bold text-[#191c1d] dark:text-[#e1e3e4] mb-5">Messages</h2>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-3 text-[#6f7979] text-xl">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 bg-[#eceeef] dark:bg-[#1a1f20] border-none rounded-full px-12 text-sm focus:ring-2 focus:ring-[#00464d]/20 placeholder:text-[#6f7979]/60 outline-none text-[#191c1d] dark:text-[#e1e3e4]"
            placeholder="Search conversations…"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[#6f7979] text-sm">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-[#6f7979]">
            <span className="material-symbols-outlined text-5xl opacity-25">forum</span>
            <p className="text-sm font-semibold">No conversations yet</p>
            <p className="text-xs opacity-60 text-center">Browse the map and tap a pin to start chatting</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const other = conv.other_participant;
            const name = other?.is_anonymous === false && other?.profiles
              ? other.profiles.display_name || other.profiles.username
              : other?.anonymous_alias ?? "Unknown Voyager";
            const hasUnread = conv.unread_count > 0;
            const { color, icon } = getAvatarStyle(name);

            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${hasUnread ? "bg-white dark:bg-[#1a1f20] shadow-[0_4px_24px_0_rgba(0,0,0,0.04)] ring-1 ring-[#00464d]/10" : "hover:bg-white dark:hover:bg-[#1a1f20]"}`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color}`}>
                    {conv.type === "group"
                      ? <span className="material-symbols-outlined text-2xl">diversity_3</span>
                      : <span className="material-symbols-outlined text-2xl">{icon}</span>
                    }
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`font-headline font-semibold truncate text-[#191c1d] dark:text-[#e1e3e4] ${hasUnread ? "font-bold" : ""}`}>
                      {name}
                    </h3>
                    {conv.last_message && (
                      <span className={`text-[10px] shrink-0 ml-2 ${hasUnread ? "text-[#00464d] font-bold" : "text-[#6f7979]"}`}>
                        {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: false })} ago
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${hasUnread ? "font-semibold text-[#191c1d] dark:text-[#e1e3e4]" : "text-[#3f4949] dark:text-[#8fa3a8]"}`}>
                    {conv.last_message?.type === "system"
                      ? <span className="italic text-[#6f7979]">{conv.last_message.content}</span>
                      : conv.last_message?.content ?? "No messages yet"
                    }
                  </p>
                </div>

                {/* Unread badge */}
                {hasUnread && (
                  <div className="shrink-0 min-w-[22px] h-[22px] px-1.5 bg-[#00464d] rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">
                      {conv.unread_count > 99 ? "99+" : conv.unread_count}
                    </span>
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="py-5 text-center">
        <span className="inline-flex items-center gap-2 text-[#6f7979] text-xs font-medium">
          <span className="material-symbols-outlined text-sm">lock</span>
          All conversations are private and anonymous
        </span>
      </div>
    </div>
  );
}
