-- Helper function to insert a pin with geography coordinates
CREATE OR REPLACE FUNCTION insert_pin_with_location(
  p_user_id       UUID,
  p_category_id   UUID,
  p_title         TEXT,
  p_description   TEXT,
  p_location_name TEXT,
  p_longitude     FLOAT,
  p_latitude      FLOAT
)
RETURNS TABLE (id UUID, title TEXT) AS $$
  INSERT INTO pins (user_id, category_id, title, description, location_name, location)
  VALUES (
    p_user_id,
    p_category_id,
    p_title,
    p_description,
    p_location_name,
    ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
  )
  RETURNING id, title;
$$ LANGUAGE sql SECURITY DEFINER;
