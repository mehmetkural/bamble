import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  const { connectionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await request.json();
  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (action === "accept") {
    const { error } = await supabase.rpc("accept_connection" as any, {
      p_connection_id: connectionId,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Send system message
    const { data: connection } = await supabase
      .from("connections")
      .select("conversation_id, requester_id")
      .eq("id", connectionId)
      .single();

    if (connection) {
      await supabase.from("messages").insert({
        conversation_id: connection.conversation_id,
        sender_id: user.id,
        content: "Connection accepted! You can now see each other's identities.",
        type: "system",
      });
    }
  } else {
    const { error } = await supabase
      .from("connections")
      .update({ status: "declined", responded_at: new Date().toISOString() })
      .eq("id", connectionId)
      .eq("recipient_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
