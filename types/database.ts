// Placeholder types — replace by running: npx supabase gen types typescript > types/database.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Json = any

// Supabase Database type — populated after running migrations
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Database {}

// App-level types derived from the DB schema
export interface PinPublic {
  id: string
  user_id: string
  category_id: string
  category_slug: string
  category_label: string
  category_icon: string
  category_color: string
  title: string
  description: string | null
  longitude: number
  latitude: number
  location_name: string | null
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export interface GroupPinPublic {
  id: string
  name: string
  category_slug: string
  category_label: string
  category_icon: string
  category_color: string
  longitude: number
  latitude: number
  location_name: string | null
  description: string | null
  member_count: number
  created_at: string
}

export interface Category {
  id: string
  slug: string
  label: string
  icon: string
  color: string
}

export interface ConversationWithDetails {
  id: string
  pin_id: string | null
  group_id: string | null
  type: 'direct' | 'group'
  created_at: string
  other_participant: {
    user_id: string
    anonymous_alias: string
    is_anonymous: boolean
    profiles?: {
      username: string
      display_name: string | null
      avatar_url: string | null
    }
  }
  last_message: {
    content: string
    created_at: string
    type: string
  } | null
  unread_count: number
}

export interface MessageWithSender {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: 'text' | 'system' | 'connection_request'
  metadata: Json | null
  created_at: string
  is_deleted: boolean
  sender_alias: string
  sender_is_anonymous: boolean
  sender_profile?: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

export interface RadioMessage {
  id: string
  sender_id: string
  anon_alias: string
  content: string
  created_at: string
  is_mine: boolean
}

export type RadioFeedItem =
  | { kind: 'message'; data: RadioMessage }
  | { kind: 'pin'; data: PinPublic }
