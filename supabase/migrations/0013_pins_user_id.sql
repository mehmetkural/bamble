-- Add user_id to get_pins_in_bbox return so clients can check ownership
DROP FUNCTION IF EXISTS get_pins_in_bbox(double precision, double precision, double precision, double precision, text);
CREATE OR REPLACE FUNCTION get_pins_in_bbox(
  min_lng FLOAT,
  min_lat FLOAT,
  max_lng FLOAT,
  max_lat FLOAT,
  p_category_slug TEXT DEFAULT NULL
)
RETURNS TABLE (
  id             UUID,
  user_id        UUID,
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
    p.user_id,
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
