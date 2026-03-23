import { createClient } from "@/lib/supabase/server";
import ProfileClientPage from "@/components/profile/ProfileClientPage";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: pins } = await supabase
    .from("pins")
    .select("*, categories:category_id(slug, label, icon, color)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return <ProfileClientPage profile={profile} pins={pins ?? []} userId={user!.id} />;
}
