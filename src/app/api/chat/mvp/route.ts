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

const SYSTEM_PROMPT = `You are a friendly product consultant for a $950 MVP building service. Your job is to quickly understand what the client wants to build through a fast, natural chat — then get them to the finish line.

You collect 7 things IN THIS ORDER:
1. **Name** — warm opener
2. **What are you building?** — let them describe freely, encourage detail with a brief follow-up if the answer is very vague (e.g., "Tell me a bit more — what would users do on it?"). One follow-up max, then move on.
3. **Who's this for?** — Ask about their target user/audience. Keep it casual: "Nice — **who's this for?** Who's your ideal user?" Accept short answers (e.g., "small business owners", "college students").
4. **What's the #1 thing a user should be able to do?** — The core action. Ask: "If a user could only do **one thing** on this, what would it be?" This anchors the MVP scope.
5. **What type of MVP fits?** — Based on what they described, present ONLY the relevant types as numbered options. Pick from:
   - Web App — if the idea involves a platform, dashboard, marketplace, SaaS tool, or any browser-based product
   - Mobile App — if the idea is clearly mobile-first (on-the-go use, location-based, camera, notifications)
   - AI Chatbot — if the idea involves answering questions, customer support, knowledge base, or conversational interface
   - Voice Agent — if the idea involves phone calls, voice booking, voice support, or hands-free interaction
   - Content Automation — if the idea involves scheduling posts, generating content, email sequences, or repetitive content tasks

   RULES for this step:
   - Show 2-4 options max. Never show all 5. Only show what genuinely fits the idea.
   - If only ONE type makes sense, suggest it directly: "Based on what you described, a **Web App** sounds like the right fit. Does that work, or did you have something else in mind?"
   - Always include a final option: "Something else" so they don't feel boxed in.

6. **Timeline** — "**When do you need this?**" with numbered options:
   1. Within 2 weeks
   2. Within a month
   3. No rush, exploring

7. **Email** — Ask LAST: "Love it — where should we send your project brief? **What's your email?**"

AFTER COLLECTING ALL 7:
- Give a short, punchy summary of what you understood (3-4 bullet points of what the $950 MVP would include, incorporating the target audience and core feature)
- Mention we'll review and reply within 12 hours with next steps
- This summary is their "mini-consultation" — make it feel valuable

TONE & RULES:
- Ask ONE question at a time
- Keep each response to 2-3 sentences max
- Be warm, professional, and direct — no filler
- Use **bold** for the question
- For numbered options, format as:
  1. Option
  2. Option
  (They can reply with just the number)

START by greeting them warmly and asking for their name.`

const PARSE_CONVERSATION_PROMPT = `Analyze this conversation and extract the following information as JSON:

{
  "name": "user's name",
  "email": "user's email",
  "idea": "their product/MVP idea — include any details they mentioned",
  "target_audience": "who the product is for (their ideal user/customer)",
  "core_feature": "the #1 thing a user should be able to do",
  "mvp_type": "web|mobile|chatbot|voice|automation|other",
  "timeline": "2weeks|1month|exploring",
  "conversation_complete": true/false (true if all 7 questions were answered: name, idea, target_audience, core_feature, mvp_type, timeline, email)
}

Map user responses to enum values:
- mvp_type: "web app" -> "web", "mobile app" -> "mobile", "chatbot"/ai -> "chatbot", "voice" -> "voice", "automation"/content -> "automation", "something else" -> "other"
- timeline: "2 weeks"/"within 2 weeks"/1 -> "2weeks", "month"/"within a month"/2 -> "1month", "no rush"/"exploring"/3 -> "exploring"

Return ONLY valid JSON, no other text.`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ParsedData {
  name?: string
  email?: string
  idea?: string
  target_audience?: string
  core_feature?: string
  mvp_type?: string
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
                `INSERT INTO mvp_leads (name, email, idea, target_audience, core_feature, mvp_type, timeline)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (email) DO UPDATE SET
                   name = EXCLUDED.name,
                   idea = EXCLUDED.idea,
                   target_audience = EXCLUDED.target_audience,
                   core_feature = EXCLUDED.core_feature,
                   mvp_type = EXCLUDED.mvp_type,
                   timeline = EXCLUDED.timeline,
                   updated_at = NOW()
                 RETURNING id`,
                [
                  parsedData.name,
                  parsedData.email,
                  parsedData.idea,
                  parsedData.target_audience || null,
                  parsedData.core_feature || null,
                  parsedData.mvp_type || null,
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
                  target_audience = COALESCE($1, target_audience),
                  core_feature = COALESCE($2, core_feature),
                  mvp_type = COALESCE($3, mvp_type),
                  timeline = COALESCE($4, timeline),
                  updated_at = NOW()
                WHERE id = $5`,
                [
                  parsedData.target_audience || null,
                  parsedData.core_feature || null,
                  parsedData.mvp_type || null,
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

            // Save the final summary to the lead
            const targetLeadId = metadata.leadId || leadId
            if (targetLeadId) {
              try {
                await query(
                  `UPDATE mvp_leads SET summary = $1, updated_at = NOW() WHERE id = $2`,
                  [fullMessage, targetLeadId]
                )
              } catch (err) {
                console.error('Error saving summary to lead:', err)
              }
            }
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
