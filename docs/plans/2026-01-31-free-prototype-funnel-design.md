# Free Prototype Funnel — Design Document

## Overview

A Hormozi-style lead generation funnel offering free clickable prototypes (10/day limit) to capture leads and upsell to the $950 MVP service.

## Value Proposition

- **Free offer:** Clickable React/Next.js prototype + landing page for their idea
- **Scarcity:** 10 spots per day, live counter on website
- **Upsell:** $950 full MVP with real functionality

---

## User Flow

1. **Landing page** — Hero promotes free prototype offer. Prominent counter shows "X of 10 spots remaining today." Strong CTA: "Get Your Free Prototype"

2. **Quick capture** — Modal or inline form: name, email, one-line idea description. On submit, spot is reserved (counter decrements). No account/password.

3. **Chatbot conversation** — Opens immediately on same page. Asks 5-8 clarifying questions using brainstorming methodology. Streaming responses for engagement.

4. **Confirmation** — Conversation complete. "We're building your prototype. Check your email in 24-48 hours."

5. **Delivery** — Magic link email with link to deployed prototype + upsell pitch for $950 MVP.

6. **Prototype experience** — Working clickable prototype with mock data. Subtle banner/CTA: "This is a prototype. Ready for the real thing?"

7. **Follow-up sequence** — Email 2-3 days later with social proof and upsell.

---

## Page Structure

| Route | Purpose |
|-------|---------|
| `/` | Free prototype funnel — counter, capture form, embedded chatbot |
| `/mvp` | $950 MVP sales page — for upsell and direct ad traffic |
| `/prototype/[token]` | Delivered prototype — unique per user, magic link access |
| `/chat/[token]` | Resume/review chatbot conversation via magic link |

**Note:** Current landing page content moves to `/mvp`. Home (`/`) becomes the free prototype funnel.

---

## Chatbot Conversation Design

**Brainstorming flow (5-8 questions):**

1. **Expand the idea** — "Tell me more about [one-liner]. What problem does this solve?"

2. **Target user** — "Who's the main person using this?"

3. **Core action** — "What's the ONE thing a user must be able to do for this to be useful?"

4. **Secondary features** — "Any other must-haves for the prototype, or is [core action] enough?"

5. **Existing alternatives** — "How do people solve this problem today without your product?"

6. **Visual inspiration** — "Any apps or websites that have the vibe you're going for? (optional)"

7. **Success criteria** — "If we nail this prototype, what would make you say 'yes, this is it'?"

**Conversation rules:**
- One question per message
- Acknowledge their answer before asking next question
- Skip questions if already answered in previous responses
- Keep it conversational, not interrogation-style
- Store all responses structured for easy handoff to build team

---

## Technical Architecture

### Database (Supabase)

**Tables:**

```sql
-- Submissions
submissions (
  id uuid primary key,
  email text not null,
  name text not null,
  one_liner text not null,
  conversation jsonb,
  status text default 'pending', -- pending, building, delivered
  prototype_url text,
  created_at timestamp default now()
)

-- Daily counter derived from: SELECT COUNT(*) FROM submissions WHERE created_at::date = CURRENT_DATE
```

### Counter & Submissions

- Query count of today's submissions
- Display `10 - count` as remaining spots
- Reset at midnight (UTC or configured timezone)
- Check count before insert; reject if already 10

### Chatbot

- **API route:** `/api/chat` handles streaming responses
- **Model:** Claude (claude-sonnet-4-20250514) with brainstorming system prompt
- **State:** Conversation stored in Supabase tied to submission ID
- **Streaming:** Vercel AI SDK or native fetch with ReadableStream

### Magic Links

- **Token:** UUID or signed JWT with submission ID
- **Routes:** `/prototype/[token]` and `/chat/[token]` validate and load user's data
- **Expiry:** Optional (can keep valid indefinitely)

### Stack

- Next.js (existing codebase)
- Supabase (database, auth-less magic links)
- Claude API (chatbot)
- Resend (transactional emails)
- VPS (prototype deployments)

---

## Free Prototype Deliverable

**What we build for each user (24-48 hours):**

1. **Clickable React/Next.js prototype:**
   - 3-5 screens based on their core action
   - Mock data that feels real
   - Basic navigation between screens
   - Responsive (mobile-friendly)
   - Deployed to VPS with unique URL

2. **Landing page for their idea:**
   - Hero with headline based on their problem/solution
   - Features section from their must-haves
   - Simple waitlist signup
   - Deployed alongside the prototype

**Scope control:**
- Strictly mock data, no real backend logic
- Max 5 screens/views
- No auth, no database — just clickable UI
- Clear messaging: "This is a prototype to visualize your idea"

**Build process (internal):**
1. Submission arrives with chatbot transcript
2. Team reviews and builds using Claude Code / v0 / manual
3. Deploy to VPS with unique subdomain/path
4. Update submission status to "delivered" and store prototype URL
5. Trigger delivery email with magic link

---

## Upsell & Email Flow

### Touchpoints

1. **Delivery email:**
   - Subject: "Your prototype is ready!"
   - Magic link to view prototype
   - Screenshot/preview
   - Soft pitch: "Love it? We can build the full MVP for $950"
   - CTA → `/mvp?email=[prefilled]`

2. **Inside prototype:**
   - Persistent banner: "This is a free prototype with mock data. Ready for the real thing?"
   - CTA: "Build My MVP — $950" → `/mvp`

3. **Follow-up sequence:**
   - Day 2: "Have you shared your prototype yet?"
   - Day 5: "3 founders who went from prototype to MVP" (social proof)
   - Day 10: Final nudge with urgency or bonus

### Email Infrastructure

- Supabase Edge Functions + Resend, or
- Store email queue in DB, trigger via Vercel cron

### Tracking

- UTM/query params to track conversion source
- Store which touchpoint converted with MVP submissions

---

## Summary

| Component | Details |
|-----------|---------|
| **Offer** | Free clickable React/Next.js prototype + landing page |
| **Scarcity** | 10 spots/day, live counter on site |
| **Capture** | Name, email, one-liner → reserves spot |
| **Qualification** | Chatbot (Claude) asks 5-8 brainstorming questions |
| **Auth** | Magic links only, no passwords |
| **Delivery** | 24-48 hours, deployed to VPS, URL stored in DB |
| **Upsell** | Email on delivery, banner in prototype, follow-up sequence |
| **Direct sales** | `/mvp` page for ad traffic and warm leads |

---

## Next Steps

1. Set up Supabase project and schema
2. Build free prototype landing page (`/`)
3. Implement chatbot component with Claude streaming
4. Move existing content to `/mvp`
5. Build magic link routes (`/prototype/[token]`, `/chat/[token]`)
6. Set up email sending with Resend
7. Create internal workflow for building/deploying prototypes
