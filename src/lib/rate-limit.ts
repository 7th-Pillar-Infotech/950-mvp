// In-memory rate limiting and ban system
// For production, use Redis or a database

interface RateLimitEntry {
  count: number
  firstRequest: number
  lastRequest: number
}

interface BanEntry {
  bannedAt: number
  reason: string
  expiresAt: number
}

// Store rate limit data per IP
const rateLimitStore = new Map<string, RateLimitEntry>()

// Store banned IPs
const banStore = new Map<string, BanEntry>()

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 20 // Max 20 requests per minute
const SPAM_THRESHOLD_MS = 500 // If requests are less than 500ms apart, it's spam
const SPAM_COUNT_FOR_BAN = 10 // 10 rapid requests = ban
const BAN_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hour ban

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()

  // Clean up rate limit entries older than the window
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now - entry.lastRequest > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitStore.delete(ip)
    }
  }

  // Clean up expired bans
  for (const [ip, ban] of banStore.entries()) {
    if (now > ban.expiresAt) {
      banStore.delete(ip)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitResult {
  allowed: boolean
  banned: boolean
  retryAfter?: number
  reason?: string
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now()

  // Check if IP is banned
  const ban = banStore.get(ip)
  if (ban && now < ban.expiresAt) {
    return {
      allowed: false,
      banned: true,
      retryAfter: Math.ceil((ban.expiresAt - now) / 1000),
      reason: ban.reason
    }
  }

  // Get or create rate limit entry
  let entry = rateLimitStore.get(ip)

  if (!entry) {
    entry = {
      count: 0,
      firstRequest: now,
      lastRequest: now
    }
    rateLimitStore.set(ip, entry)
  }

  // Reset window if expired
  if (now - entry.firstRequest > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0
    entry.firstRequest = now
  }

  // Check for spam (rapid requests)
  const timeSinceLastRequest = now - entry.lastRequest

  // Track rapid requests for spam detection
  if (timeSinceLastRequest < SPAM_THRESHOLD_MS) {
    // This is a rapid request, could be spam
    const rapidKey = `rapid_${ip}`
    let rapidCount = (rateLimitStore.get(rapidKey)?.count || 0) + 1

    rateLimitStore.set(rapidKey, {
      count: rapidCount,
      firstRequest: entry.firstRequest,
      lastRequest: now
    })

    if (rapidCount >= SPAM_COUNT_FOR_BAN) {
      // Ban for spamming
      banStore.set(ip, {
        bannedAt: now,
        reason: 'Automated spam detected',
        expiresAt: now + BAN_DURATION_MS
      })
      rateLimitStore.delete(rapidKey)

      return {
        allowed: false,
        banned: true,
        retryAfter: Math.ceil(BAN_DURATION_MS / 1000),
        reason: 'You have been temporarily banned for spam-like behavior. Please try again later.'
      }
    }
  } else {
    // Reset rapid count if request is not rapid
    rateLimitStore.delete(`rapid_${ip}`)
  }

  // Increment count
  entry.count++
  entry.lastRequest = now

  // Check if over limit
  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((entry.firstRequest + RATE_LIMIT_WINDOW_MS - now) / 1000)
    return {
      allowed: false,
      banned: false,
      retryAfter,
      reason: 'Too many requests. Please slow down.'
    }
  }

  return { allowed: true, banned: false }
}

export function banIP(ip: string, reason: string, durationMs: number = BAN_DURATION_MS): void {
  const now = Date.now()
  banStore.set(ip, {
    bannedAt: now,
    reason,
    expiresAt: now + durationMs
  })
}

export function unbanIP(ip: string): boolean {
  return banStore.delete(ip)
}

export function isIPBanned(ip: string): boolean {
  const ban = banStore.get(ip)
  if (!ban) return false
  if (Date.now() > ban.expiresAt) {
    banStore.delete(ip)
    return false
  }
  return true
}

export function getBanInfo(ip: string): BanEntry | null {
  const ban = banStore.get(ip)
  if (!ban) return null
  if (Date.now() > ban.expiresAt) {
    banStore.delete(ip)
    return null
  }
  return ban
}
