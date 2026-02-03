-- Run this SQL in your Supabase SQL Editor to add new columns to mvp_leads
-- Supabase Dashboard > SQL Editor > New Query

-- Add target_audience, core_feature, and summary columns to mvp_leads
ALTER TABLE mvp_leads ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE mvp_leads ADD COLUMN IF NOT EXISTS core_feature TEXT;
ALTER TABLE mvp_leads ADD COLUMN IF NOT EXISTS summary TEXT;
