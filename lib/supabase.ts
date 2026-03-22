const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type FetchOptions = {
  method?: string
  body?: Record<string, unknown>
  token?: string
}

async function supabaseFetch(path: string, opts: FetchOptions = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  }
  if (opts.token) {
    headers['Authorization'] = `Bearer ${opts.token}`
  }
  if (opts.method === 'POST' && path.startsWith('/rest/v1/')) {
    headers['Prefer'] = 'return=representation'
  }
  if (opts.method === 'PATCH') {
    headers['Prefer'] = 'return=representation'
  }
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  if (opts.method === 'DELETE') {
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || 'Delete failed')
    }
    return null
  }
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error_description || data.msg || data.message || 'Request failed')
  }
  return data
}

// ─── AUTH ───
export const auth = {
  async signUp(email: string, password: string, metadata?: Record<string, unknown>) {
    return supabaseFetch('/auth/v1/signup', {
      method: 'POST',
      body: { email, password, data: metadata },
    })
  },

  async signIn(email: string, password: string) {
    return supabaseFetch('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: { email, password },
    })
  },

  async signInWithOTP(email: string) {
    return supabaseFetch('/auth/v1/otp', {
      method: 'POST',
      body: { email },
    })
  },

  async sendPhoneOTP(phone: string) {
    return supabaseFetch('/auth/v1/otp', {
      method: 'POST',
      body: { phone },
    })
  },

  async verifyPhoneOTP(phone: string, token: string) {
    return supabaseFetch('/auth/v1/verify', {
      method: 'POST',
      body: { phone, token, type: 'sms' },
    })
  },

  async verifyEmailOTP(email: string, token: string) {
    return supabaseFetch('/auth/v1/verify', {
      method: 'POST',
      body: { email, token, type: 'email' },
    })
  },

  async getUser(token: string) {
    return supabaseFetch('/auth/v1/user', { token })
  },

  async updateUser(token: string, data: Record<string, unknown>) {
    return supabaseFetch('/auth/v1/user', {
      method: 'PUT',
      token,
      body: { data },
    })
  },

  async signOut(token: string) {
    return supabaseFetch('/auth/v1/logout', {
      method: 'POST',
      token,
    })
  },

  async refreshToken(refreshToken: string) {
    return supabaseFetch('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: { refresh_token: refreshToken },
    })
  },
}

// ─── DATABASE (PostgREST) ───
export const db = {
  async query(table: string, params?: string, token?: string) {
    const path = `/rest/v1/${table}${params ? `?${params}` : ''}`
    return supabaseFetch(path, { token })
  },

  async insert(table: string, data: Record<string, unknown>, token?: string) {
    return supabaseFetch(`/rest/v1/${table}`, {
      method: 'POST',
      body: data,
      token,
    })
  },

  async update(table: string, id: string, data: Record<string, unknown>, token?: string) {
    return supabaseFetch(`/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      body: data,
      token,
    })
  },
}

// ─── CONVENIENCE: VENUES ───
export async function fetchVenues(metro?: string, category?: string) {
  let params = 'select=*&active=eq.true&order=hot.desc,rating.desc'
  if (metro) params += `&metro=eq.${encodeURIComponent(metro)}`
  if (category) params += `&category=eq.${encodeURIComponent(category)}`
  return db.query('venues', params)
}

export async function fetchVenue(id: number) {
  const venues = await db.query('venues', `select=*&id=eq.${id}`)
  return venues[0] || null
}

export async function fetchTableOptions(venueId: number) {
  return db.query('table_options', `select=*&venue_id=eq.${venueId}&active=eq.true&order=sort_order.asc`)
}

export async function searchVenues(query: string) {
  return db.query('venues', `select=*&active=eq.true&name=ilike.*${encodeURIComponent(query)}*&order=rating.desc&limit=20`)
}

// ─── CONVENIENCE: EVENTS ───
export async function fetchEvents(metro?: string) {
  let params = 'select=*,venues(name,city,metro,img_url)&active=eq.true&order=event_date.asc'
  if (metro) params += `&venues.metro=eq.${encodeURIComponent(metro)}`
  return db.query('events', params)
}

export async function fetchVenueEvents(venueId: number) {
  return db.query('events', `select=*&venue_id=eq.${venueId}&active=eq.true&order=event_date.asc`)
}

// ─── CONVENIENCE: FAVORITES ───
export async function fetchFavorites(token: string) {
  return db.query('favorites', 'select=*,venues(*)', token)
}

export async function addFavorite(userId: string, venueId: number, token: string) {
  return supabaseFetch('/rest/v1/favorites', {
    method: 'POST',
    body: { user_id: userId, venue_id: venueId } as any,
    token,
  })
}

export async function removeFavorite(userId: string, venueId: number, token: string) {
  return supabaseFetch(`/rest/v1/favorites?user_id=eq.${userId}&venue_id=eq.${venueId}`, {
    method: 'DELETE',
    token,
  })
}

export async function checkFavorite(userId: string, venueId: number, token: string) {
  const result = await db.query('favorites', `select=id&user_id=eq.${userId}&venue_id=eq.${venueId}`, token)
  return result.length > 0
}

// ─── CONVENIENCE: BOOKINGS ───
export async function fetchUserBookings(userId: string, token: string) {
  return db.query('bookings', `select=*,venues(name,city,img_url),table_options(name,is_vip)&user_id=eq.${userId}&order=created_at.desc`, token)
}

export async function createBooking(data: Record<string, unknown>, token: string) {
  return supabaseFetch('/rest/v1/bookings', {
    method: 'POST',
    body: data as any,
    token,
  })
}

// ─── CONVENIENCE: PROFILE ───
export async function fetchProfile(userId: string, token: string) {
  const profiles = await db.query('profiles', `select=*&id=eq.${userId}`, token)
  return profiles[0] || null
}

export async function updateProfile(userId: string, data: Record<string, unknown>, token: string) {
  return supabaseFetch(`/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    body: data as any,
    token,
  })
}

// ─── CONVENIENCE: RESTAURANTS ───
export async function fetchRestaurants(metro?: string) {
  let params = 'select=*,restaurants(cuisine_type,price_level,michelin_stars,dress_code)&active=eq.true&category=eq.restaurant&order=rating.desc'
  if (metro) params += `&metro=eq.${encodeURIComponent(metro)}`
  return db.query('venues', params)
}

// ─── CONVENIENCE: NOTIFICATIONS ───
export async function fetchNotifications(userId: string, token: string) {
  return db.query('notifications', `select=*&user_id=eq.${userId}&order=sent_at.desc&limit=30`, token)
}

export async function markNotificationRead(id: string, token: string) {
  return supabaseFetch(`/rest/v1/notifications?id=eq.${id}`, {
    method: 'PATCH',
    body: { read: true } as any,
    token,
  })
}
