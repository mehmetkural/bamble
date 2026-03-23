-- Get pins in bounding box
CREATE OR REPLACE FUNCTION get_pins_in_bbox(
  min_lng FLOAT,
  min_lat FLOAT,
  max_lng FLOAT,
  max_lat FLOAT,
  p_category_slug TEXT DEFAULT NULL
)
RETURNS TABLE (
  id             UUID,
  category_id    UUID,
  category_slug  TEXT,
  category_label TEXT,
  category_icon  TEXT,
  category_color TEXT,
  title          TEXT,
  description    TEXT,
  longitude      FLOAT,
  latitude       FLOAT,
  location_name  TEXT,
  is_active      BOOLEAN,
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ
) AS $$
  SELECT
    p.id,
    p.category_id,
    c.slug        AS category_slug,
    c.label       AS category_label,
    c.icon        AS category_icon,
    c.color       AS category_color,
    p.title,
    p.description,
    ST_X(p.location::geometry) AS longitude,
    ST_Y(p.location::geometry) AS latitude,
    p.location_name,
    p.is_active,
    p.expires_at,
    p.created_at
  FROM pins p
  JOIN categories c ON c.id = p.category_id
  WHERE p.is_active = TRUE
    AND (p.expires_at IS NULL OR p.expires_at > NOW())
    AND ST_Within(
      p.location::geometry,
      ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    )
    AND (p_category_slug IS NULL OR c.slug = p_category_slug)
$$ LANGUAGE sql SECURITY DEFINER;

-- Get group pins in bounding box
CREATE OR REPLACE FUNCTION get_group_pins_in_bbox(
  min_lng FLOAT,
  min_lat FLOAT,
  max_lng FLOAT,
  max_lat FLOAT,
  p_category_slug TEXT DEFAULT NULL
)
RETURNS TABLE (
  id             UUID,
  name           TEXT,
  category_slug  TEXT,
  category_label TEXT,
  category_icon  TEXT,
  category_color TEXT,
  longitude      FLOAT,
  latitude       FLOAT,
  location_name  TEXT,
  description    TEXT,
  member_count   BIGINT,
  created_at     TIMESTAMPTZ
) AS $$
  SELECT
    gp.id,
    gp.name,
    c.slug        AS category_slug,
    c.label       AS category_label,
    c.icon        AS category_icon,
    c.color       AS category_color,
    ST_X(gp.location::geometry) AS longitude,
    ST_Y(gp.location::geometry) AS latitude,
    gp.location_name,
    gp.description,
    COUNT(gm.id)  AS member_count,
    gp.created_at
  FROM group_pins gp
  JOIN categories c ON c.id = gp.category_id
  LEFT JOIN group_members gm ON gm.group_id = gp.id
  WHERE gp.is_public = TRUE
    AND ST_Within(
      gp.location::geometry,
      ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    )
    AND (p_category_slug IS NULL OR c.slug = p_category_slug)
  GROUP BY gp.id, c.slug, c.label, c.icon, c.color
$$ LANGUAGE sql SECURITY DEFINER;

-- Accept connection: reveal identities mutually
CREATE OR REPLACE FUNCTION accept_connection(p_connection_id UUID)
RETURNS void AS $$
DECLARE
  v_conversation_id UUID;
  v_requester_id    UUID;
  v_recipient_id    UUID;
BEGIN
  -- Validate caller is the recipient
  SELECT conversation_id, requester_id, recipient_id
  INTO v_conversation_id, v_requester_id, v_recipient_id
  FROM connections
  WHERE id = p_connection_id AND recipient_id = auth.uid() AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Connection not found or unauthorized';
  END IF;

  -- Update connection status
  UPDATE connections
  SET status = 'accepted', responded_at = NOW()
  WHERE id = p_connection_id;

  -- Reveal identities for both participants
  UPDATE conversation_participants
  SET is_anonymous = FALSE
  WHERE conversation_id = v_conversation_id
    AND user_id IN (v_requester_id, v_recipient_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
