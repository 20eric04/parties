# PARTIES — Project Context

## Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Hosting**: Vercel
- **Payments**: Stripe Connect + Checkout (planned)

## Supabase
- Project: `ribyrsrdhskvdmlnpsxk` (name: "luma")
- URL: `https://ribyrsrdhskvdmlnpsxk.supabase.co`
- No Supabase SDK — plain `fetch` only via `lib/supabase.ts`

## Vercel
- Project: `parties` (`prj_dNRkw6U9Ucv5JByMofP2QGPuZKeQ`)
- Team: `team_q0gCXDtietWEYYf62NRTdZl6`
- Domain: `parties-alpha.vercel.app`

## Design System
- **Auth/Onboarding**: Dark mode (`#0A0A0A`)
- **Main App**: Light mode (`#FFFFFF`)
- **Accent**: `#E8730C` (orange)
- **Fonts**: Cormorant Garamond (display), DM Sans (body)
- **Style refs**: Resy (step auth), Flighty (map), Airbnb (explore), Oura (nav)

## Auth Flow (Resy-inspired)
1. Email → 2. Name + Password → 3. Phone → 4. OTP → 5. City Selection
All dark screens, one field per screen, "Next" CTA pinned to bottom.

## Routes
| Route | Purpose |
|-------|---------|
| `/` | Splash → Landing |
| `/login` | Step-by-step auth flow |
| `/explore` | Home feed with venues |
| `/venue/[id]` | Venue detail + booking |
| `/saved` | Saved venues |
| `/bookings` | User's bookings |
| `/profile` | Profile + settings |

## Database Tables (28)
venues, table_options, events, bookings, profiles, promo_codes, promo_redemptions,
restaurants, hotels, fleet_vehicles, jet_listings, car_bookings, packages,
favorites, reviews, referrals, referral_rewards, promoter_invites, notifications,
push_subscriptions, audit_log, link_clicks, waitlist, blog_posts, drip_emails,
app_config, venue_photos, partner_payouts

## Markets
Miami, NYC, Vegas, Scottsdale, St. Martin, St. Barths, Tulum, Cabo, Ibiza,
Mykonos, London, Paris, Côte d'Azur, Amsterdam, Barcelona, Milan

## Env Vars (set in Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://ribyrsrdhskvdmlnpsxk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```
