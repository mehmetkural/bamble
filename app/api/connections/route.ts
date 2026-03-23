import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("connections")
    .select("*")
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipient_id, conversation_id } = await request.json();

  if (!recipient_id || !conversation_id) {
    return NextResponse.json({ error: "recipient_id and conversation_id required" }, { status: 400 });
  }

  // Check if already requested
  const { data: existing } = await supabase
    .from("connections")
    .select("id, status")
    .or(`and(requester_id.eq.${user.id},recipient_id.eq.${recipient_id}),and(requester_id.eq.${recipient_id},recipient_id.eq.${user.id})`)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Connection already exists", existing }, { status: 409 });
  }

  // Create the connection request
  const { data: connection, error } = await supabase
    .from("connections")
    .insert({ requester_id: user.id, recipient_id, conversation_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send system message in the conversation
  await supabase.from("messages").insert({
    conversation_id,
    sender_id: user.id,
    content: "Sent a connection request to reveal identities",
    type: "connection_request",
    metadata: { connection_id: connection.id, recipient_id },
  });

  return NextResponse.json(connection);
}
