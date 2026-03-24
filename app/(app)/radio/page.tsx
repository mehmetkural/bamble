import { createClient } from "@/lib/supabase/server";
import RadioFeedPage from "@/components/radio/RadioFeedPage";

export default async function RadioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <RadioFeedPage userId={user!.id} />;
}
