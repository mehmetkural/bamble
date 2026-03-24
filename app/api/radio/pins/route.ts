import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Bamberg bounding box — same as map maxBounds
const BAMBERG_BBOX = { min_lng: 10.80, min_lat: 49.82, max_lng: 11.05, max_lat: 50.02 };

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.rpc("get_pins_in_bbox", {
    min_lng: BAMBERG_BBOX.min_lng,
    min_lat: BAMBERG_BBOX.min_lat,
    max_lng: BAMBERG_BBOX.max_lng,
    max_lat: BAMBERG_BBOX.max_lat,
    p_category_slug: null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
