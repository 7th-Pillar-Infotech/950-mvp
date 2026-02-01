-- Run this SQL in your Supabase SQL Editor
-- Supabase Dashboard > SQL Editor > New Query

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  idea TEXT NOT NULL,
  stage TEXT NOT NULL,
  timeline TEXT NOT NULL,
  budget TEXT NOT NULL,
  chat_responses JSONB DEFAULT '{}',
  qualified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_spots table to track spots per day
CREATE TABLE IF NOT EXISTS daily_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  spots_remaining INTEGER NOT NULL DEFAULT 10,
  total_spots INTEGER NOT NULL DEFAULT 10
);

-- Create index on leads email for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Create index on daily_spots date
CREATE INDEX IF NOT EXISTS idx_daily_spots_date ON daily_spots(date);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_spots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Allow anonymous insert leads" ON leads;
DROP POLICY IF EXISTS "Allow anonymous read daily_spots" ON daily_spots;
DROP POLICY IF EXISTS "Allow anonymous update daily_spots" ON daily_spots;
DROP POLICY IF EXISTS "Allow anonymous insert daily_spots" ON daily_spots;

-- Create policies for anonymous access (needed for the form)
CREATE POLICY "Allow anonymous insert leads" ON leads
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous read daily_spots" ON daily_spots
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow anonymous update daily_spots" ON daily_spots
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert daily_spots" ON daily_spots
  FOR INSERT TO anon
  WITH CHECK (true);

-- Insert today's spots if not exists
INSERT INTO daily_spots (date, spots_remaining, total_spots)
VALUES (CURRENT_DATE, 10, 10)
ON CONFLICT (date) DO NOTHING;
