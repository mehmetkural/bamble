-- Helper function to insert a group pin with geography coordinates
CREATE OR REPLACE FUNCTION insert_group_with_location(
  p_user_id       UUID,
  p_category_id   UUID,
  p_name          TEXT,
  p_description   TEXT,
  p_location_name TEXT,
  p_longitude     FLOAT,
  p_latitude      FLOAT,
  p_is_public     BOOLEAN DEFAULT TRUE,
  p_max_members   INT DEFAULT NULL
)
RETURNS TABLE (id UUID, name TEXT) AS $$
DECLARE
  v_group_id UUID;
BEGIN
  INSERT INTO group_pins (created_by, category_id, name, description, location_name, location, is_public, max_members)
  VALUES (
    p_user_id,
    p_category_id,
    p_name,
    p_description,
    p_location_name,
    ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
    p_is_public,
    p_max_members
  )
  RETURNING group_pins.id INTO v_group_id;

  -- Add creator as admin member
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (v_group_id, p_user_id, 'admin');

  RETURN QUERY SELECT v_group_id, p_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
