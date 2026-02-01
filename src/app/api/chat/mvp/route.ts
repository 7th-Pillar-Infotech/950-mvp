import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  return 'unknown'
}

const SYSTEM_PROMPT = `You are a friendly product consultant for a $950 MVP building service. Your job is to gather information through a natural, conversational chat to understand what the client wants to build.

You need to collect the following information IN ORDER:
1. User's name
2. User's email
3. Their product/MVP idea (let them describe it in detail)
4. What type of MVP they need:
   1. Web App
   2. AI Chatbot
   3. Voice Agent
   4. Content Automation
   5. Not sure
5. What's their main goal:
   1. Validate an idea
   2. Demo for investors
   3. Automate something
   4. Launch a side project
   5. Other
6. Any specific features or requirements they have in mind?
7. Do they have any existing designs, wireframes, or references?
8. What's their timeline? (When do they need this by?)

IMPORTANT RULES:
- Ask ONE question at a time
- For questions 4 and 5: Present numbered options like this:
  1. Option one
  2. Option two
  (User can reply with just the number)
- Keep responses concise (2-3 sentences max)
- Be warm, professional, and encouraging
- Use **bold** for the main question
- After collecting all information, wrap up warmly:
  - Thank them for the details
  - Let them know we'll review and reply within 12 hours with next steps
  - Mention the $950 flat rate includes everything discussed

CONVERSATION STATE:
Track what you've collected. When user provides info, acknowledge briefly and move to next question.

START by greeting them warmly and asking for their name.`

const PARSE_CONVERSATION_PROMPT = `Analyze this conversation and extract the following information as JSON:

{
  "name": "user's name",
  "email": "user's email",
  "idea": "their product/MVP idea description",
  "mvp_type": "web|chatbot|voice|automation|not-sure",
  "goal": "validate|demo|automate|side-project|other",
  "features": "specific features mentioned",
  "existing_assets": "any designs/wireframes/references mentioned",
  "timeline": "their timeline/deadline",
  "conversation_complete": true/false (true if all 8 questions answered)
}

Map user responses to the enum values:
- mvp_type: "web app"/1 -> "web", "chatbot"/ai/2 -> "chatbot", "voice"/3 -> "voice", "automation"/content/4 -> "automation", "not sure"/5 -> "not-sure"
- goal: "validate"/1 -> "validate", "demo"/investor/2 -> "demo", "automate"/3 -> "automate", "side project"/launch/4 -> "side-project", "other"/5 -> "other"

Return ONLY valid JSON, no other text.`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ParsedData {
  name?: string
  email?: string
  idea?: string
  mvp_type?: string
  goal?: string
  features?: string
  existing_assets?: string
  timeline?: string
  conversation_complete?: boolean
}

async function parseConversation(messages: ChatMessage[]): Promise<ParsedData> {
  const conversationText = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: PARSE_CONVERSATION_PROMPT,
    messages: [{ role: 'user', content: conversationText }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {}
  } catch {
    console.error('Failed to parse conversation data:', text)
    return {}
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP)

    if (!rateLimitResult.allowed) {
      const status = rateLimitResult.banned ? 403 : 429
      return new Response(
        JSON.stringify({
          error: rateLimitResult.reason || 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
          banned: rateLimitResult.banned
        }),
        {
          status,
          headers: {
            'Content-Type': 'application/json',
            ...(rateLimitResult.retryAfter && {
              'Retry-After': rateLimitResult.retryAfter.toString()
            })
          }
        }
      )
    }

    const body = await request.json()
    const { messages, leadId, action } = body

    // Handle start action
    if (action === 'start') {
      return new Response(
        JSON.stringify({
          message: "Hey there! 👋 I'm here to help you get started with your $950 MVP.\n\nLet's chat about what you're looking to build. **What's your name?**"
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullMessage = ''

          const streamResponse = anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            system: SYSTEM_PROMPT,
            messages: messages.map((m: ChatMessage) => ({
              role: m.role,
              content: m.content,
            })),
          })

          for await (const event of streamResponse) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text
              fullMessage += text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`))
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'message_done' })}\n\n`))

          const allMessages = [...messages, { role: 'assistant' as const, content: fullMessage }]
          const parsedData = await parseConversation(allMessages)

          const metadata: {
            leadCreated?: boolean
            leadId?: string
            email?: string
            isComplete?: boolean
          } = {}

          // Check if we have enough data to create a lead
          const hasBasicInfo = parsedData.name && parsedData.email && parsedData.idea
          const shouldCreateLead = hasBasicInfo && !leadId

          if (shouldCreateLead) {
            try {
              const rows = await query<{ id: string }>(
                `INSERT INTO mvp_leads (name, email, idea, mvp_type, goal, features, existing_assets, timeline)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT (email) DO UPDATE SET
                   name = EXCLUDED.name,
                   idea = EXCLUDED.idea,
                   mvp_type = EXCLUDED.mvp_type,
                   goal = EXCLUDED.goal,
                   features = EXCLUDED.features,
                   existing_assets = EXCLUDED.existing_assets,
                   timeline = EXCLUDED.timeline,
                   updated_at = NOW()
                 RETURNING id`,
                [
                  parsedData.name,
                  parsedData.email,
                  parsedData.idea,
                  parsedData.mvp_type || null,
                  parsedData.goal || null,
                  parsedData.features || null,
                  parsedData.existing_assets || null,
                  parsedData.timeline || null
                ]
              )

              if (rows.length > 0) {
                metadata.leadCreated = true
                metadata.leadId = rows[0].id
                metadata.email = parsedData.email
              }
            } catch (err) {
              console.error('Error creating/updating MVP lead:', err)
            }
          } else if (leadId && parsedData) {
            // Update existing lead with new info
            try {
              await query(
                `UPDATE mvp_leads SET
                  mvp_type = COALESCE($1, mvp_type),
                  goal = COALESCE($2, goal),
                  features = COALESCE($3, features),
                  existing_assets = COALESCE($4, existing_assets),
                  timeline = COALESCE($5, timeline),
                  updated_at = NOW()
                WHERE id = $6`,
                [
                  parsedData.mvp_type || null,
                  parsedData.goal || null,
                  parsedData.features || null,
                  parsedData.existing_assets || null,
                  parsedData.timeline || null,
                  leadId
                ]
              )
            } catch (err) {
              console.error('Error updating MVP lead:', err)
            }
          }

          if (parsedData.conversation_complete) {
            metadata.isComplete = true
            metadata.email = parsedData.email
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', ...metadata })}\n\n`))
          controller.close()
        } catch (err) {
          console.error('Streaming error:', err)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Something went wrong' })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err: unknown) {
    console.error('Error in MVP chat API:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: 'Failed to get response', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
