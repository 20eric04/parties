CREATE TABLE IF NOT EXISTS referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES auth.users(id),
  referral_code text NOT NULL UNIQUE,
  referred_email text,
  referred_name text,
  referred_user_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'joined', 'rewarded')),
  reward_tier text,
  created_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  rewarded_at timestamptz
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can read their own referrals
CREATE POLICY "Users read own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id);

-- Users can create referrals where they are the referrer
CREATE POLICY "Users create own referrals" ON referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- NOTE: The overly permissive public SELECT policy was removed for security.
-- The lookupReferrer function in supabase.ts should be migrated to a
-- server-side edge function using the service role key for public lookups.

-- Add referral_code column to membership_applications if not exists
ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS referral_code text;
