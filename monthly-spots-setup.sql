-- Run this SQL in your Supabase SQL Editor to add monthly spots for MVP
-- Supabase Dashboard > SQL Editor > New Query

-- Create monthly_spots table to track MVP spots per month
CREATE TABLE IF NOT EXISTS monthly_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE UNIQUE NOT NULL,
  spots_remaining INTEGER NOT NULL DEFAULT 5,
  total_spots INTEGER NOT NULL DEFAULT 5
);

-- Create index on monthly_spots month
CREATE INDEX IF NOT EXISTS idx_monthly_spots_month ON monthly_spots(month);

-- Enable Row Level Security
ALTER TABLE monthly_spots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Allow anonymous read monthly_spots" ON monthly_spots;
DROP POLICY IF EXISTS "Allow anonymous update monthly_spots" ON monthly_spots;
DROP POLICY IF EXISTS "Allow anonymous insert monthly_spots" ON monthly_spots;

-- Create policies for anonymous access
CREATE POLICY "Allow anonymous read monthly_spots" ON monthly_spots
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow anonymous update monthly_spots" ON monthly_spots
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert monthly_spots" ON monthly_spots
  FOR INSERT TO anon
  WITH CHECK (true);

-- Insert current month's spots if not exists
INSERT INTO monthly_spots (month, spots_remaining, total_spots)
VALUES (date_trunc('month', CURRENT_DATE)::date, 5, 5)
ON CONFLICT (month) DO NOTHING;
