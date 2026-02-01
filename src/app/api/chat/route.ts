import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are a friendly product discovery assistant for a prototype-building service. Your job is to gather information about the user's idea through a natural conversation.

You need to understand:
1. Who is the target user? (e.g., busy founders, fitness coaches, small business owners)
2. What is the ONE core action users must be able to do?
3. Any must-have features beyond the core action?
4. Any design inspiration or apps they like the vibe of?

Guidelines:
- Be conversational and friendly, use emojis sparingly
- Ask ONE question at a time
- Keep responses concise (2-3 sentences max)
- Acknowledge their answers before asking the next question
- After gathering all 4 pieces of info, wrap up the conversation warmly and let them know the team will review and build their prototype within 24-48 hours
- Use **bold** for emphasis on key questions
- Don't be overly formal or robotic`

const SPEC_GENERATION_PROMPT = `Based on the following conversation with a user about their product idea, generate a comprehensive product specification document.

The spec should include:

## Product Overview
- Product name suggestion (if not provided)
- One-line description
- Target users
- Core problem being solved

## Core Features
- Primary action/feature (must-have)
- Secondary features mentioned
- Nice-to-have features (inferred)

## User Flow
- Step-by-step user journey for the core action
- Key screens needed

## Design Direction
- Visual style notes (based on inspirations mentioned)
- UI/UX recommendations

## Technical Recommendations
- Suggested tech stack
- Key integrations needed
- Data models overview

## Prototype Scope
- What to include in the initial prototype
- What to defer to full MVP

Format the output as clean markdown that can be used by the development team.`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

async function generateSpec(messages: ChatMessage[], idea: string, name: string): Promise<string> {
  const conversationText = messages
    .map(m => `${m.role === 'user' ? name : 'Assistant'}: ${m.content}`)
    .join('\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SPEC_GENERATION_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Original idea: "${idea}"\n\nConversation:\n${conversationText}\n\nPlease generate the product specification.`
      }
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, idea, name, email, leadId } = body

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 })
    }

    // Build context for the conversation
    const contextMessage = `The user's name is ${name}. Their email is ${email}. Their initial idea is: "${idea}"`

    // Build messages for API - must start with user message
    let apiMessages: Array<{ role: 'user' | 'assistant'; content: string }>

    if (messages.length === 0) {
      // Initial greeting request
      apiMessages = [{ role: 'user', content: `Hi! I just submitted my idea: "${idea}". I'm ready to answer your questions.` }]
    } else {
      // Filter and restructure messages to ensure valid format
      const formattedMessages = messages.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content,
      }))

      // If first message is assistant, prepend a context user message
      if (formattedMessages.length > 0 && formattedMessages[0].role === 'assistant') {
        apiMessages = [
          { role: 'user', content: `I submitted my idea: "${idea}". Here's our conversation so far:` },
          ...formattedMessages
        ]
      } else {
        apiMessages = formattedMessages
      }
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT + '\n\n' + contextMessage,
      messages: apiMessages,
    })

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    // Count user messages to determine if conversation is complete
    const userMessageCount = messages.filter((m: ChatMessage) => m.role === 'user').length
    const isComplete = userMessageCount >= 4

    let spec = null

    // If conversation is complete, generate the spec and save to DB
    if (isComplete && leadId) {
      try {
        // Generate comprehensive spec
        const fullConversation = [...messages, { role: 'assistant' as const, content: assistantMessage }]
        spec = await generateSpec(fullConversation, idea, name)

        // Save spec to database
        await query(
          'UPDATE leads SET spec = $1, chat_responses = $2 WHERE id = $3',
          [spec, JSON.stringify(Object.fromEntries(
            messages
              .filter((m: ChatMessage) => m.role === 'user')
              .map((m: ChatMessage, i: number) => [`response_${i + 1}`, m.content])
          )), leadId]
        )
      } catch (specErr) {
        console.error('Error generating/saving spec:', specErr)
      }
    }

    return NextResponse.json({
      message: assistantMessage,
      isComplete,
      spec,
    })
  } catch (err: unknown) {
    console.error('Error in chat API:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to get response', details: errorMessage }, { status: 500 })
  }
}
