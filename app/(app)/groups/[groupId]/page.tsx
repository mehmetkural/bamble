import { createClient } from "@/lib/supabase/server";
import GroupDetailPage from "@/components/groups/GroupDetailPage";

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <GroupDetailPage groupId={groupId} userId={user!.id} />;
}
