CREATE TABLE IF NOT EXISTS helicopter_routes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  origin_city text NOT NULL,
  destination_city text NOT NULL,
  aircraft_type text,
  operator text,
  capacity int DEFAULT 4,
  flight_time_minutes int,
  price numeric,
  img_url text,
  active boolean DEFAULT true,
  metro text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE helicopter_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON helicopter_routes FOR SELECT USING (true);
