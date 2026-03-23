-- Allow adding other participants once you're already in the conversation
DROP POLICY "Authenticated users can join conversations" ON conversation_participants;

CREATE POLICY "Authenticated users can join conversations"
  ON conversation_participants FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM conversation_participants existing
      WHERE existing.conversation_id = conversation_participants.conversation_id
        AND existing.user_id = auth.uid()
    )
  );