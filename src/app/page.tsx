import Link from "next/link";
import { Header } from "@/components/Header";
import { StickyCTA } from "@/components/StickyCTA";
import { MvpLeadForm } from "@/components/MvpLeadForm";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { ScrollToFormButton } from "@/components/ScrollToFormButton";

const PROJECTS = [
  {
    name: "BookingOps",
    description:
      "AI-powered operations platform for service businesses — scheduling, dispatch, payments, and customer management in one system with AI route optimization and voice agents.",
    category: "SaaS",
    url: "https://bookingops.buildmatic.ai",
    video:
      "https://db-bookingops.buildmatic.ai/storage/v1/object/public/feature_videos/BookingOpsDemo-preview.mp4",
    color: "from-gray-50 to-white",
    borderColor: "border-gray-200",
  },
  {
    name: "AI-CRM",
    description:
      "Intelligent sales automation that discovers leads from social conversations, generates personalized outreach across email and LinkedIn, and accelerates the entire sales pipeline with AI.",
    category: "Sales Automation",
    url: "https://ai-crm.buildmatic.ai",
    video:
      "https://ai-crm.buildmatic.ai/videos/previews/ai_crm_explainer_preview.mp4",
    color: "from-gray-50 to-white",
    borderColor: "border-gray-200",
  },
];

export default function MVPPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Header */}
      <Header variant="mvp" />

      {/* Sticky CTA */}
      <StickyCTA
        heroSentinelId="hero-sentinel"
        formSectionId="get-started"
        variant="mvp"
        label="Start My $950 MVP"
      />

      {/* ============================================================ */}
      {/* 1. Hero Section                                              */}
      {/* ============================================================ */}
      <section
        id="hero-sentinel"
        className="relative min-h-screen flex items-center justify-center px-6 py-20 pt-24 overflow-hidden"
      >
        {/* Static gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-blue-50" />

        {/* Static ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.15) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center z-10">
          {/* Capacity note */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-blue-600/10 border-blue-600/20 text-blue-600 border rounded-full text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            We take on 3-5 projects per month
          </div>

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 mb-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm text-muted">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="tracking-wide">
              Web Apps &bull; Mobile &bull; AI Agents &bull; Voice &bull;
              Automation
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight mb-8">
            Stop talking about your idea.
            <br />
            <span className="relative inline-block mt-2">
              <span className="italic bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Start showing it.
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-blue-600/30"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 7 Q50 0 100 7 T200 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted max-w-2xl mx-auto mb-6">
            A real, working product — built and delivered in days, not months.
          </p>

          {/* Price callout */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-600/30" />
            <div className="text-center">
              <span className="text-5xl md:text-6xl font-serif font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                $950
              </span>
              <span className="block text-sm text-muted mt-1">
                flat. No hourly billing. No surprises.
              </span>
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-600/30" />
          </div>

          {/* CTA */}
          <div>
            <ScrollToFormButton
              formId="get-started"
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/25 hover:scale-105"
            >
              <span className="relative z-10">Start My $950 MVP</span>
              <svg
                className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </ScrollToFormButton>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap justify-center gap-10">
            {[
              { icon: "12 yrs", text: "12 years shipping products" },
              { icon: "\u2713", text: "50+ products shipped" },
              { icon: "\u26A1", text: "5-10 day delivery" },
              { icon: "\uD83D\uDD12", text: "You own 100% of the code" },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-full"
              >
                <span className="text-blue-600">{badge.icon}</span>
                <span className="text-sm text-muted">{badge.text}</span>
              </div>
            ))}
          </div>

          {/* Free prototype text link */}
          <div className="mt-6 mb-20">
            <Link
              href="/free-prototype"
              className="text-sm text-muted hover:text-emerald-600 transition-colors"
            >
              Not sure yet?{" "}
              <span className="underline underline-offset-4">
                Try a free prototype first
              </span>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-muted uppercase tracking-widest">
            Scroll
          </span>
          <div className="w-6 h-10 border-2 border-muted/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-blue-600 rounded-full" />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. Portfolio Section                                         */}
      {/* ============================================================ */}
      <section id="portfolio" className="relative px-6 py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-blue-600 bg-blue-600/10 rounded-full">
              Our Work
            </span>
            <h2 className="font-serif text-4xl md:text-6xl mb-4">
              Don&apos;t take our word for it.{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                See what we shipped.
              </span>
            </h2>
          </div>

          <PortfolioGrid projects={PROJECTS} />
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. The Problem                                               */}
      {/* ============================================================ */}
      <section className="relative px-6 py-20 bg-gradient-to-b from-background to-blue-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-blue-600 bg-blue-600/10 rounded-full">
              The Problem
            </span>
            <h2 className="font-serif text-4xl md:text-6xl mb-4">
              You&apos;ve probably tried{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                these already
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ),
                title: "Hire a dev team",
                description:
                  "$10K-50K, 3-6 months, scope creep, missed deadlines. And you still might not get what you actually need.",
                gradient: "from-red-500/20 to-orange-500/20",
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                ),
                title: "DIY with no-code",
                description:
                  "Looks okay at first. Then you hit the wall \u2014 can\u2019t customize, can\u2019t scale, looks like every other template out there.",
                gradient: "from-yellow-500/20 to-amber-500/20",
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: "Do it yourself",
                description:
                  "Weekends turn into months. That side project? Still sitting in a private repo. Life keeps getting in the way.",
                gradient: "from-blue-500/20 to-indigo-500/20",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl hover:border-blue-300 transition-all duration-500 hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
                />

                <div className="relative z-10">
                  <div className="w-14 h-14 flex items-center justify-center bg-blue-50 border border-blue-100 rounded-xl text-blue-600 mb-6 group-hover:text-blue-700 transition-colors">
                    {card.icon}
                  </div>
                  <h3 className="font-serif text-2xl mb-4 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-muted leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-2xl md:text-3xl font-serif">
              There&apos;s a{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                faster way.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3b. What You Get                                             */}
      {/* ============================================================ */}
      <section className="relative px-6 py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-blue-600 bg-blue-600/10 rounded-full">
              What You Get
            </span>
            <h2 className="font-serif text-4xl md:text-6xl mb-6">
              Pick your format.{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                We&apos;ll build it.
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                ),
                title: "Web App",
                description:
                  "A working app with your core features, user accounts, and a clean design. Ready to demo or test with real users.",
                gradient: "from-blue-500/20 to-cyan-500/20",
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                ),
                title: "AI Assistant",
                description:
                  "A smart assistant trained on your content. Answers customer questions, handles support, guides users.",
                gradient: "from-purple-500/20 to-pink-500/20",
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                ),
                title: "Voice Agent",
                description:
                  "An AI that talks to your customers \u2014 for bookings, support, or qualifying leads.",
                gradient: "from-emerald-500/20 to-teal-500/20",
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                ),
                title: "Automation",
                description:
                  "Turn repetitive tasks into autopilot. Social posts, emails, reports \u2014 set it up once.",
                gradient: "from-orange-500/20 to-red-500/20",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl hover:border-blue-300 transition-all duration-500 hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
                />

                <div className="relative z-10">
                  <div className="w-14 h-14 flex items-center justify-center bg-blue-50 border border-blue-100 rounded-xl text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                    {card.icon}
                  </div>
                  <h3 className="font-serif text-2xl mb-4 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-muted leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mid-page CTA */}
          <div className="text-center mt-16">
            <ScrollToFormButton
              formId="get-started"
              className="group inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <span>Ready? Tell us what you&apos;re building</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </ScrollToFormButton>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. How It Works                                              */}
      {/* ============================================================ */}
      <section
        id="how-it-works"
        className="relative px-6 py-20 border-t border-gray-200"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-blue-600 bg-blue-600/10 rounded-full">
              How It Works
            </span>
            <h2 className="font-serif text-4xl md:text-6xl">
              Three steps.{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                That&apos;s it.
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Tell us your idea",
                description:
                  "Fill out the form below. Attach a brief if you have one.",
              },
              {
                step: "02",
                title: "We build it",
                description: "Your product, delivered in 5-10 days.",
              },
              {
                step: "03",
                title: "You ship it",
                description: "Deployed, live, ready for users.",
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="text-7xl font-serif text-blue-600/15 mb-4">
                  {item.step}
                </div>
                <h3 className="font-serif text-2xl mb-3">{item.title}</h3>
                <p className="text-muted text-lg">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Mid-page CTA */}
          <div className="text-center mt-16">
            <ScrollToFormButton
              formId="get-started"
              className="group inline-flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 text-blue-600 font-medium px-8 py-4 rounded-xl transition-all duration-300"
            >
              <span>Start Your $950 MVP</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </ScrollToFormButton>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. FAQ                                                       */}
      {/* ============================================================ */}
      <section className="px-6 py-24 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl">
              Questions?{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Answered.
              </span>
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "What exactly do I get for $950?",
                a: "A working product \u2014 deployed and live. Depending on what you\u2019re building, that\u2019s a web app with core features and user accounts, an AI assistant trained on your content, a voice agent, or an automation pipeline. You get the source code, hosting setup, and everything you need to run it.",
              },
              {
                q: "How long does it take?",
                a: "5-10 days from the time we kick off. We\u2019ll confirm the timeline after our initial chat.",
              },
              {
                q: "What if my idea is too complex?",
                a: "We\u2019ll tell you upfront. Some ideas need a $950 MVP to validate first. Others genuinely need more. We\u2019ll be honest about which yours is \u2014 no upselling, no surprises.",
              },
              {
                q: "Do I own the code?",
                a: "100%. It\u2019s yours. No lock-in, no licensing fees, no recurring charges. Take it, modify it, hand it to another developer \u2014 whatever you want.",
              },
              {
                q: "What if I\u2019m not happy with the result?",
                a: "We work with you until you\u2019re satisfied. If we can\u2019t deliver what was scoped, you get a full refund.",
              },
              {
                q: "Is there a contract?",
                a: "No long-term contracts. $950 flat. We scope the work, you approve, we build.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-200 transition-colors"
              >
                <h3 className="font-medium text-lg mb-3">{item.q}</h3>
                <p className="text-muted">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. Lead Form                                                 */}
      {/* ============================================================ */}
      <MvpLeadForm />

      {/* ============================================================ */}
      {/* 7. Team                                                      */}
      {/* ============================================================ */}
      <section
        id="team"
        className="relative px-6 py-20 bg-gradient-to-b from-background to-blue-50/50"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-blue-600 bg-blue-600/10 rounded-full">
              Who We Are
            </span>
            <h2 className="font-serif text-4xl md:text-6xl mb-4">
              Built by a real team.{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Not a solo freelancer.
              </span>
            </h2>
            <p className="text-muted text-xl max-w-2xl mx-auto">
              $950 MVP is a product by 7th Pillar — 12 years shipping products.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: "12", label: "Years in business" },
              { value: "50+", label: "Products shipped" },
              { value: "11", label: "Team members" },
              { value: "5-10", label: "Day delivery" },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-200 transition-colors"
              >
                <div className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Team members - auto-scrolling marquee */}
          <div className="relative overflow-hidden mb-12">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="animate-marquee flex gap-8 w-max">
              {[...Array(2)].map((_, setIndex) =>
                [
                  {
                    name: "Rashin",
                    role: "CEO & AI Architect",
                    photo: "/team/rashin.png",
                  },
                  {
                    name: "Sarath",
                    role: "AI Agents Engineer",
                    photo: "/team/sarath.png",
                  },
                  {
                    name: "Smartin",
                    role: "AI App Development",
                    photo: "/team/smartin.png",
                  },
                  {
                    name: "Kishan",
                    role: "Voice Agents",
                    photo: "/team/kishan.png",
                  },
                  {
                    name: "Abhiram",
                    role: "Full Stack AI Dev",
                    photo: "/team/abhiram.png",
                  },
                  {
                    name: "Abin",
                    role: "Backend & AI Infra",
                    photo: "/team/abin.png",
                  },
                  {
                    name: "Akbar",
                    role: "AI DevOps",
                    photo: "/team/akbar.png",
                  },
                  {
                    name: "Areeb",
                    role: "AI UX Engineer",
                    photo: "/team/areeb.png",
                  },
                  {
                    name: "Ritto",
                    role: "AI Data Engineer",
                    photo: "/team/ritto.png",
                  },
                  {
                    name: "Sarang",
                    role: "Mobile AI Dev",
                    photo: "/team/sarang.png",
                  },
                  {
                    name: "Suma",
                    role: "Product Strategist",
                    photo: "/team/suma.png",
                  },
                ].map((member, i) => (
                  <div
                    key={`${setIndex}-${i}`}
                    className="flex flex-col items-center gap-2 flex-shrink-0"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 shadow-lg">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-sm font-medium">{member.name}</div>
                    <div className="text-xs text-muted">{member.role}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-center">
            <a
              href="https://7thpillar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted hover:text-blue-600 transition-colors text-sm"
            >
              Learn more about 7th Pillar
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. Free Prototype Downsell                                   */}
      {/* ============================================================ */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-10 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                Free
              </span>
              <h3 className="font-serif text-3xl md:text-4xl mb-3">
                Not ready for $950?
              </h3>
              <p className="text-muted text-lg mb-8 max-w-md mx-auto">
                Start with a free working prototype. See what we can do — no
                commitment, no cost.
              </p>
              <Link
                href="/free-prototype"
                className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105"
              >
                <span>Get a Free Prototype</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. Footer                                                    */}
      {/* ============================================================ */}
      <footer className="px-6 py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="font-serif text-2xl">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                $950
              </span>{" "}
              MVP
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/free-prototype"
                className="text-muted hover:text-foreground transition-colors text-sm"
              >
                Free Prototype
              </Link>
              <a
                href="https://7thpillar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground transition-colors text-sm"
              >
                Our Agency
              </a>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
            <div>
              &copy; {new Date().getFullYear()} — Built with precision.
            </div>
            <a
              href="https://7thpillar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <span>A product by</span>
              <span className="font-medium text-foreground">7th Pillar</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
