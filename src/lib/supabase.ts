import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key for storage uploads
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)

// Types for our database
export interface Lead {
  id: string
  name: string
  email: string
  idea: string
  stage: string
  timeline: string
  budget: string
  chat_responses: Record<string, string>
  qualified: boolean
  created_at: string
}

export interface DailySpots {
  id: string
  date: string
  spots_remaining: number
  total_spots: number
}
