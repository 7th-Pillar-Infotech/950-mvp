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

const SYSTEM_PROMPT = `You are a friendly product discovery assistant for a free prototype-building service. Your job is to gather information through a natural, conversational chat.

You need to collect the following information IN ORDER:
1. User's name
2. User's email
3. Their product idea (one line description)
4. What stage they're at (just an idea, validating, building, or launched)
5. How soon they want to launch (exploring, within 30 days, ASAP)
6. Budget for full MVP if they love the prototype ($0, under $1k, $1-5k, $5k+)
7. Who is the target user?
8. What is the ONE core action users must be able to do?
9. Any must-have features beyond the core action?
10. Any design inspiration or apps they like?

IMPORTANT RULES:
- Ask ONE question at a time
- For questions 4, 5, 6: Present numbered options like this:
  1. Option one
  2. Option two
  3. Option three
  (User can reply with just the number)
- Keep responses concise (2-3 sentences max)
- Be warm and encouraging, use occasional emojis
- Use **bold** for the main question
- After collecting questions 1-6, you MUST check qualification:
  - If timeline="exploring" AND budget="$0", they are NOT qualified. Politely explain we're looking for founders ready to move faster, suggest they come back when ready.
  - Otherwise, continue with questions 7-10
- After all 10 pieces of info are collected, wrap up warmly and let them know prototype will be delivered in 24-48 hours

CONVERSATION STATE:
Track what you've collected. When user provides info, acknowledge briefly and move to next question.

START by greeting and asking for their name.`

const PARSE_CONVERSATION_PROMPT = `Analyze this conversation and extract the following information as JSON:

{
  "name": "user's name",
  "email": "user's email",
  "idea": "their product idea",
  "stage": "idea|validating|building|launched",
  "timeline": "exploring|30days|asap",
  "budget": "0|under1k|1k-5k|5k+",
  "target_user": "who the target user is",
  "core_action": "the core action",
  "features": "must-have features",
  "design_inspiration": "design inspiration mentioned",
  "qualified": true/false (false if timeline=exploring AND budget=0),
  "conversation_complete": true/false (true if all 10 questions answered OR user was rejected for not qualifying)
}

Map user responses to the enum values:
- stage: "just an idea"/"idea" -> "idea", "validat*" -> "validating", "build*" -> "building", "launch*" -> "launched"
- timeline: "explor*"/"1" -> "exploring", "30"/"month"/"2" -> "30days", "asap"/"yesterday"/"urgent"/"3" -> "asap"
- budget: "$0"/"0"/"nothing"/"1" -> "0", "under"/"<1k"/"2" -> "under1k", "1-5"/"1k-5k"/"3" -> "1k-5k", "5k+"/"more"/"4" -> "5k+"

Return ONLY valid JSON, no other text.`

const SPEC_GENERATION_PROMPT = `Based on the conversation, generate a comprehensive product specification document.

The spec should include:

## Product Overview
- Product name suggestion
- One-line description
- Target users
- Core problem being solved

## Core Features
- Primary action/feature (must-have)
- Secondary features mentioned
- Nice-to-have features (inferred)

## User Flow
- Step-by-step user journey
- Key screens needed

## Design Direction
- Visual style notes
- UI/UX recommendations

## Technical Recommendations
- Suggested tech stack
- Key integrations needed

## Prototype Scope
- What to include in initial prototype
- What to defer to full MVP

Format as clean markdown.`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ParsedData {
  name?: string
  email?: string
  idea?: string
  stage?: string
  timeline?: string
  budget?: string
  target_user?: string
  core_action?: string
  features?: string
  design_inspiration?: string
  qualified?: boolean
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
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {}
  } catch {
    console.error('Failed to parse conversation data:', text)
    return {}
  }
}

async function generateSpec(messages: ChatMessage[], parsedData: ParsedData): Promise<string> {
  const conversationText = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SPEC_GENERATION_PROMPT,
    messages: [{
      role: 'user',
      content: `User Info:\nName: ${parsedData.name}\nIdea: ${parsedData.idea}\nTarget User: ${parsedData.target_user}\nCore Action: ${parsedData.core_action}\nFeatures: ${parsedData.features}\nDesign Inspiration: ${parsedData.design_inspiration}\n\nFull Conversation:\n${conversationText}`
    }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
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

    // Handle start action - return initial greeting (no streaming needed)
    if (action === 'start') {
      return new Response(
        JSON.stringify({
          message: "Hey there! 👋 I'm excited to help bring your idea to life with a free prototype.\n\nLet's start with the basics. **What's your name?**"
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

    // Create a streaming response
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullMessage = ''

          // Stream the AI response
          const streamResponse = anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            system: SYSTEM_PROMPT,
            messages: messages.map((m: ChatMessage) => ({
              role: m.role,
              content: m.content,
            })),
          })

          // Stream text chunks
          for await (const event of streamResponse) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text
              fullMessage += text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`))
            }
          }

          // Send message complete immediately so UI can update
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'message_done' })}\n\n`))

          // Now parse conversation and handle DB operations
          const allMessages = [...messages, { role: 'assistant' as const, content: fullMessage }]

          // Parse conversation to extract data
          const parsedData = await parseConversation(allMessages)

          const metadata: {
            leadCreated?: boolean
            leadId?: string
            email?: string
            rejected?: boolean
            isComplete?: boolean
          } = {}

          // Check if we have enough data to create a lead
          const hasBasicInfo = parsedData.name && parsedData.email && parsedData.idea
          const hasQualifyingInfo = parsedData.stage && parsedData.timeline && parsedData.budget
          const shouldCreateLead = hasBasicInfo && hasQualifyingInfo && !leadId

          if (shouldCreateLead) {
            if (!parsedData.qualified) {
              metadata.rejected = true
              metadata.email = parsedData.email
            } else {
              try {
                const rows = await query<{ id: string }>(
                  `INSERT INTO leads (name, email, idea, stage, timeline, budget, qualified)
                   VALUES ($1, $2, $3, $4, $5, $6, $7)
                   RETURNING id`,
                  [
                    parsedData.name,
                    parsedData.email,
                    parsedData.idea,
                    parsedData.stage,
                    parsedData.timeline,
                    parsedData.budget,
                    true
                  ]
                )

                if (rows.length > 0) {
                  metadata.leadCreated = true
                  metadata.leadId = rows[0].id
                  metadata.email = parsedData.email
                }
              } catch (err) {
                console.error('Error creating lead:', err)
              }
            }
          }

          // Check if conversation is complete
          if (parsedData.conversation_complete) {
            metadata.isComplete = true
            metadata.email = parsedData.email

            const currentLeadId = leadId || metadata.leadId
            if (currentLeadId && parsedData.qualified) {
              // Generate spec in background (don't await)
              generateSpec(allMessages, parsedData).then(async (spec) => {
                const chatResponses = {
                  target_user: parsedData.target_user,
                  core_action: parsedData.core_action,
                  features: parsedData.features,
                  design_inspiration: parsedData.design_inspiration,
                }

                await query(
                  'UPDATE leads SET spec = $1, chat_responses = $2 WHERE id = $3',
                  [spec, JSON.stringify(chatResponses), currentLeadId]
                )
              }).catch(err => console.error('Error saving spec:', err))
            }
          }

          // Send metadata at the end
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
    console.error('Error in conversational chat API:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: 'Failed to get response', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
