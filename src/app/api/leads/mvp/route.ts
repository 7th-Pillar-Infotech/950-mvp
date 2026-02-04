import { query, queryOne } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg']

const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'guerrillamail.org',
  'mailinator.com', 'maildrop.cc', 'throwaway.email', 'fakeinbox.com',
  'trashmail.com', 'tempinbox.com', '10minutemail.com', '10minutemail.net',
  'minutemail.com', 'dispostable.com', 'mailnesia.com', 'tempail.com',
  'tempr.email', 'discard.email', 'discardmail.com', 'spamgourmet.com',
  'mytrashmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net',
  'spam4.me', 'grr.la', 'mailexpire.com', 'meltmail.com', 'yopmail.com',
  'yopmail.fr', 'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc', 'nomail.xl.cx',
  'mega.zik.dj', 'speed.1s.fr', 'courriel.fr.nf', 'moncourrier.fr.nf',
  'monemail.fr.nf', 'monmail.fr.nf', 'getnada.com', 'tempmailo.com',
  'emailondeck.com', 'tempmailaddress.com', 'burnermail.io', 'mailsac.com',
  'inboxkitten.com', 'emailfake.com', 'fakemailgenerator.com', 'mohmal.com',
  'tempsky.com', 'trashinbox.com', 'dropmail.me', 'instantemailaddress.com',
  'crazymailing.com', 'throwawaymail.com', 'getairmail.com', 'mailcatch.com',
  'tmail.ws', 'tmpmail.org', 'tmpmail.net', 'tempmails.net', 'disposablemail.com',
]

interface MvpLead {
  id: string
  name: string
  email: string
  idea: string
  brief_url: string | null
  ip_address: string | null
  created_at: string
}

interface MonthlySpots {
  id: string
  month: string
  spots_remaining: number
  total_spots: number
}

function getClientIP(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()

  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP.trim()

  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) return cfConnectingIP.trim()

  return null
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const name = formData.get('name') as string | null
    const email = formData.get('email') as string | null
    const idea = formData.get('idea') as string | null
    const briefFile = formData.get('brief') as File | null

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !idea?.trim()) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    // Check disposable email
    const emailDomain = email.trim().toLowerCase().split('@')[1]
    if (DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain)) {
      return NextResponse.json({ error: 'Please use a real email address, not a temporary one.' }, { status: 400 })
    }

    // Validate file if present
    if (briefFile && briefFile.size > 0) {
      if (briefFile.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File must be under 10MB.' }, { status: 400 })
      }
      const ext = briefFile.name.split('.').pop()?.toLowerCase()
      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json({ error: 'Allowed file formats: PDF, DOC, DOCX, TXT, PNG, JPG.' }, { status: 400 })
      }
    }

    const ipAddress = getClientIP(request)
    const cleanEmail = email.trim().toLowerCase()

    // Check for duplicate email
    const existingByEmail = await queryOne<MvpLead>(
      'SELECT id FROM mvp_leads WHERE email = $1',
      [cleanEmail]
    )
    if (existingByEmail) {
      return NextResponse.json({ error: 'You have already submitted a request.' }, { status: 409 })
    }

    // Check for duplicate IP
    if (ipAddress) {
      const existingByIP = await queryOne<MvpLead>(
        'SELECT id FROM mvp_leads WHERE ip_address = $1',
        [ipAddress]
      )
      if (existingByIP) {
        return NextResponse.json({ error: 'You have already submitted a request.' }, { status: 409 })
      }
    }

    // Upload file to Supabase Storage if present (non-fatal — lead is saved even if upload fails)
    let briefUrl: string | null = null
    if (briefFile && briefFile.size > 0) {
      try {
        const ext = briefFile.name.split('.').pop()?.toLowerCase()
        const timestamp = Date.now()
        const safeName = briefFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const storagePath = `${timestamp}-${safeName}`

        const buffer = Buffer.from(await briefFile.arrayBuffer())
        const { error: uploadError } = await supabaseAdmin.storage
          .from('mvp-briefs')
          .upload(storagePath, buffer, {
            contentType: briefFile.type || `application/${ext}`,
            upsert: false,
          })

        if (uploadError) {
          console.error('[MVP Leads API] File upload error (non-fatal):', uploadError)
        } else {
          const { data: urlData } = supabaseAdmin.storage
            .from('mvp-briefs')
            .getPublicUrl(storagePath)
          briefUrl = urlData.publicUrl
        }
      } catch (uploadErr) {
        console.error('[MVP Leads API] File upload failed (non-fatal):', uploadErr)
      }
    }

    // Insert lead
    const rows = await query<MvpLead>(
      `INSERT INTO mvp_leads (name, email, idea, brief_url, ip_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name.trim(), cleanEmail, idea.trim(), briefUrl, ipAddress]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Failed to save your submission.' }, { status: 500 })
    }

    // Decrement monthly spots (non-fatal if table doesn't exist yet)
    try {
      const month = getCurrentMonth()
      await query<MonthlySpots>(
        'UPDATE monthly_spots SET spots_remaining = spots_remaining - 1 WHERE month = $1 AND spots_remaining > 0',
        [month]
      )
    } catch (spotErr) {
      console.error('[MVP Leads API] Spots decrement failed (non-fatal):', spotErr)
    }

    return NextResponse.json({ id: rows[0].id, success: true })
  } catch (err) {
    console.error('[MVP Leads API] Error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
