import { createClient } from "@/lib/supabase/server";
import MapView from "@/components/map/MapView";

export default async function MapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="w-full h-full max-h-[480px]">
      <MapView userId={user!.id} />
    </div>
  );
}
