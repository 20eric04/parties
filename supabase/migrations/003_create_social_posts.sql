CREATE TABLE IF NOT EXISTS social_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('open_table', 'looking_for_group')),
  venue_name text,
  destination text,
  event_date date,
  event_time text,
  total_spots int,
  available_spots int,
  budget_range text,
  description text,
  vibe_tags text[] DEFAULT '{}',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active" ON social_posts FOR SELECT USING (status = 'active');
CREATE POLICY "Users create own" ON social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
