CREATE TABLE IF NOT EXISTS tonight_deals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id uuid,
  venue_name text NOT NULL,
  city text NOT NULL,
  metro text,
  deal_date date NOT NULL DEFAULT CURRENT_DATE,
  original_price numeric,
  deal_price numeric,
  available_times text[] DEFAULT '{}',
  max_guests int,
  description text,
  img_url text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE tonight_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON tonight_deals FOR SELECT USING (true);
