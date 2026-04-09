const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ribyrsrdhskvdmlnpsxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// --- Session helpers ---
function getStoredSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("parties_session") || "null"); } catch { return null; }
}
function storeSession(s: any) { if (typeof window !== "undefined") localStorage.setItem("parties_session", JSON.stringify(s)); }
function clearSession() { if (typeof window !== "undefined") localStorage.removeItem("parties_session"); }
function authHeaders(t?: string) {
  const token = t || getStoredSession()?.access_token || SUPABASE_ANON_KEY;
  return { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

// --- Auth ---
export async function signUp(email: string, password: string) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  const d = await r.json(); if (d.access_token) storeSession(d); return d;
}
export async function signIn(email: string, password: string) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  const d = await r.json(); if (d.access_token) storeSession(d); return d;
}
export async function signOut() {
  const s = getStoredSession();
  if (s?.access_token) await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: "POST", headers: authHeaders(s.access_token) }).catch(() => {});
  clearSession();
}
export async function sendOTP(phone: string) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/otp`, { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
  return r.json();
}
export async function verifyOTP(phone: string, token: string) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/verify`, { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ type: "sms", phone, token }) });
  const d = await r.json(); if (d.access_token) storeSession(d); return d;
}
export async function refreshToken() {
  const s = getStoredSession();
  if (!s?.refresh_token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: s.refresh_token }) });
  const d = await r.json(); if (d.access_token) storeSession(d); return d;
}
export function getSession() { return getStoredSession(); }
export function getUser() { return getStoredSession()?.user || null; }

// --- PostgREST helpers ---
async function query(table: string, params = "") {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { headers: authHeaders() });
  if (!r.ok) throw new Error(`Query failed: ${r.statusText}`); return r.json();
}
async function insert(table: string, data: any) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: "POST", headers: { ...authHeaders(), Prefer: "return=representation" }, body: JSON.stringify(data) });
  if (!r.ok) throw new Error(`Insert failed: ${r.statusText}`);
  return r.json();
}
async function update(table: string, params: string, data: any) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { method: "PATCH", headers: { ...authHeaders(), Prefer: "return=representation" }, body: JSON.stringify(data) });
  if (!r.ok) throw new Error(`Update failed: ${r.statusText}`);
  return r.json();
}
async function remove(table: string, params: string) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { method: "DELETE", headers: authHeaders() }); return r.ok;
}

// --- Venues ---
export async function fetchVenues(metro?: string) {
  let p = "select=*&active=eq.true&order=hot.desc,rating.desc";
  if (metro) p += `&metro=eq.${encodeURIComponent(metro)}`; return query("venues", p);
}
export async function fetchVenue(id: number) { const v = await query("venues", `select=*&id=eq.${id}`); return v[0] || null; }
export async function fetchTableOptions(venueId: number) { return query("table_options", `select=*&venue_id=eq.${venueId}&active=eq.true&order=sort_order.asc`); }

// --- Restaurants ---
export async function fetchRestaurants(metro?: string) {
  let p = "select=*&active=eq.true&order=rating.desc";
  if (metro) p += `&metro=eq.${encodeURIComponent(metro)}`; return query("restaurants", p);
}
export async function fetchRestaurant(id: number) { const v = await query("restaurants", `select=*&id=eq.${id}`); return v[0] || null; }

// --- Fleet Vehicles ---
export async function fetchFleetVehicles(metro?: string) {
  let p = "select=*&available=eq.true&order=price_per_day.asc";
  if (metro) p += `&metro=eq.${encodeURIComponent(metro)}`; return query("fleet_vehicles", p);
}

// --- Jet Listings ---
export async function fetchJetListings(origin?: string) {
  let p = "select=*&active=eq.true&order=price_per_hour.asc";
  if (origin) p += `&origin_city=eq.${encodeURIComponent(origin)}`; return query("jet_listings", p);
}

// --- Helicopter Routes ---
export async function fetchHelicopterRoutes(origin?: string) {
  let p = "select=*&active=eq.true&order=price.asc";
  if (origin) p += `&origin_city=eq.${encodeURIComponent(origin)}`; return query("helicopter_routes", p);
}

// --- Villas ---
export async function fetchVillas(city?: string) {
  let p = "select=*&active=eq.true&order=rating.desc";
  if (city) p += `&city=eq.${encodeURIComponent(city)}`; return query("villas", p);
}

// --- Hotels ---
export async function fetchHotels(metro?: string, stars?: number) {
  let p = "select=*&active=eq.true&order=rating.desc";
  if (metro) p += `&metro=eq.${encodeURIComponent(metro)}`;
  if (stars) p += `&stars=eq.${stars}`; return query("hotels", p);
}

// --- Events ---
export async function fetchEvents(metro?: string) {
  let p = "select=*&order=event_date.asc";
  if (metro) p += `&metro=eq.${encodeURIComponent(metro)}`; return query("events", p);
}
export async function fetchEvent(id: number) { const v = await query("events", `select=*&id=eq.${id}`); return v[0] || null; }

// --- Favorites ---
export async function fetchFavorites(userId: string) { return query("favorites", `select=*,venues(*)&user_id=eq.${userId}&order=created_at.desc`); }
export async function addFavorite(userId: string, venueId: number) { return insert("favorites", { user_id: userId, venue_id: venueId }); }
export async function removeFavorite(userId: string, venueId: number) { return remove("favorites", `user_id=eq.${userId}&venue_id=eq.${venueId}`); }

// --- Bookings ---
export async function fetchBookings(userId: string) { return query("bookings", `select=*,venues(name,city,img_url)&user_id=eq.${userId}&order=booking_date.desc`); }
export async function createBooking(data: any) { return insert("bookings", data); }
export async function fetchBooking(id: number) { const v = await query("bookings", `select=*,venues(name,city,img_url)&id=eq.${id}`); return v[0] || null; }

// --- Profiles ---
export async function fetchProfile(userId: string) { const v = await query("profiles", `select=*&id=eq.${userId}`); return v[0] || null; }
export async function updateProfile(userId: string, data: any) { return update("profiles", `id=eq.${userId}`, data); }

// --- User Preferences ---
export async function fetchUserPreferences(userId: string) {
  const profile = await fetchProfile(userId);
  return profile?.preferences || null;
}
export async function updateUserPreferences(userId: string, preferences: any) {
  return update("profiles", `id=eq.${userId}`, { preferences });
}

// --- Notifications ---
export async function fetchNotifications(userId: string) { return query("notifications", `select=*&user_id=eq.${userId}&order=created_at.desc`); }
export async function markNotificationRead(id: number) { return update("notifications", `id=eq.${id}`, { read: true }); }

// --- Global Search ---
export async function globalSearch(term: string) {
  const encoded = encodeURIComponent(term);
  const [venues, restaurants, events, hotels] = await Promise.all([
    query("venues", `select=*&or=(name.ilike.*${encoded}*,city.ilike.*${encoded}*)&active=eq.true&limit=10`),
    query("restaurants", `select=*&or=(name.ilike.*${encoded}*,cuisine.ilike.*${encoded}*)&active=eq.true&limit=10`),
    query("events", `select=*&or=(name.ilike.*${encoded}*,venue_name.ilike.*${encoded}*)&limit=10`),
    query("hotels", `select=*&or=(name.ilike.*${encoded}*,city.ilike.*${encoded}*)&active=eq.true&limit=10`),
  ]);
  return { venues, restaurants, events, hotels };
}

// --- Promo Codes ---
export async function validatePromo(code: string) {
  const v = await query("promo_codes", `select=*&code=eq.${encodeURIComponent(code)}&active=eq.true`);
  return v[0] || null;
}

// --- Reviews ---
export async function fetchReviews(venueId: number) { return query("reviews", `select=*&venue_id=eq.${venueId}&order=created_at.desc`); }
export const fetchVenueReviews = fetchReviews;
export async function createReview(data: any) { return insert("reviews", data); }

// --- Storage ---
export async function uploadFile(bucket: string, path: string, file: Blob, contentType: string) {
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: "POST", headers: { ...authHeaders(), "Content-Type": contentType }, body: file,
  });
  if (!r.ok) throw new Error("Upload failed");
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

// --- Edge function caller ---
export async function callEdgeFunction(name: string, body: any) {
  const r = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(body),
  });
  return r.json();
}

// --- Membership Applications ---
export async function submitMembershipApplication(data: {
  full_name: string;
  email: string;
  phone: string;
  city_of_residence: string;
  preferred_destinations: string[];
  budget_range: string;
  referral_source: string;
  instagram_handle?: string;
  personal_note: string;
  referral_code?: string;
}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/membership_applications`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ ...data, status: "pending", submitted_at: new Date().toISOString() }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.message || "Failed to submit application"); }
  return r.json();
}

export async function fetchMembershipApplications(token?: string, status?: string) {
  let p = "select=*&order=submitted_at.desc";
  if (status && status !== "all") p += `&status=eq.${encodeURIComponent(status)}`;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/membership_applications?${p}`, { headers: authHeaders(token) });
  if (!r.ok) throw new Error(`Query failed: ${r.statusText}`);
  return r.json();
}

export async function updateApplicationStatus(token: string, applicationId: string, status: string) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/membership_applications?id=eq.${applicationId}`, {
    method: "PATCH",
    headers: { ...authHeaders(token), Prefer: "return=representation" },
    body: JSON.stringify({ status, reviewed_at: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error(`Update failed: ${r.statusText}`);
  return r.json();
}

// --- Concierge Messages ---
export async function fetchConciergeMessages(token?: string) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/concierge_messages?select=*&order=created_at.asc`, { headers: authHeaders(token) });
  if (!r.ok) throw new Error(`Query failed: ${r.statusText}`);
  return r.json();
}
export async function sendConciergeMessage(token: string, message: string, requestType?: string) {
  const user = getUser();
  const body: any = { user_id: user?.id, message, sender: "user", request_type: requestType || null, status: "sent" };
  const r = await fetch(`${SUPABASE_URL}/rest/v1/concierge_messages`, {
    method: "POST", headers: { ...authHeaders(token), Prefer: "return=representation" }, body: JSON.stringify(body),
  });
  return r.json();
}

// --- Email Notifications ---
export async function sendNotificationEmail(
  type: "application_received" | "application_approved" | "application_rejected" | "welcome",
  to: string,
  name: string,
  data?: any,
) {
  try {
    return await callEdgeFunction("send-email", { type, to, name, data });
  } catch (err) {
    console.error("Failed to send notification email:", err);
    return null;
  }
}

// --- Trip Requests ---
export async function submitTripRequest(token: string, data: {
  destinations: string[];
  trip_types: string[];
  arrival_date: string;
  departure_date: string;
  group_size: number;
  budget_range: string;
  accommodation: string;
  vibes: string[];
  specific_requests: string;
  occasion: string;
}) {
  const user = getUser();
  if (!user?.id) throw new Error("You must be signed in to submit a trip request.");
  const r = await fetch(`${SUPABASE_URL}/rest/v1/trip_requests`, {
    method: "POST",
    headers: { ...authHeaders(token), Prefer: "return=representation" },
    body: JSON.stringify({ ...data, user_id: user.id, status: "pending", submitted_at: new Date().toISOString() }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.message || "Failed to submit trip request"); }
  return r.json();
}

// --- Social Posts ---
export async function fetchSocialPosts(type?: string) {
  let p = "select=*&status=eq.active&order=created_at.desc";
  if (type) p += `&type=eq.${encodeURIComponent(type)}`;
  return query("social_posts", p);
}
export async function createSocialPost(token: string, data: any) {
  const user = getUser();
  if (!user?.id) throw new Error("You must be signed in to create a social post.");
  const r = await fetch(`${SUPABASE_URL}/rest/v1/social_posts`, {
    method: "POST",
    headers: { ...authHeaders(token), Prefer: "return=representation" },
    body: JSON.stringify({ ...data, user_id: user.id, status: "active" }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.message || "Failed to create post"); }
  return r.json();
}
export async function respondToSocialPost(token: string, postId: string, hostName: string, postType: string) {
  const user = getUser();
  if (!user?.id) throw new Error("You must be signed in.");
  const action = postType === "open_table" ? "join your table" : "connect about your trip";
  const message = `Hi ${hostName}! I'd love to ${action}. (Ref: post ${postId.slice(0, 8)})`;
  return sendConciergeMessage(token, message, "social_connect");
}

// --- Referrals ---
export async function fetchReferralStats(token: string) {
  const user = getUser();
  if (!user?.id) throw new Error("You must be signed in.");
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/referrals?select=id,status&referrer_id=eq.${user.id}`,
    { headers: authHeaders(token) },
  );
  if (!r.ok) throw new Error(`Query failed: ${r.statusText}`);
  const rows: { id: string; status: string }[] = await r.json();
  const total = rows.length;
  const joined = rows.filter(r => r.status === "joined" || r.status === "rewarded").length;
  const pending = rows.filter(r => r.status === "pending").length;
  const rewarded = rows.filter(r => r.status === "rewarded").length;
  return { total, joined, pending, rewarded };
}

export async function fetchReferralHistory(token: string) {
  const user = getUser();
  if (!user?.id) throw new Error("You must be signed in.");
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/referrals?select=*&referrer_id=eq.${user.id}&order=created_at.desc`,
    { headers: authHeaders(token) },
  );
  if (!r.ok) throw new Error(`Query failed: ${r.statusText}`);
  return r.json();
}

export async function createReferral(token: string, referredEmail: string) {
  const user = getUser();
  if (!user?.id) throw new Error("You must be signed in.");
  const code = `PARTY${user.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/referrals`, {
    method: "POST",
    headers: { ...authHeaders(token), Prefer: "return=representation" },
    body: JSON.stringify({
      referrer_id: user.id,
      referral_code: code,
      referred_email: referredEmail,
      status: "pending",
    }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.message || "Failed to create referral"); }
  return r.json();
}

export async function lookupReferrer(code: string) {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/referrals?select=referrer_id,referral_code&referral_code=eq.${encodeURIComponent(code)}&limit=1`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" } },
  );
  if (!r.ok) return null;
  const rows = await r.json();
  if (!rows.length) return null;
  // Fetch referrer profile name
  const profileR = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=full_name,avatar_url&id=eq.${rows[0].referrer_id}`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" } },
  );
  const profiles = await profileR.json().catch(() => []);
  return {
    referrer_id: rows[0].referrer_id,
    referral_code: rows[0].referral_code,
    referrer_name: profiles?.[0]?.full_name || "A PARTIES Member",
    referrer_avatar: profiles?.[0]?.avatar_url || null,
  };
}

// --- Tonight Deals ---
export async function fetchTonightDeals(city?: string) {
  const today = new Date().toISOString().split("T")[0];
  let p = `select=*&deal_date=eq.${today}&active=eq.true&order=deal_price.asc`;
  if (city) p += `&city=eq.${encodeURIComponent(city)}`;
  return query("tonight_deals", p);
}

export async function fetchTonightEvents(city?: string) {
  const today = new Date().toISOString().split("T")[0];
  let p = `select=*&event_date=eq.${today}&order=event_date.asc`;
  if (city) p += `&city=eq.${encodeURIComponent(city)}`;
  return query("events", p);
}

export const db = { query, insert, update, remove };
