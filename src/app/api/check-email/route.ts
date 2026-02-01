import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

const MAX_EMAILS_PER_DOMAIN = 3

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const emailLower = email.toLowerCase()
    const domain = emailLower.split('@')[1]

    // Check if email already exists
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM leads WHERE LOWER(email) = LOWER($1)',
      [email]
    )

    if (existing) {
      return NextResponse.json({
        exists: true,
        domainLimitReached: false,
        message: 'You have already submitted a request with this email.'
      })
    }

    // Check how many emails from this domain
    const domainCount = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM leads WHERE LOWER(email) LIKE $1',
      [`%@${domain}`]
    )

    const count = parseInt(domainCount?.count || '0', 10)
    if (count >= MAX_EMAILS_PER_DOMAIN) {
      return NextResponse.json({
        exists: false,
        domainLimitReached: true,
        message: `We've reached the limit for submissions from this email domain.`
      })
    }

    return NextResponse.json({
      exists: false,
      domainLimitReached: false,
      message: null
    })
  } catch (err) {
    console.error('Error checking email:', err)
    return NextResponse.json({ error: 'Failed to check email' }, { status: 500 })
  }
}
