CREATE TABLE IF NOT EXISTS villas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  city text NOT NULL,
  metro text,
  location text,
  description text,
  bedrooms int DEFAULT 1,
  bathrooms int DEFAULT 1,
  max_guests int DEFAULT 2,
  price_per_night numeric,
  rating numeric DEFAULT 0,
  features text[] DEFAULT '{}',
  img_url text,
  gallery_images text[] DEFAULT '{}',
  available boolean DEFAULT true,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE villas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON villas FOR SELECT USING (true);
