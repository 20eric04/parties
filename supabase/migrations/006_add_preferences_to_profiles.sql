-- Add preferences JSONB column to profiles for taste profile / preference learning
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN profiles.preferences IS 'User taste profile: cities, vibes, music, dining, travel, budget, occasions';
