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
    const { data, error } = await supabase.rpc("create_pin_conversation", {
      p_pin_id: pin_id,
      p_initiator_id: user.id,
      p_initiator_alias: generateAlias(),
      p_owner_alias: generateAlias(),
    });

    if (error) {
      if (error.message.includes("own pin")) {
        return NextResponse.json({ error: "This is your own pin" }, { status: 400 });
      }
      if (error.message.includes("Pin not found")) {
        return NextResponse.json({ error: "Pin not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
    }

    return NextResponse.json({ conversation_id: data });
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
