import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This endpoint initializes today's spots record
// Call GET /api/setup once to ensure the database is ready

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date().toISOString().split('T')[0]

  try {
    // Try to insert today's spots record
    const { data, error } = await supabase
      .from('daily_spots')
      .upsert(
        { date: today, spots_remaining: 10, total_spots: 10 },
        { onConflict: 'date', ignoreDuplicates: true }
      )
      .select()

    if (error) {
      console.error('Setup error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        hint: 'Make sure the database tables are created. Run the SQL in supabase-setup.sql'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized',
      data
    })
  } catch (err) {
    console.error('Setup error:', err)
    return NextResponse.json({
      success: false,
      error: String(err),
      hint: 'Check your Supabase connection settings in .env.local'
    }, { status: 500 })
  }
}
