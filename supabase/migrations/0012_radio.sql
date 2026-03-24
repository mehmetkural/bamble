-- Bamberg Radio: public anonymous chatroom
CREATE TABLE radio_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anon_alias TEXT NOT NULL,
  content    TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX radio_messages_created_idx ON radio_messages (created_at DESC);

ALTER TABLE radio_messages ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read all radio messages
CREATE POLICY "radio_messages_select"
  ON radio_messages FOR SELECT
  TO authenticated
  USING (true);

-- Any authenticated user can post (must be their own sender_id)
CREATE POLICY "radio_messages_insert"
  ON radio_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE radio_messages;
