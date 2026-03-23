-- Create conversation + add both participants atomically, bypassing RLS
CREATE OR REPLACE FUNCTION create_pin_conversation(
  p_pin_id UUID,
  p_initiator_id UUID,
  p_initiator_alias TEXT,
  p_owner_alias TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_conv_id UUID;
  v_existing_id UUID;
BEGIN
  -- Get pin owner
  SELECT user_id INTO v_owner_id FROM pins WHERE id = p_pin_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pin not found';
  END IF;

  -- Prevent chatting with yourself
  IF v_owner_id = p_initiator_id THEN
    RAISE EXCEPTION 'This is your own pin';
  END IF;

  -- Check if conversation already exists between these two users for this pin
  SELECT c.id INTO v_existing_id
  FROM conversations c
  JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = p_initiator_id
  JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = v_owner_id
  WHERE c.pin_id = p_pin_id AND c.type = 'direct'
  LIMIT 1;

  IF FOUND THEN
    RETURN v_existing_id;
  END IF;

  -- Create conversation
  v_conv_id := gen_random_uuid();
  INSERT INTO conversations (id, pin_id, type) VALUES (v_conv_id, p_pin_id, 'direct');

  -- Add both participants
  INSERT INTO conversation_participants (conversation_id, user_id, is_anonymous, anonymous_alias)
  VALUES
    (v_conv_id, p_initiator_id, TRUE, p_initiator_alias),
    (v_conv_id, v_owner_id, TRUE, p_owner_alias);

  -- System message
  INSERT INTO messages (conversation_id, sender_id, content, type)
  VALUES (v_conv_id, p_initiator_id, 'Started a conversation from a pin', 'system');

  RETURN v_conv_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_pin_conversation(UUID, UUID, TEXT, TEXT) TO authenticated;
