"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

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
      <div className="flex items-center justify-center h-full text-gray-400">
        Loading chats...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
        <MessageCircle className="w-12 h-12 opacity-30" />
        <p className="text-sm">No chats yet</p>
        <p className="text-xs text-gray-300">Browse the map and tap a pin to start chatting</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
      </div>
      <div className="divide-y">
        {conversations.map((conv) => {
          const other = conv.other_participant;
          const name = other?.is_anonymous === false && other?.profiles
            ? other.profiles.display_name || other.profiles.username
            : other?.anonymous_alias ?? "Unknown";

          return (
            <Link
              key={conv.id}
              href={`/chat/${conv.id}`}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                {conv.type === "group"
                  ? <Users className="w-5 h-5 text-indigo-500" />
                  : <span className="text-sm font-medium text-indigo-600">{name.charAt(0)}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-gray-900 truncate">{name}</span>
                  {conv.last_message && (
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-gray-500 truncate">
                    {conv.last_message?.type === "system"
                      ? <span className="italic">{conv.last_message.content}</span>
                      : conv.last_message?.content ?? "No messages yet"
                    }
                  </p>
                  {conv.unread_count > 0 && (
                    <Badge className="bg-indigo-600 text-white text-xs h-5 min-w-5 flex items-center justify-center shrink-0">
                      {conv.unread_count}
                    </Badge>
                  )}
                </div>
                {other?.is_anonymous && (
                  <span className="text-xs text-gray-300">Anonymous</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
