-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- CATEGORIES (read-only for everyone)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (TRUE);

-- PINS
CREATE POLICY "Active pins visible to everyone (anonymous)"
  ON pins FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Users can insert own pins"
  ON pins FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pins"
  ON pins FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pins"
  ON pins FOR DELETE USING (auth.uid() = user_id);

-- GROUP PINS
CREATE POLICY "Public group pins are viewable by everyone"
  ON group_pins FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Authenticated users can create groups"
  ON group_pins FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update group"
  ON group_pins FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_pins.id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- GROUP MEMBERS
CREATE POLICY "Group members are viewable by everyone"
  ON group_members FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can join public groups"
  ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE USING (auth.uid() = user_id);

-- CONVERSATIONS
CREATE POLICY "Participants can view their conversations"
  ON conversations FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- CONVERSATION PARTICIPANTS
CREATE POLICY "Participants can view conversation participants"
  ON conversation_participants FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = conversation_participants.conversation_id
        AND cp2.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can join conversations"
  ON conversation_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participant row"
  ON conversation_participants FOR UPDATE USING (auth.uid() = user_id);

-- MESSAGES
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can soft-delete own messages"
  ON messages FOR UPDATE USING (auth.uid() = sender_id);

-- CONNECTIONS
CREATE POLICY "Users can view own connections"
  ON connections FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = recipient_id
  );

CREATE POLICY "Authenticated users can send connection requests"
  ON connections FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Recipients can update connection status"
  ON connections FOR UPDATE USING (auth.uid() = recipient_id);

-- REPORTS
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
