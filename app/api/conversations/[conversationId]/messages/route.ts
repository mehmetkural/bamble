import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify participation
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (!participant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Fetch all participants (for alias/identity lookup)
  const { data: allParticipants } = await supabase
    .from("conversation_participants")
    .select("user_id, anonymous_alias, is_anonymous, profiles:user_id(username, display_name, avatar_url)")
    .eq("conversation_id", conversationId);

  const participantMap = new Map(allParticipants?.map((p) => [p.user_id, p]) ?? []);

  const { searchParams } = new URL(request.url);
  const before = searchParams.get("before");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  let query = supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (before) query = query.lt("created_at", before);

  const { data: messages } = await query;

  // Mask sender identities for anonymous participants
  const enriched = messages?.map((msg) => {
    const senderParticipant = participantMap.get(msg.sender_id);
    return {
      ...msg,
      sender_alias: senderParticipant?.anonymous_alias ?? "Unknown",
      sender_is_anonymous: senderParticipant?.is_anonymous ?? true,
      sender_is_me: msg.sender_id === user.id,
      sender_profile: senderParticipant?.is_anonymous ? null : (senderParticipant as any)?.profiles,
    };
  });

  // Update last_read_at
  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);

  return NextResponse.json(enriched ?? []);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify participation
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (!participant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { content, type = "text" } = await request.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
      type,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(message);
}
