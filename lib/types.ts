export type Venue = {
  id: number
  metro: string
  name: string
  type: string
  city: string
  price_min: number
  rating: number | null
  about: string | null
  img_url: string | null
  lat: number | null
  lng: number | null
  hot: boolean
  tags: string[]
  active: boolean
  category: string
  address: string | null
  country: string
  currency: string
  amenities: string[]
  timezone: string
}

export type TableOption = {
  id: number
  venue_id: number
  name: string
  capacity_min: number
  capacity_max: number
  price_min: number
  description: string | null
  is_vip: boolean
  min_spend: number
  sort_order: number
  position_desc: string | null
}

export type Event = {
  id: string
  venue_id: number
  name: string
  description: string | null
  event_date: string
  doors_time: string
  dj: string | null
  theme: string | null
  img_url: string | null
  price_override: number | null
  featured: boolean
  venues?: { name: string; city: string }
}

export type UserProfile = {
  id: string
  name: string
  email: string | null
  city: string
  role: string
  avatar_url: string | null
  phone: string | null
  referral_code: string | null
}

export type AuthSession = {
  access_token: string
  refresh_token: string
  expires_in: number
  user: {
    id: string
    email: string
    phone: string
    user_metadata: Record<string, unknown>
  }
}
