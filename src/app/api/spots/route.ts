import { query, queryOne } from '@/lib/db'
import { NextResponse } from 'next/server'

const TOTAL_SPOTS = 10

interface DailySpots {
  id: string
  date: string
  spots_remaining: number
  total_spots: number
}

// GET - Get today's spots remaining
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    console.log('[Spots API] Looking for date:', today)

    // Try to get today's record
    let data = await queryOne<DailySpots>(
      'SELECT * FROM daily_spots WHERE date = $1::date',
      [today]
    )
    console.log('[Spots API] Found record:', data)

    // If no record for today, create one
    if (!data) {
      console.log('[Spots API] No record found, creating new one')
      const rows = await query<DailySpots>(
        'INSERT INTO daily_spots (date, spots_remaining, total_spots) VALUES ($1, $2, $3) ON CONFLICT (date) DO UPDATE SET date = $1 RETURNING *',
        [today, TOTAL_SPOTS, TOTAL_SPOTS]
      )
      data = rows[0]
      console.log('[Spots API] Created record:', data)
    }

    const result = {
      spots_remaining: data?.spots_remaining ?? TOTAL_SPOTS,
      total_spots: data?.total_spots ?? TOTAL_SPOTS
    }
    console.log('[Spots API] Returning:', result)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[Spots API] Error fetching spots:', err)
    return NextResponse.json({ spots_remaining: TOTAL_SPOTS, total_spots: TOTAL_SPOTS, error: 'Database error' })
  }
}

// POST - Decrement spots (called when a lead is qualified)
export async function POST() {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Get current spots and decrement atomically
    const rows = await query<DailySpots>(
      'UPDATE daily_spots SET spots_remaining = spots_remaining - 1 WHERE date = $1 AND spots_remaining > 0 RETURNING *',
      [today]
    )

    if (rows.length === 0) {
      // Either no record or no spots remaining
      const existing = await queryOne<DailySpots>(
        'SELECT * FROM daily_spots WHERE date = $1',
        [today]
      )

      if (!existing) {
        return NextResponse.json({ error: 'No spots record found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'No spots remaining' }, { status: 400 })
    }

    return NextResponse.json({
      spots_remaining: rows[0].spots_remaining,
      total_spots: rows[0].total_spots
    })
  } catch (err) {
    console.error('Error decrementing spots:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
