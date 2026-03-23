-- Profiles: extends auth.users
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Categories: seed data
CREATE TABLE categories (
  id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug   TEXT UNIQUE NOT NULL,
  label  TEXT NOT NULL,
  icon   TEXT NOT NULL,
  color  TEXT NOT NULL
);

-- Pins: core geo entities
CREATE TABLE pins (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id    UUID NOT NULL REFERENCES categories(id),
  title          TEXT NOT NULL,
  description    TEXT,
  location       GEOGRAPHY(Point, 4326) NOT NULL,
  location_name  TEXT,
  is_active      BOOLEAN DEFAULT TRUE,
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX pins_location_idx  ON pins USING GIST (location);
CREATE INDEX pins_category_idx  ON pins (category_id);
CREATE INDEX pins_user_idx      ON pins (user_id);
CREATE INDEX pins_active_idx    ON pins (is_active) WHERE is_active = TRUE;

-- Group pins: visible clusters on map
CREATE TABLE group_pins (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  category_id    UUID NOT NULL REFERENCES categories(id),
  created_by     UUID NOT NULL REFERENCES profiles(id),
  location       GEOGRAPHY(Point, 4326) NOT NULL,
  location_name  TEXT,
  description    TEXT,
  is_public      BOOLEAN DEFAULT TRUE,
  max_members    INT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX group_pins_location_idx ON group_pins USING GIST (location);

-- Group members
CREATE TABLE group_members (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id  UUID NOT NULL REFERENCES group_pins(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role      TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);

-- Conversations
CREATE TABLE conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pin_id     UUID REFERENCES pins(id) ON DELETE SET NULL,
  group_id   UUID REFERENCES group_pins(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('direct', 'group')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE conversation_participants (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_anonymous     BOOLEAN DEFAULT TRUE,
  anonymous_alias  TEXT NOT NULL,
  joined_at        TIMESTAMPTZ DEFAULT NOW(),
  last_read_at     TIMESTAMPTZ,
  UNIQUE (conversation_id, user_id)
);

-- Messages
CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES profiles(id),
  content          TEXT NOT NULL,
  type             TEXT DEFAULT 'text' CHECK (type IN ('text', 'system', 'connection_request')),
  metadata         JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  edited_at        TIMESTAMPTZ,
  is_deleted       BOOLEAN DEFAULT FALSE
);

CREATE INDEX messages_conversation_idx ON messages (conversation_id, created_at DESC);

-- Connections: mutual identity reveal
CREATE TABLE connections (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id     UUID NOT NULL REFERENCES profiles(id),
  recipient_id     UUID NOT NULL REFERENCES profiles(id),
  conversation_id  UUID NOT NULL REFERENCES conversations(id),
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  requested_at     TIMESTAMPTZ DEFAULT NOW(),
  responded_at     TIMESTAMPTZ,
  UNIQUE (requester_id, recipient_id),
  CHECK (requester_id != recipient_id)
);

-- Reports
CREATE TABLE reports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id  UUID NOT NULL REFERENCES profiles(id),
  target_type  TEXT NOT NULL CHECK (target_type IN ('pin', 'message', 'user')),
  target_id    UUID NOT NULL,
  reason       TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
