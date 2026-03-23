import { createClient } from "@/lib/supabase/server";
import ChatPage from "@/components/chat/ChatPage";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <ChatPage conversationId={conversationId} userId={user!.id} />;
}
