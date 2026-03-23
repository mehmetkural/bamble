import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const supabase = await createClient();

  let query = supabase
    .from("group_pins")
    .select(`
      *,
      categories:category_id(slug, label, icon, color),
      group_members(count)
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("categories.slug", category);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, category_slug, latitude, longitude, location_name, description, is_public, max_members } = body;

  if (!name || !category_slug || latitude == null || longitude == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", category_slug)
    .single();

  if (!category) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

  const { data: group, error } = await supabase.rpc("insert_group_with_location" as any, {
    p_user_id: user.id,
    p_category_id: category.id,
    p_name: name,
    p_description: description || null,
    p_location_name: location_name || null,
    p_longitude: longitude,
    p_latitude: latitude,
    p_is_public: is_public ?? true,
    p_max_members: max_members || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(group);
}
