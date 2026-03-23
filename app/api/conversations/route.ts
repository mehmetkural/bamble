import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateAlias } from "@/lib/aliases";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get all conversations for this user with last message and other participant
  const { data: participants } = await supabase
    .from("conversation_participants")
    .select(`
      conversation_id,
      is_anonymous,
      anonymous_alias,
      last_read_at,
      conversations:conversation_id (
        id,
        type,
        pin_id,
        group_id,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  if (!participants) return NextResponse.json([]);

  const conversations = await Promise.all(
    participants.map(async (p) => {
      const convId = p.conversation_id;

      // Get the other participant
      const { data: others } = await supabase
        .from("conversation_participants")
        .select("user_id, anonymous_alias, is_anonymous, profiles:user_id(username, display_name, avatar_url)")
        .eq("conversation_id", convId)
        .neq("user_id", user.id)
        .limit(1)
        .single();

      // Get last message
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, created_at, type")
        .eq("conversation_id", convId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Unread count
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", convId)
        .gt("created_at", p.last_read_at ?? "1970-01-01");

      return {
        id: convId,
        ...(p.conversations as any),
        other_participant: others,
        last_message: lastMsg,
        unread_count: count ?? 0,
      };
    })
  );

  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { pin_id, group_id } = body;

  if (!pin_id && !group_id) {
    return NextResponse.json({ error: "pin_id or group_id required" }, { status: 400 });
  }

  if (pin_id) {
    // Get pin owner
    const { data: pin } = await supabase
      .from("pins")
      .select("user_id")
      .eq("id", pin_id)
      .single();

    if (!pin) return NextResponse.json({ error: "Pin not found" }, { status: 404 });

    // Don't chat with yourself
    if (pin.user_id === user.id) {
      return NextResponse.json({ error: "This is your own pin" }, { status: 400 });
    }

    // Check if conversation already exists between these two users for this pin
    const { data: existing } = await supabase
      .from("conversations")
      .select("id, conversation_participants!inner(user_id)")
      .eq("pin_id", pin_id)
      .eq("type", "direct");

    const existingConv = existing?.find((c) => {
      const participantIds = (c.conversation_participants as any[]).map((p: any) => p.user_id);
      return participantIds.includes(user.id) && participantIds.includes(pin.user_id);
    });

    if (existingConv) {
      return NextResponse.json({ conversation_id: existingConv.id });
    }

    // Create new conversation
    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .insert({ pin_id, type: "direct" })
      .select("id")
      .single();

    if (convError || !conv) return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });

    // Add both participants
    const { error: partError } = await supabase
      .from("conversation_participants")
      .insert([
        { conversation_id: conv.id, user_id: user.id, is_anonymous: true, anonymous_alias: generateAlias() },
        { conversation_id: conv.id, user_id: pin.user_id, is_anonymous: true, anonymous_alias: generateAlias() },
      ]);

    if (partError) return NextResponse.json({ error: "Failed to add participants" }, { status: 500 });

    // Send system message
    await supabase.from("messages").insert({
      conversation_id: conv.id,
      sender_id: user.id,
      content: "Started a conversation from a pin",
      type: "system",
    });

    return NextResponse.json({ conversation_id: conv.id });
  }

  // Group conversation
  const { data: conv, error } = await supabase
    .from("conversations")
    .insert({ group_id, type: "group" })
    .select("id")
    .single();

  if (error || !conv) return NextResponse.json({ error: "Failed to create group conversation" }, { status: 500 });

  return NextResponse.json({ conversation_id: conv.id });
}
