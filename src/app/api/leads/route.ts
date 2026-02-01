import { query, queryOne } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

interface Lead {
  id: string
  name: string
  email: string
  idea: string
  stage: string
  timeline: string
  budget: string
  qualified: boolean
  chat_responses: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

// Screening logic - returns true if qualified
function isQualifiedLead(stage: string, timeline: string, budget: string): boolean {
  // Auto-reject: exploring + no budget
  if (timeline === 'exploring' && budget === '0') return false
  // Auto-reject: just exploring with no real intent
  if (timeline === 'exploring' && stage === 'idea' && budget === '0') return false
  // Everyone else passes
  return true
}

// Extract IP address from request
function getClientIP(request: NextRequest): string | null {
  // Check various headers for the real IP (in order of preference)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }

  // Fallback headers
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP.trim()
  }

  return null
}

// POST - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, idea, stage, timeline, budget } = body

    // Validate required fields
    if (!name || !email || !idea || !stage || !timeline || !budget) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get client IP
    const ipAddress = getClientIP(request)

    // Check for existing submission with same email
    const existingByEmail = await queryOne<Lead>(
      'SELECT id FROM leads WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    if (existingByEmail) {
      return NextResponse.json({
        error: 'You have already submitted a request',
        code: 'DUPLICATE_EMAIL'
      }, { status: 409 })
    }

    // Check for existing submission with same IP (if IP is available)
    if (ipAddress) {
      const existingByIP = await queryOne<Lead>(
        'SELECT id FROM leads WHERE ip_address = $1',
        [ipAddress]
      )

      if (existingByIP) {
        return NextResponse.json({
          error: 'You have already submitted a request',
          code: 'DUPLICATE_IP'
        }, { status: 409 })
      }
    }

    // Check qualification
    const qualified = isQualifiedLead(stage, timeline, budget)

    // Insert lead with IP address
    const rows = await query<Lead>(
      `INSERT INTO leads (name, email, idea, stage, timeline, budget, qualified, chat_responses, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, email.toLowerCase().trim(), idea, stage, timeline, budget, qualified, JSON.stringify({}), ipAddress]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
    }

    return NextResponse.json({
      id: rows[0].id,
      qualified,
      message: qualified ? 'Lead qualified' : 'Lead not qualified'
    })
  } catch (err) {
    console.error('Error creating lead:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update lead with chat responses
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, chat_responses } = body

    if (!id) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    const rows = await query<Lead>(
      `UPDATE leads SET chat_responses = $1 WHERE id = $2 RETURNING *`,
      [JSON.stringify(chat_responses), id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: rows[0] })
  } catch (err) {
    console.error('Error updating lead:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
