"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    idea: "",
    mvpType: "",
    goal: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission - replace with actual form handling
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Geometric accent */}
        <div className="absolute top-20 right-10 w-64 h-64 border border-card-border rotate-45 opacity-20" />
        <div className="absolute bottom-40 left-10 w-32 h-32 border border-accent/30 rotate-12" />

        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="animate-on-load animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 mb-8 border border-card-border rounded-full text-sm text-muted">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span>Web • Mobile • AI Agents • Voice • Automation</span>
          </div>

          {/* Main headline */}
          <h1 className="animate-on-load animate-fade-in-up delay-100 font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight mb-6">
            Yes, AI can build your MVP.{" "}
            <span className="italic text-accent">We make sure it&apos;s worth building.</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-on-load animate-fade-in-up delay-200 text-xl md:text-2xl text-muted max-w-2xl mx-auto mb-4">
            <span className="text-foreground font-semibold">$950</span> — A scalable, investor-ready MVP built by people who&apos;ve seen what succeeds and what flops.
          </p>

          {/* Supporting text */}
          <p className="animate-on-load animate-fade-in-up delay-300 text-base md:text-lg text-muted max-w-xl mx-auto mb-10">
            Tools like Claude and Lovable let anyone generate code. But code isn&apos;t a product. We bring the business acumen, architecture decisions, and product thinking that turns your idea into something that actually works — and grows.
          </p>

          {/* CTA */}
          <div className="animate-on-load animate-fade-in-up delay-400">
            <a
              href="#submit"
              className="group inline-flex items-center gap-3 bg-accent hover:bg-accent-hover text-background font-semibold px-8 py-4 text-lg transition-all duration-300 hover:gap-5 animate-pulse-glow"
            >
              Submit Your Idea — $950
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <p className="mt-4 text-sm text-muted">
              Tell us what you&apos;re building. We&apos;ll reply within 12 hours.
            </p>
          </div>

          {/* Trust badges */}
          <div className="animate-on-load animate-fade-in-up delay-500 mt-16 flex flex-wrap justify-center gap-8 text-sm text-muted">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>50+ MVPs launched</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>5-10 day delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>You own 100% of the code</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="px-6 py-24 border-t border-card-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl mb-4">
              What <span className="text-accent">$950</span> Gets You
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Four proven MVP formats. Pick one, tell us your idea, and we&apos;ll build it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1: Web App */}
            <div className="group relative bg-card border border-card-border p-8 hover:border-accent/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/10 to-transparent" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center border border-accent/50 text-accent shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-2xl mb-3 group-hover:text-accent transition-colors">Web App MVP</h3>
                  <p className="text-muted leading-relaxed">
                    A working app with 1-2 core features, user auth, and a clean database structure. Ready to demo to investors or test with real users.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: AI Chatbot */}
            <div className="group relative bg-card border border-card-border p-8 hover:border-accent/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/10 to-transparent" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center border border-accent/50 text-accent shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-2xl mb-3 group-hover:text-accent transition-colors">AI Assistant / Chatbot</h3>
                  <p className="text-muted leading-relaxed">
                    A custom AI trained on your content — answers questions, handles support, or guides users. Powered by RAG so it actually knows your stuff.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Voice Agent */}
            <div className="group relative bg-card border border-card-border p-8 hover:border-accent/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/10 to-transparent" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center border border-accent/50 text-accent shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-2xl mb-3 group-hover:text-accent transition-colors">Voice Agent</h3>
                  <p className="text-muted leading-relaxed">
                    Conversational AI that talks to your customers — for bookings, support, or lead qualification. One focused use case, fully functional.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4: Content Automation */}
            <div className="group relative bg-card border border-card-border p-8 hover:border-accent/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/10 to-transparent" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center border border-accent/50 text-accent shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-2xl mb-3 group-hover:text-accent transition-colors">Content Automation</h3>
                  <p className="text-muted leading-relaxed">
                    Auto-generate social posts, emails, blog drafts, or marketing copy from your inputs. Set up once, produce endlessly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Honesty differentiator */}
          <div className="mt-20 max-w-3xl mx-auto">
            <div className="border-l-2 border-accent pl-8">
              <h3 className="font-serif text-2xl md:text-3xl mb-6 italic">
                &ldquo;Why not just use AI tools yourself?&rdquo;
              </h3>
              <p className="text-muted text-lg mb-6">
                You could. And for some people, that&apos;s the right call. But here&apos;s what we&apos;ve learned building 50+ MVPs:
              </p>
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">—</span>
                  <span><strong className="text-foreground">Code isn&apos;t the hard part anymore</strong> — knowing what to build is.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">—</span>
                  <span><strong className="text-foreground">Most MVPs fail because of bad product decisions</strong>, not bad code.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">—</span>
                  <span><strong className="text-foreground">Scaling a prototype is painful</strong> if the foundation is wrong.</span>
                </li>
              </ul>
              <p className="mt-6 text-lg text-foreground">
                We don&apos;t just build. We advise. We challenge your assumptions. We help you avoid the mistakes we&apos;ve seen sink other founders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="px-6 py-24 bg-card border-y border-card-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl mb-4">
              Built to Validate. <span className="text-accent italic">Architected to Scale.</span>
            </h2>
            <p className="text-muted text-lg">
              Real MVPs. Real outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Example 1 */}
            <div className="relative p-8 border border-card-border bg-background hover:border-accent/30 transition-colors">
              <div className="absolute top-4 right-4 text-xs text-muted uppercase tracking-wider">Web App</div>
              <h3 className="font-serif text-xl mb-3">FinTech Dashboard MVP</h3>
              <p className="text-muted mb-4">
                A founder needed to demo a financial analytics tool to investors. We built a working dashboard with real-time data visualization in 5 days.
              </p>
              <div className="flex items-center gap-2 text-accent text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Raised seed round 3 weeks later</span>
              </div>
            </div>

            {/* Example 2 */}
            <div className="relative p-8 border border-card-border bg-background hover:border-accent/30 transition-colors">
              <div className="absolute top-4 right-4 text-xs text-muted uppercase tracking-wider">Mobile App</div>
              <h3 className="font-serif text-xl mb-3">On-Demand Service App</h3>
              <p className="text-muted mb-4">
                A small business owner wanted to test if customers would book through an app. MVP launched, validated the concept quickly.
              </p>
              <div className="flex items-center gap-2 text-accent text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>200 bookings in first month</span>
              </div>
            </div>

            {/* Example 3 */}
            <div className="relative p-8 border border-card-border bg-background hover:border-accent/30 transition-colors">
              <div className="absolute top-4 right-4 text-xs text-muted uppercase tracking-wider">AI Chatbot</div>
              <h3 className="font-serif text-xl mb-3">Customer Support AI</h3>
              <p className="text-muted mb-4">
                A store owner was drowning in repetitive questions. We built a RAG-powered assistant trained on their product catalog.
              </p>
              <div className="flex items-center gap-2 text-accent text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Support tickets dropped 40%</span>
              </div>
            </div>

            {/* Example 4 */}
            <div className="relative p-8 border border-card-border bg-background hover:border-accent/30 transition-colors">
              <div className="absolute top-4 right-4 text-xs text-muted uppercase tracking-wider">Automation</div>
              <h3 className="font-serif text-xl mb-3">Content Engine for a Coach</h3>
              <p className="text-muted mb-4">
                A business coach needed consistent social content but hated writing. We built a pipeline that turns voice notes into posts.
              </p>
              <div className="flex items-center gap-2 text-accent text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>LinkedIn, emails, tweets — all automated</span>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-16 max-w-2xl mx-auto text-center">
            <blockquote className="font-serif text-2xl md:text-3xl italic leading-relaxed mb-6">
              &ldquo;I thought I needed $20K and three months. I got a working prototype for $950 in a week. Validated my idea before burning through my savings.&rdquo;
            </blockquote>
            <cite className="text-muted not-italic">— Early-stage Founder</cite>
          </div>

          {/* Scale teaser */}
          <div className="mt-20 text-center max-w-2xl mx-auto">
            <h3 className="font-serif text-2xl mb-4">And when you&apos;re ready to grow...</h3>
            <p className="text-muted text-lg">
              Your $950 MVP isn&apos;t throwaway code. It&apos;s built on a foundation that scales. When you&apos;re ready for the full product — more features, integrations, mobile apps, enterprise — we&apos;re already familiar with your vision. Same team. No re-explaining. No starting over.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="submit" className="px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl mb-4">
              Ready to Build? <span className="text-accent">Tell Us Your Idea.</span>
            </h2>
            <p className="text-muted text-lg">
              No calls. No lengthy proposals. Just tell us what you&apos;re thinking, and we&apos;ll reply within 12 hours.
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-16 border border-accent/50 bg-accent/5">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border-2 border-accent text-accent">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl mb-3">Got it. We&apos;ll be in touch.</h3>
              <p className="text-muted">
                Expect a reply within 12 hours with a few clarifying questions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-card border border-card-border px-4 py-3 focus:outline-none focus:border-accent transition-colors"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-card border border-card-border px-4 py-3 focus:outline-none focus:border-accent transition-colors"
                    placeholder="jane@startup.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="idea" className="block text-sm font-medium mb-2">
                  What&apos;s your idea?
                </label>
                <textarea
                  id="idea"
                  required
                  rows={4}
                  value={formData.idea}
                  onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                  className="w-full bg-card border border-card-border px-4 py-3 focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Describe what you want to build in a few sentences. Don't worry about technical details — that's our job."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="mvpType" className="block text-sm font-medium mb-2">
                    What type of MVP?
                  </label>
                  <select
                    id="mvpType"
                    required
                    value={formData.mvpType}
                    onChange={(e) => setFormData({ ...formData, mvpType: e.target.value })}
                    className="w-full bg-card border border-card-border px-4 py-3 focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select one...</option>
                    <option value="web">Web App</option>
                    <option value="chatbot">AI Chatbot</option>
                    <option value="voice">Voice Agent</option>
                    <option value="automation">Content Automation</option>
                    <option value="not-sure">Not Sure</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="goal" className="block text-sm font-medium mb-2">
                    What&apos;s the goal?
                  </label>
                  <select
                    id="goal"
                    required
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="w-full bg-card border border-card-border px-4 py-3 focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select one...</option>
                    <option value="validate">Validate an idea</option>
                    <option value="demo">Demo for investors</option>
                    <option value="automate">Automate something</option>
                    <option value="side-project">Launch a side project</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-background font-semibold px-8 py-4 text-lg transition-all duration-300 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit — $950 to Start
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>

              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted">
                <span>✓ Reply within 12 hours</span>
                <span>✓ No commitment until you say go</span>
                <span>✓ Payment after we align on scope</span>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-24 border-t border-card-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-12">
            Questions? <span className="text-accent">Answered.</span>
          </h2>

          <div className="space-y-8">
            <div className="border-b border-card-border pb-8">
              <h3 className="font-medium text-lg mb-3">What if my idea is too complex for $950?</h3>
              <p className="text-muted">
                We&apos;ll tell you. Some ideas need a $950 MVP to validate first. Others need more. We&apos;ll be honest about which yours is.
              </p>
            </div>

            <div className="border-b border-card-border pb-8">
              <h3 className="font-medium text-lg mb-3">How long does it take?</h3>
              <p className="text-muted">
                Most MVPs are delivered within 5-10 days depending on complexity.
              </p>
            </div>

            <div className="border-b border-card-border pb-8">
              <h3 className="font-medium text-lg mb-3">What tech do you use?</h3>
              <p className="text-muted">
                Modern, scalable stack — React, Next.js, Python, cloud infrastructure. Built to grow with you.
              </p>
            </div>

            <div className="pb-8">
              <h3 className="font-medium text-lg mb-3">Do I own the code?</h3>
              <p className="text-muted">
                100%. It&apos;s yours. No lock-in, no licensing fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-card-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-serif text-xl">
            <span className="text-accent">$950</span> MVP
          </div>
          <div className="text-sm text-muted">
            © {new Date().getFullYear()} — Built with precision.
          </div>
          <a
            href="#submit"
            className="text-accent hover:text-accent-hover transition-colors font-medium"
          >
            Submit Your Idea →
          </a>
        </div>
      </footer>
    </main>
  );
}
