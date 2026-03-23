import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const min_lng = parseFloat(searchParams.get("min_lng") ?? "-180");
  const min_lat = parseFloat(searchParams.get("min_lat") ?? "-90");
  const max_lng = parseFloat(searchParams.get("max_lng") ?? "180");
  const max_lat = parseFloat(searchParams.get("max_lat") ?? "90");
  const category = searchParams.get("category") || null;

  const supabase = await createClient();

  const [pinsRes, groupsRes] = await Promise.all([
    supabase.rpc("get_pins_in_bbox", {
      min_lng, min_lat, max_lng, max_lat,
      p_category_slug: category,
    }),
    supabase.rpc("get_group_pins_in_bbox", {
      min_lng, min_lat, max_lng, max_lat,
      p_category_slug: category,
    }),
  ]);

  return NextResponse.json({
    pins: pinsRes.data ?? [],
    groups: groupsRes.data ?? [],
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, description, location_name, category_slug, latitude, longitude } = body;

  if (!title || !category_slug || latitude == null || longitude == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", category_slug)
    .single();

  if (!category) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

  const { data, error } = await supabase.rpc("insert_pin_with_location" as any, {
    p_user_id: user.id,
    p_category_id: category.id,
    p_title: title,
    p_description: description || null,
    p_location_name: location_name || null,
    p_longitude: longitude,
    p_latitude: latitude,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
