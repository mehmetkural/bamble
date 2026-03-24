-- Helper: check if a user is a participant (SECURITY DEFINER breaks RLS recursion)
CREATE OR REPLACE FUNCTION is_conversation_participant(p_conversation_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = p_conversation_id AND user_id = p_user_id
  );
$$;

GRANT EXECUTE ON FUNCTION is_conversation_participant(UUID, UUID) TO authenticated, anon;

-- Fix conversation_participants SELECT (was recursive)
DROP POLICY "Participants can view conversation participants" ON conversation_participants;
CREATE POLICY "Participants can view conversation participants"
  ON conversation_participants FOR SELECT USING (
    is_conversation_participant(conversation_id, auth.uid())
  );

-- Fix messages SELECT (was recursive via conversation_participants)
DROP POLICY "Participants can view messages" ON messages;
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT USING (
    is_conversation_participant(conversation_id, auth.uid())
  );

-- Fix messages INSERT (was recursive)
DROP POLICY "Participants can send messages" ON messages;
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    is_conversation_participant(conversation_id, auth.uid())
  );

-- Fix conversations SELECT (was recursive)
DROP POLICY "Participants can view their conversations" ON conversations;
CREATE POLICY "Participants can view their conversations"
  ON conversations FOR SELECT USING (
    is_conversation_participant(id, auth.uid())
  );
