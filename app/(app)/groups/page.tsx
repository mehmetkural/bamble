import { createClient } from "@/lib/supabase/server";
import GroupsClientPage from "@/components/groups/GroupsClientPage";

export default async function GroupsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <GroupsClientPage userId={user!.id} />;
}
