import { createClient } from "@/lib/supabase/server";
import ConversationListPage from "@/components/chat/ConversationListPage";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <ConversationListPage userId={user!.id} />;
}
