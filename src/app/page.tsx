"use client";

import { useState, useEffect, useRef } from "react";

// Simulated daily spots (in production, this comes from Supabase)
const TOTAL_SPOTS = 10;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState(7); // Simulated
  const [step, setStep] = useState<"landing" | "form" | "chat" | "complete">("landing");
  const [formData, setFormData] = useState({ name: "", email: "", idea: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "assistant" | "user"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (spotsRemaining <= 0) return;

    setIsSubmitting(true);
    // Simulate API call to reserve spot
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSpotsRemaining((prev) => prev - 1);
    setIsSubmitting(false);
    setStep("chat");

    // Start chatbot conversation
    setTimeout(() => {
      setChatMessages([
        {
          role: "assistant",
          content: `Hey ${formData.name}! 👋 Thanks for claiming your free prototype spot.\n\nYou said: "${formData.idea}"\n\nLet me ask a few questions to make sure we build exactly what you need. First up:\n\n**Who's the main person using this?** (e.g., busy founders, fitness coaches, small business owners, students...)`
        }
      ]);
    }, 500);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const questionIndex = chatMessages.filter((m) => m.role === "assistant").length;
    const responses = [
      `Got it — targeting **${userMessage}**. That helps a lot.\n\nNext question: **What's the ONE thing a user must be able to do for this to be useful?** Think about the core action that makes or breaks the product.`,
      `Perfect. So the core action is about ${userMessage.toLowerCase().includes("book") ? "booking" : userMessage.toLowerCase().includes("track") ? "tracking" : "that key workflow"}.\n\n**Are there any other must-have features for the prototype, or is that core action enough to show the concept?**`,
      `Noted. Last question: **Any apps or websites that have the vibe you're going for?** Could be the visual style, the user experience, or just the overall feel. (Optional — skip if nothing comes to mind)`,
      `This is great context. I've got everything I need.\n\n**Here's what happens next:**\n\n1. Our team reviews your idea (within 2 hours)\n2. We build your clickable prototype + landing page\n3. You get a magic link in your inbox within 24-48 hours\n\nWe'll email you at **${formData.email}** when it's ready. Keep an eye out! 🚀`
    ];

    const responseIndex = Math.min(questionIndex, responses.length - 1);
    setChatMessages((prev) => [...prev, { role: "assistant", content: responses[responseIndex] }]);
    setIsTyping(false);

    if (questionIndex >= responses.length - 1) {
      setTimeout(() => setStep("complete"), 2000);
    }
  };

  const spotPercentage = (spotsRemaining / TOTAL_SPOTS) * 100;
  const isUrgent = spotsRemaining <= 3;

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-amber-950/20" />

        {/* Animated orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl animate-float-delayed" />

        {/* Urgency glow when spots are low */}
        {isUrgent && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
        )}

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(245, 158, 11, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center z-10">
          {/* BIG FREE CALLOUT - THE HERO */}
          <div
            className={`mb-6 transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="inline-block relative">
              <span className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent drop-shadow-2xl">
                FREE
              </span>
              <div className="absolute -top-2 -right-4 md:-right-6">
                <span className="relative flex h-4 w-4 md:h-5 md:w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 md:h-5 md:w-5 bg-emerald-500"></span>
                </span>
              </div>
            </div>
            <div className="mt-2 text-muted text-sm md:text-base">
              No credit card • No commitment • No catch
            </div>
          </div>

          {/* Spots Counter - Clean minimal design */}
          <div
            className={`inline-flex items-center gap-3 mb-10 transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div
              className={`flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-sm ${
                isUrgent
                  ? "bg-red-500/10 border-red-500/40"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-2xl md:text-3xl font-bold font-serif ${
                    isUrgent ? "text-red-400" : "text-amber-400"
                  }`}
                >
                  {spotsRemaining}
                </span>
                <span className="text-muted text-sm">/ {TOTAL_SPOTS}</span>
              </div>
              <span className="text-muted">spots left today</span>
              {isUrgent && (
                <span className="text-red-400 text-sm font-medium animate-pulse">
                  ⚡ Almost gone
                </span>
              )}
            </div>
          </div>

          {/* Main headline */}
          <h1
            className={`font-serif text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight mb-6 transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            See your idea
            <br />
            <span className="relative inline-block mt-2">
              <span className="italic bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                before you build it.
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-amber-500/30"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
              >
                <path d="M0 7 Q50 0 100 7 T200 7" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
          </h1>

          {/* Value proposition */}
          <p
            className={`text-xl md:text-2xl text-muted max-w-2xl mx-auto mb-4 transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Get a <span className="text-foreground font-medium">clickable React prototype</span> +{" "}
            <span className="text-foreground font-medium">landing page</span> for your startup idea.
            <br />
            <span className="text-amber-500 font-semibold">Completely free.</span> Delivered in 24-48 hours.
          </p>

          {/* Supporting text */}
          <p
            className={`text-base text-muted/70 max-w-xl mx-auto mb-10 transition-all duration-700 delay-400 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            We build 10 free prototypes per day to showcase our work. Tell us your idea, answer a few
            questions, and we&apos;ll bring it to life. No strings attached.
          </p>

          {/* FORM / CHAT / COMPLETE STATES */}
          <div
            className={`max-w-xl mx-auto transition-all duration-700 delay-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {step === "landing" && (
              <button
                onClick={() => setStep("form")}
                disabled={spotsRemaining <= 0}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-500 disabled:to-gray-600 text-background font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10">
                  {spotsRemaining > 0 ? "Claim Your Free Prototype" : "All Spots Taken Today"}
                </span>
                {spotsRemaining > 0 && (
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
                )}
              </button>
            )}

            {step === "form" && (
              <form
                onSubmit={handleFormSubmit}
                className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-left"
              >
                <h3 className="font-serif text-2xl mb-6 text-center">
                  Claim your spot <span className="text-amber-500">({spotsRemaining} left)</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2 text-muted">
                      Your name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all placeholder:text-muted/50"
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-muted">
                      Email (for delivery)
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all placeholder:text-muted/50"
                      placeholder="jane@startup.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="idea" className="block text-sm font-medium mb-2 text-muted">
                      Your idea in one line
                    </label>
                    <input
                      type="text"
                      id="idea"
                      required
                      value={formData.idea}
                      onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all placeholder:text-muted/50"
                      placeholder="An app that helps freelancers track invoices"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-background font-semibold rounded-lg px-8 py-4 text-lg transition-all duration-300 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Reserving your spot...
                    </>
                  ) : (
                    <>
                      Reserve My Spot
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </>
                  )}
                </button>
                <p className="text-center text-sm text-muted mt-4">
                  We&apos;ll ask a few quick questions next to understand your idea better.
                </p>
              </form>
            )}

            {step === "chat" && (
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                {/* Chat header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-background font-bold">
                    AI
                  </div>
                  <div>
                    <div className="font-medium">Prototype Assistant</div>
                    <div className="text-xs text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      Online
                    </div>
                  </div>
                </div>

                {/* Chat messages - all left aligned */}
                <div className="h-80 overflow-y-auto p-6 space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="flex justify-start">
                      <div
                        className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-amber-500/20 border border-amber-500/30 text-foreground"
                            : "bg-white/10 text-foreground"
                        }`}
                      >
                        {msg.role === "user" && (
                          <div className="text-xs text-amber-400 font-medium mb-1">You</div>
                        )}
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted rounded-full animate-bounce" />
                          <span
                            className="w-2 h-2 bg-muted rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <span
                            className="w-2 h-2 bg-muted rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat input */}
                <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/10">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your answer..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-muted/50"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isTyping}
                      className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-background px-6 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === "complete" && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-amber-500/10 border border-emerald-500/30 rounded-2xl p-10 text-center">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-emerald-500/20 border-2 border-emerald-500 rounded-full text-emerald-400">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-3xl mb-4">You&apos;re in! 🎉</h3>
                <p className="text-muted text-lg mb-6">
                  We&apos;re building your free prototype now.
                  <br />
                  Check your inbox at <span className="text-amber-500 font-medium">{formData.email}</span> within 24-48 hours.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-muted">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Want the full MVP? <a href="/mvp" className="text-amber-500 hover:underline ml-1">Check out our $950 offer →</a>
                </div>
              </div>
            )}
          </div>

          {/* Trust indicators */}
          {step === "landing" && (
            <div
              className={`mt-16 flex flex-wrap justify-center gap-8 transition-all duration-700 delay-600 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              {[
                { icon: "🎨", text: "Clickable React/Next.js prototype" },
                { icon: "🚀", text: "Landing page included" },
                { icon: "⏱️", text: "Delivered in 24-48 hours" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-muted">
                  <span>{item.icon}</span>
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works - brief */}
      <section className="relative px-6 py-24 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-amber-500 bg-amber-500/10 rounded-full">
              How It Works
            </span>
            <h2 className="font-serif text-3xl md:text-5xl">
              From idea to prototype in{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                3 simple steps
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Claim your spot",
                description: "Enter your name, email, and one-line idea. We only take 10 per day.",
              },
              {
                step: "02",
                title: "Quick chat",
                description: "Our AI asks 4-5 questions to understand your vision. Takes 2 minutes.",
              },
              {
                step: "03",
                title: "Get your prototype",
                description:
                  "Receive a clickable React prototype + landing page via email within 24-48 hours.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-serif text-amber-500/20 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-8 pl-4">
                  <h3 className="font-serif text-xl mb-3">{item.title}</h3>
                  <p className="text-muted">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="relative px-6 py-24 bg-gradient-to-b from-amber-950/10 to-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-amber-500 bg-amber-500/10 rounded-full">
              What You Get
            </span>
            <h2 className="font-serif text-3xl md:text-5xl mb-4">
              A real prototype.{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Not a mockup.
              </span>
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              We don&apos;t do Figma wireframes. You get actual React code deployed to a live URL.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-amber-500/30 transition-colors">
              <div className="w-12 h-12 flex items-center justify-center bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-2xl mb-4">Clickable Prototype</h3>
              <ul className="space-y-3 text-muted">
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">✓</span>
                  3-5 screens with realistic mock data
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">✓</span>
                  Built in React/Next.js (real code)
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">✓</span>
                  Responsive — works on mobile
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">✓</span>
                  Deployed to a live URL you can share
                </li>
              </ul>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-amber-500/30 transition-colors">
              <div className="w-12 h-12 flex items-center justify-center bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-2xl mb-4">Landing Page</h3>
              <ul className="space-y-3 text-muted">
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">✓</span>
                  Hero section with your value prop
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">✓</span>
                  Features section highlighting benefits
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">✓</span>
                  Email capture / waitlist form
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">✓</span>
                  Perfect for gauging interest
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-5xl mb-6">
            Ready to see your idea{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              come to life?
            </span>
          </h2>
          <p className="text-muted text-lg mb-10">
            {spotsRemaining > 0
              ? `Only ${spotsRemaining} spots remaining today. Don't miss out.`
              : "All spots taken for today. Come back tomorrow!"}
          </p>
          <button
            onClick={() => {
              setStep("form");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={spotsRemaining <= 0}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-500 disabled:to-gray-600 text-background font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{spotsRemaining > 0 ? "Claim Your Free Prototype" : "Come Back Tomorrow"}</span>
            {spotsRemaining > 0 && (
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-2"
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
            )}
          </button>

          <div className="mt-12 pt-12 border-t border-white/10">
            <p className="text-muted mb-4">Need more than a prototype?</p>
            <a
              href="/mvp"
              className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium transition-colors"
            >
              Get a full MVP built for $950
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-serif text-2xl">
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              $950
            </span>{" "}
            MVP
          </div>
          <div className="text-sm text-muted">© {new Date().getFullYear()} — Built with precision.</div>
          <a
            href="/mvp"
            className="text-amber-500 hover:text-amber-400 transition-colors font-medium flex items-center gap-2"
          >
            Full MVP Service
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </footer>
    </main>
  );
}
