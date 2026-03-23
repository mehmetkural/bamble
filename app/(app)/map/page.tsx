import { createClient } from "@/lib/supabase/server";
import MapView from "@/components/map/MapView";

export default async function MapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <MapView userId={user!.id} />;
}
