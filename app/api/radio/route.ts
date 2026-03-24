import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Deterministic anonymous alias from user ID (stable per user, never changes)
const ADJECTIVES = ["Silent", "Crimson", "Swift", "Bold", "Misty", "Golden", "Dark", "Bright", "Wild", "Frost", "Storm", "Night", "Iron", "Silver", "Shadow", "Thunder", "Gentle", "Brave", "Calm", "Lone"];
const NOUNS = ["Fox", "Owl", "Wolf", "Bear", "Hawk", "Eagle", "Deer", "Lynx", "Raven", "Tiger", "Falcon", "Panda", "Swan", "Crane", "Otter", "Badger", "Heron", "Robin", "Sparrow", "Moose"];

function generateAlias(userId: string): string {
  const hex = userId.replace(/-/g, "");
  let hash = 0;
  for (let i = 0; i < hex.length; i++) {
    hash = ((hash * 31) + parseInt(hex[i], 16)) >>> 0;
  }
  const adj = ADJECTIVES[hash % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(hash / ADJECTIVES.length) % NOUNS.length];
  return `${adj}${noun}`;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const before = searchParams.get("before");

  let query = supabase
    .from("radio_messages")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(100);

  if (before) query = query.lt("created_at", before);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const enriched = (data ?? []).map((msg) => ({
    ...msg,
    is_mine: msg.sender_id === user.id,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await request.json();
  const trimmed = content?.trim();
  if (!trimmed) return NextResponse.json({ error: "Content required" }, { status: 400 });
  if (trimmed.length > 500) return NextResponse.json({ error: "Message too long" }, { status: 400 });

  const anon_alias = generateAlias(user.id);

  const { data, error } = await supabase
    .from("radio_messages")
    .insert({ sender_id: user.id, anon_alias, content: trimmed })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ...data, is_mine: true });
}
