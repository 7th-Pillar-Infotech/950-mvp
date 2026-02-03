import { query, queryOne } from '@/lib/db'
import { NextResponse } from 'next/server'

const TOTAL_SPOTS = 5

interface MonthlySpots {
  id: string
  month: string
  spots_remaining: number
  total_spots: number
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

// GET - Get current month's spots remaining
export async function GET() {
  try {
    const month = getCurrentMonth()

    let data = await queryOne<MonthlySpots>(
      'SELECT * FROM monthly_spots WHERE month = $1::date',
      [month]
    )

    if (!data) {
      const rows = await query<MonthlySpots>(
        'INSERT INTO monthly_spots (month, spots_remaining, total_spots) VALUES ($1, $2, $3) ON CONFLICT (month) DO UPDATE SET month = $1 RETURNING *',
        [month, TOTAL_SPOTS, TOTAL_SPOTS]
      )
      data = rows[0]
    }

    return NextResponse.json({
      spots_remaining: data?.spots_remaining ?? TOTAL_SPOTS,
      total_spots: data?.total_spots ?? TOTAL_SPOTS
    })
  } catch (err) {
    console.error('[MVP Spots API] Error fetching spots:', err)
    return NextResponse.json({ spots_remaining: TOTAL_SPOTS, total_spots: TOTAL_SPOTS, error: 'Database error' })
  }
}

// POST - Decrement spots (called when an MVP lead is qualified)
export async function POST() {
  try {
    const month = getCurrentMonth()

    const rows = await query<MonthlySpots>(
      'UPDATE monthly_spots SET spots_remaining = spots_remaining - 1 WHERE month = $1 AND spots_remaining > 0 RETURNING *',
      [month]
    )

    if (rows.length === 0) {
      const existing = await queryOne<MonthlySpots>(
        'SELECT * FROM monthly_spots WHERE month = $1',
        [month]
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
    console.error('[MVP Spots API] Error decrementing spots:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
