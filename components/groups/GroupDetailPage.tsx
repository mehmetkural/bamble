"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Users, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  type: string;
  created_at: string;
  sender_alias: string;
  sender_is_me: boolean;
  sender_is_anonymous: boolean;
  sender_profile?: { display_name: string | null; username: string } | null;
}

export default function GroupDetailPage({ groupId, userId }: { groupId: string; userId: string }) {
  const [group, setGroup] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isMember, setIsMember] = useState(false);
  const router = useRouter();

  const fetchGroup = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("group_pins")
      .select(`*, categories:category_id(slug, label, icon, color), group_members(user_id, role, profiles:user_id(username, display_name, avatar_url))`)
      .eq("id", groupId)
      .single();
    if (data) {
      setGroup(data);
      setMembers(data.group_members || []);
      setIsMember(data.group_members?.some((m: any) => m.user_id === userId));
    }
  }, [groupId, userId]);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    if (res.ok) setMessages(await res.json());
  }, [conversationId]);

  useEffect(() => { fetchGroup(); }, [fetchGroup]);

  useEffect(() => {
    if (!isMember) return;
    // Create or get group conversation
    fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group_id: groupId }),
    }).then((r) => r.json()).then((d) => {
      if (d.conversation_id) setConversationId(d.conversation_id);
    });
  }, [isMember, groupId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => {
    if (!conversationId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`group-conv:${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, fetchMessages)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, fetchMessages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim() }),
    });
    if (res.ok) { setInput(""); fetchMessages(); }
    else toast.error("Failed to send");
  }

  async function joinGroup() {
    const res = await fetch(`/api/groups/${groupId}/members`, { method: "POST" });
    if (res.ok) { toast.success("Joined!"); fetchGroup(); }
    else toast.error("Failed to join");
  }

  if (!group) return <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>;

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto border-x border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.push("/groups")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
          style={{ backgroundColor: group.categories?.color + "20" }}
        >
          {group.categories?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{group.name}</p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="w-3 h-3" />
            <span>{members.length} member{members.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        {!isMember && (
          <Button size="sm" onClick={joinGroup} className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
            Join
          </Button>
        )}
      </div>

      {/* Chat or join prompt */}
      {!isMember ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-gray-400">
          <Users className="w-12 h-12 opacity-30" />
          <p className="text-sm">Join this group to see the chat</p>
          <Button onClick={joinGroup} className="bg-indigo-600 hover:bg-indigo-700">Join Group</Button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No messages yet — say hello to the group!
              </div>
            ) : (
              messages.map((msg) => {
                if (msg.type === "system") {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{msg.content}</span>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className={`flex ${msg.sender_is_me ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] flex flex-col gap-0.5 ${msg.sender_is_me ? "items-end" : "items-start"}`}>
                      {!msg.sender_is_me && (
                        <span className="text-xs text-gray-400 px-1">
                          {msg.sender_is_anonymous ? msg.sender_alias : msg.sender_profile?.display_name || msg.sender_profile?.username}
                        </span>
                      )}
                      <div className={`px-4 py-2 rounded-2xl text-sm ${msg.sender_is_me ? "bg-indigo-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>
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
          </div>
          <form onSubmit={sendMessage} className="flex items-center gap-2 p-4 border-t bg-white shrink-0">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message the group..." className="flex-1" />
            <Button type="submit" disabled={!input.trim()} size="icon" className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
