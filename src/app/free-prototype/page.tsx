"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const TOTAL_SPOTS = 10;
const TOTAL_QUESTIONS = 4;

// Contextual thinking messages based on question number
const THINKING_MESSAGES = [
  "Analyzing your idea...",
  "Understanding your target users...",
  "Mapping out the core features...",
  "Considering design patterns...",
  "Finalizing the prototype scope...",
];

// Qualification options with icons
const STAGE_OPTIONS = [
  {
    value: "idea",
    label: "Just an idea",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    value: "validating",
    label: "Validating",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    value: "building",
    label: "Building",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    value: "launched",
    label: "Launched",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const TIMELINE_OPTIONS = [
  {
    value: "exploring",
    label: "Exploring",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    value: "30days",
    label: "30 days",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: "asap",
    label: "ASAP",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const BUDGET_OPTIONS = [
  {
    value: "0",
    label: "$0",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  {
    value: "under1k",
    label: "<$1k",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: "1k-5k",
    label: "$1-5k",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    value: "5k+",
    label: "$5k+",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

// Screening logic - returns true if qualified
function isQualifiedLead(stage: string, timeline: string, budget: string): boolean {
  // Auto-reject: exploring + no budget
  if (timeline === "exploring" && budget === "0") return false;
  // Auto-reject: just exploring with no real intent
  if (timeline === "exploring" && stage === "idea" && budget === "0") return false;
  // Everyone else passes (for now)
  return true;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState(TOTAL_SPOTS);
  const [totalSpots, setTotalSpots] = useState(TOTAL_SPOTS);
  const [step, setStep] = useState<"landing" | "form" | "chat" | "complete" | "rejected">("landing");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    idea: "",
    stage: "",
    timeline: "",
    budget: "",
  });
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "assistant" | "user"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [chatResponses, setChatResponses] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch spots from API
  const fetchSpots = useCallback(async () => {
    try {
      const res = await fetch('/api/spots');
      const data = await res.json();
      setSpotsRemaining(data.spots_remaining);
      setTotalSpots(data.total_spots);
    } catch (err) {
      console.error('Error fetching spots:', err);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchSpots();
  }, [fetchSpots]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Lock body scroll when modal is open
  useEffect(() => {
    const isModalOpen = step === "form" || step === "chat" || step === "complete" || step === "rejected";
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [step]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (spotsRemaining <= 0) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      // Submit lead to API
      const leadRes = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const leadData = await leadRes.json();

      if (!leadRes.ok) {
        console.error('Error creating lead:', leadData.error);
        setFormError(leadData.error || 'Something went wrong. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setLeadId(leadData.id);

      if (!leadData.qualified) {
        setIsSubmitting(false);
        setStep("rejected");
        return;
      }

      // Qualified - decrement spots via API
      const spotsRes = await fetch('/api/spots', { method: 'POST' });
      const spotsData = await spotsRes.json();

      if (spotsRes.ok) {
        setSpotsRemaining(spotsData.spots_remaining);
      }

      setIsSubmitting(false);
      setStep("chat");
      setIsTyping(true); // Show loading for initial message

      // Start chatbot conversation with AI
      setTimeout(async () => {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [],
              idea: formData.idea,
              name: formData.name,
              email: formData.email,
              leadId: leadData.id,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            setChatMessages([{ role: "assistant", content: data.message }]);
          } else {
            // Fallback to default message
            setChatMessages([
              {
                role: "assistant",
                content: `Hey ${formData.name}! 👋 Thanks for claiming your free prototype spot.\n\nYou said: "${formData.idea}"\n\nLet me ask a few questions to make sure we build exactly what you need. First up:\n\n**Who's the main person using this?** (e.g., busy founders, fitness coaches, small business owners, students...)`
              }
            ]);
          }
        } catch {
          setChatMessages([
            {
              role: "assistant",
              content: `Hey ${formData.name}! 👋 Thanks for claiming your free prototype spot.\n\nYou said: "${formData.idea}"\n\nLet me ask a few questions to make sure we build exactly what you need. First up:\n\n**Who's the main person using this?** (e.g., busy founders, fitness coaches, small business owners, students...)`
            }
          ]);
        } finally {
          setIsTyping(false);
        }
      }, 500);
    } catch (err) {
      console.error('Error submitting form:', err);
      setFormError('Network error. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    const updatedMessages = [...chatMessages, { role: "user" as const, content: userMessage }];
    setChatMessages(updatedMessages);
    setIsTyping(true);

    try {
      // Call Anthropic chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          idea: formData.idea,
          name: formData.name,
          email: formData.email,
          leadId: leadId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add assistant response
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.message }]);

      // Update question number for progress indicator
      const questionCount = updatedMessages.filter((m) => m.role === "user").length;
      setQuestionNumber(Math.min(questionCount + 1, TOTAL_QUESTIONS));

      // Save chat responses to database
      const newResponses = { ...chatResponses, [`response_${questionCount}`]: userMessage };
      setChatResponses(newResponses);

      if (leadId) {
        try {
          await fetch('/api/leads', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: leadId, chat_responses: newResponses }),
          });
        } catch (err) {
          console.error('Error updating lead:', err);
        }
      }

      // Check if conversation is complete
      if (data.isComplete || questionCount >= 4) {
        setTimeout(() => {
          setShowConfetti(true);
          setStep("complete");
          setTimeout(() => setShowConfetti(false), 3000);
        }, 2000);
      }
    } catch (err) {
      console.error('Error in chat:', err);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Let me try again..." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const spotPercentage = (spotsRemaining / totalSpots) * 100;
  const isUrgent = spotsRemaining <= 3;

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="font-serif text-xl">
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              $950
            </span>{" "}
            MVP
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-muted hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#showcase" className="text-sm text-muted hover:text-foreground transition-colors">
              Recent Work
            </a>
            <a
              href="https://7thpillar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Our Agency
            </a>
            <a
              href="/"
              className="text-sm font-medium px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              Full MVP — $950
            </a>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-muted hover:text-foreground transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 pt-24 overflow-hidden">
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

        {/* Confetti effect */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-5%`,
                  backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative max-w-5xl mx-auto text-center z-10">
          {/* Spots Counter - More prominent and urgent */}
          <div
            className={`mb-10 transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div
              className={`inline-flex flex-col items-center gap-2 px-8 py-4 rounded-2xl border-2 backdrop-blur-sm transition-all ${
                isUrgent
                  ? "bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/20"
                  : "bg-amber-500/5 border-amber-500/30"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl md:text-5xl font-bold font-serif tabular-nums ${
                      isUrgent ? "text-red-400" : "text-amber-400"
                    }`}
                  >
                    {spotsRemaining}
                  </span>
                  <span className="text-muted text-lg">/ {TOTAL_SPOTS}</span>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <span className={`text-lg font-medium ${isUrgent ? "text-red-300" : "text-foreground"}`}>
                  spots left today
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isUrgent
                      ? "bg-gradient-to-r from-red-500 to-red-400"
                      : "bg-gradient-to-r from-amber-500 to-amber-400"
                  }`}
                  style={{ width: `${spotPercentage}%` }}
                />
              </div>
              {isUrgent && (
                <span className="text-red-400 text-sm font-medium animate-pulse flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Going fast! Claim yours now
                </span>
              )}
            </div>
          </div>

          {/* Main headline with FREE integrated */}
          <h1
            className={`font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight mb-6 transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Get a{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent font-bold">
                FREE
              </span>
              <span className="absolute -top-1 -right-3 md:-right-4">
                <span className="relative flex h-3 w-3 md:h-4 md:w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 md:h-4 md:w-4 bg-emerald-500"></span>
                </span>
              </span>
            </span>{" "}
            prototype
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
            A <span className="text-foreground font-medium">clickable React prototype</span> +{" "}
            <span className="text-foreground font-medium">landing page</span> for your startup idea.
            <br />
            <span className="text-emerald-400 font-semibold">No credit card. No catch.</span> Delivered in 24-48 hours.
          </p>

          {/* Supporting text */}
          <p
            className={`text-base text-muted/70 max-w-xl mx-auto mb-10 transition-all duration-700 delay-400 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            We build 10 free prototypes per day to showcase our work. Tell us your idea, answer a few
            questions, and we&apos;ll bring it to life.
          </p>

          {/* CTA Button - Always visible on landing */}
          <div
            className={`max-w-xl mx-auto transition-all duration-700 delay-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
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
          </div>

          {/* Trust indicators */}
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

          {/* Agency credibility */}
          <div
            className={`mt-10 transition-all duration-700 delay-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <a
              href="https://7thpillar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted/70 hover:text-muted transition-colors"
            >
              <span>Built by</span>
              <span className="font-medium text-muted">7th Pillar</span>
              <span className="text-muted/50">•</span>
              <span>10+ years building products</span>
              <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* How it works - brief */}
      <section id="how-it-works" className="relative px-6 py-24 border-t border-white/10">
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

      {/* Showcase Section - Previous Prototypes */}
      <section id="showcase" className="relative px-6 py-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-amber-500 bg-amber-500/10 rounded-full">
              Recent Work
            </span>
            <h2 className="font-serif text-3xl md:text-5xl mb-4">
              Prototypes we&apos;ve{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                built this week
              </span>
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Real prototypes for real founders. Here&apos;s what we shipped recently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Ownsy",
                description: "Fractional real estate investment platform with tokenized property ownership in UAE",
                category: "Proptech",
                url: "https://ownsy.netlify.app/",
                screenshot: "/screenshots/ownsy.png",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                color: "from-emerald-500/20 to-teal-500/20",
                borderColor: "border-emerald-500/30",
                iconColor: "text-emerald-400",
              },
              {
                name: "FurnishVision",
                description: "AI-powered home decor e-commerce with room visualization technology",
                category: "E-commerce",
                url: "https://furnishvision.netlify.app/",
                screenshot: "/screenshots/furnishvision.png",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
                color: "from-amber-500/20 to-orange-500/20",
                borderColor: "border-amber-500/30",
                iconColor: "text-amber-400",
              },
              {
                name: "Villiers",
                description: "AI-powered private jet charter marketplace with instant booking and empty leg deals",
                category: "Luxury Travel",
                url: "https://villiers-redesign.netlify.app/",
                screenshot: "/screenshots/villiers.png",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                ),
                color: "from-blue-500/20 to-indigo-500/20",
                borderColor: "border-blue-500/30",
                iconColor: "text-blue-400",
              },
              {
                name: "Melodist",
                description: "Music distribution platform for independent artists with AI-powered tools",
                category: "Music Tech",
                url: "https://upwork-music-distribution-platform.vercel.app/",
                screenshot: "/screenshots/melodist.png",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                ),
                color: "from-violet-500/20 to-purple-500/20",
                borderColor: "border-violet-500/30",
                iconColor: "text-violet-400",
              },
              {
                name: "Mod Society",
                description: "Live music gig management platform for musicians and venue admins",
                category: "Event Management",
                url: "https://mod-society-mock.vercel.app/admin/dashboard",
                screenshot: "/screenshots/modsociety.png",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                color: "from-pink-500/20 to-rose-500/20",
                borderColor: "border-pink-500/30",
                iconColor: "text-pink-400",
              },
              {
                name: "yd.io",
                description: "Creator economy platform enabling digital artists to monetize their work",
                category: "Creator Economy",
                url: "https://yd-io.vercel.app/",
                screenshot: "/screenshots/ydio.png",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
                color: "from-cyan-500/20 to-teal-500/20",
                borderColor: "border-cyan-500/30",
                iconColor: "text-cyan-400",
              },
            ].map((project, i) => (
              <a
                key={i}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative bg-gradient-to-br ${project.color} border ${project.borderColor} rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300`}
              >
                {/* Screenshot preview */}
                <div className="aspect-video bg-black/20 border-b border-white/10 overflow-hidden">
                  <img
                    src={project.screenshot}
                    alt={project.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className={project.iconColor}>{project.icon}</span>
                    <span className="text-xs font-medium px-2 py-1 bg-white/10 rounded-full text-muted">
                      {project.category}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl mb-2 group-hover:text-amber-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-muted text-sm mb-4">{project.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View live
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Delivered
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted mb-4">Yours could be next.</p>
            <button
              onClick={() => setStep("form")}
              disabled={spotsRemaining <= 0}
              className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium transition-colors"
            >
              Get your free prototype
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
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
              href="/"
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
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="font-serif text-2xl">
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                $950
              </span>{" "}
              MVP
            </div>
            <div className="flex items-center gap-6">
              <a
                href="/"
                className="text-muted hover:text-foreground transition-colors text-sm"
              >
                Full MVP Service
              </a>
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
          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
            <div>© {new Date().getFullYear()} — Built with precision.</div>
            <a
              href="https://7thpillar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <span>A product by</span>
              <span className="font-medium text-foreground">7th Pillar</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* MODAL - Full page overlay for form, chat, complete, and rejected */}
      {(step === "form" || step === "chat" || step === "complete" || step === "rejected") && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/95 backdrop-blur-md"
            onClick={() => step === "form" && setStep("landing")}
          />

          {/* Modal container - scrollable for form, full screen for chat */}
          <div className={`${step === "chat" ? "h-full" : "min-h-full flex items-center justify-center p-4 py-8"}`}>
            {/* Modal content */}
            <div className={`relative w-full animate-fade-in-up ${step === "chat" ? "h-full" : "max-w-md"}`}>
              <div className={`bg-card overflow-hidden shadow-2xl shadow-black/50 ${step === "chat" ? "h-full flex flex-col" : "border border-card-border rounded-2xl"}`}>

              {/* === FORM STATE === */}
              {step === "form" && (
                <>
                  {/* Form header with close button */}
                  <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isUrgent ? "text-red-400" : "text-amber-500"}`}>
                        {spotsRemaining} spots left today
                      </span>
                      <div className={`w-2 h-2 rounded-full ${isUrgent ? "bg-red-400" : "bg-amber-500"} animate-pulse`} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep("landing")}
                      className="text-muted hover:text-foreground transition-colors p-1 hover:bg-white/10 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleFormSubmit} className="p-6 md:p-8">
                    <h3 className="font-serif text-2xl mb-2 text-center">
                      Claim your free prototype
                    </h3>
                    <p className="text-center text-muted text-sm mb-6">
                      Fill in your details and we&apos;ll build it for you
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2 text-muted">
                          Your name
                        </label>
                        <input
                          type="text"
                          id="name"
                          required
                          autoFocus
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

                      {/* Qualifying questions - Card selection */}
                      <div className="pt-4 border-t border-white/10 space-y-5">
                        <p className="text-xs text-muted">Help us understand your needs better</p>

                        {/* Stage selection */}
                        <div>
                          <label className="block text-sm font-medium mb-3 text-muted">
                            What stage is your startup?
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {STAGE_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, stage: opt.value })}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                                  formData.stage === opt.value
                                    ? "bg-amber-500/15 border-amber-500/50 text-amber-400"
                                    : "bg-white/5 border-white/10 text-muted hover:bg-white/10 hover:border-white/20"
                                }`}
                              >
                                <span className={formData.stage === opt.value ? "text-amber-400" : "text-muted"}>
                                  {opt.icon}
                                </span>
                                <span className="text-xs font-medium">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Timeline selection */}
                        <div>
                          <label className="block text-sm font-medium mb-3 text-muted">
                            How soon do you want to launch?
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {TIMELINE_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, timeline: opt.value })}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                                  formData.timeline === opt.value
                                    ? "bg-amber-500/15 border-amber-500/50 text-amber-400"
                                    : "bg-white/5 border-white/10 text-muted hover:bg-white/10 hover:border-white/20"
                                }`}
                              >
                                <span className={formData.timeline === opt.value ? "text-amber-400" : "text-muted"}>
                                  {opt.icon}
                                </span>
                                <span className="text-xs font-medium">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Budget selection */}
                        <div>
                          <label className="block text-sm font-medium mb-3 text-muted">
                            Budget for full MVP (if you love the prototype)?
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {BUDGET_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, budget: opt.value })}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                                  formData.budget === opt.value
                                    ? "bg-amber-500/15 border-amber-500/50 text-amber-400"
                                    : "bg-white/5 border-white/10 text-muted hover:bg-white/10 hover:border-white/20"
                                }`}
                              >
                                <span className={formData.budget === opt.value ? "text-amber-400" : "text-muted"}>
                                  {opt.icon}
                                </span>
                                <span className="text-xs font-medium">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {formError && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                        {formError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-background font-semibold rounded-lg px-8 py-4 text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-amber-500/25"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Reserving your spot...
                        </>
                      ) : (
                        <>
                          Reserve My Spot
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </>
                      )}
                    </button>

                    <p className="text-center text-sm text-muted mt-4">
                      We&apos;ll ask a few quick questions next to understand your idea better.
                    </p>
                  </form>
                </>
              )}

              {/* === CHAT STATE === */}
              {step === "chat" && (
                <div className="flex flex-col h-full">
                  {/* Chat header with progress */}
                  <div className="px-6 py-4 border-b border-white/10 flex-shrink-0 bg-card">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-background font-bold shadow-lg shadow-amber-500/30">
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
                      {/* Progress indicator */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">Q{Math.min(questionNumber, TOTAL_QUESTIONS)}/{TOTAL_QUESTIONS}</span>
                        <div className="flex gap-1">
                          {[...Array(TOTAL_QUESTIONS)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full transition-all ${
                                i < questionNumber ? "bg-amber-500" : "bg-white/20"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="max-w-3xl mx-auto mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500 rounded-full"
                        style={{ width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Chat messages - LEFT ALIGNED TEXT */}
                  <div className="flex-1 overflow-y-auto p-5 md:p-8">
                    <div className="max-w-3xl mx-auto space-y-4">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className="flex gap-3 items-start animate-fade-in">
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                          msg.role === "user"
                            ? "bg-amber-500/30 text-amber-400 border border-amber-500/50"
                            : "bg-gradient-to-br from-amber-500 to-orange-500 text-background"
                        }`}>
                          {msg.role === "user" ? formData.name.charAt(0).toUpperCase() : "AI"}
                        </div>
                        {/* Message bubble */}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted mb-1 font-medium text-left">
                            {msg.role === "user" ? "You" : "Prototype Assistant"}
                          </div>
                          <div
                            className={`rounded-2xl rounded-tl-sm px-4 py-3 text-left ${
                              msg.role === "user"
                                ? "bg-amber-500/15 border border-amber-500/30"
                                : "bg-white/[0.08] border border-white/10"
                            }`}
                          >
                            <div className="whitespace-pre-wrap text-sm leading-relaxed text-left">{msg.content}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-3 items-start animate-fade-in">
                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-gradient-to-br from-amber-500 to-orange-500 text-background">
                          AI
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted mb-1 font-medium text-left">Prototype Assistant</div>
                          <div className="bg-white/[0.08] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 inline-flex items-center gap-3">
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                            </div>
                            <span className="text-sm text-muted italic">
                              {THINKING_MESSAGES[Math.min(questionNumber - 1, THINKING_MESSAGES.length - 1)]}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                    </div>
                  </div>

                  {/* Chat input */}
                  <form onSubmit={handleChatSubmit} className="p-4 md:p-6 border-t border-white/10 bg-card flex-shrink-0">
                    <div className="max-w-3xl mx-auto flex gap-3">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type your answer..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all placeholder:text-muted/50"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim() || isTyping}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-background px-5 rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* === COMPLETE STATE === */}
              {step === "complete" && (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full text-white shadow-xl shadow-emerald-500/40">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <h3 className="font-serif text-3xl mb-2">You&apos;re in!</h3>
                  <p className="text-emerald-400 font-medium mb-6">Spot #{TOTAL_SPOTS - spotsRemaining} of {TOTAL_SPOTS} claimed</p>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 text-left">
                    <p className="text-sm text-muted mb-3 text-center">We&apos;re building your prototype now. Expect it in your inbox:</p>
                    <div className="flex items-center justify-center gap-3 text-foreground">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <p className="text-xs text-muted mt-2 text-center">Within 24-48 hours</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-muted">While you wait, check out our full MVP service</p>
                    <a
                      href="/"
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-background font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 hover:scale-105"
                    >
                      <span>Explore $950 Full MVP</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>

                  <button
                    onClick={() => setStep("landing")}
                    className="mt-6 text-sm text-muted hover:text-foreground transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* === REJECTED STATE === */}
              {step === "rejected" && (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 rounded-full text-amber-500">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>

                  <h3 className="font-serif text-2xl mb-3">Not the right fit — yet</h3>
                  <p className="text-muted mb-6 max-w-sm mx-auto">
                    Our free prototypes are designed for founders who are ready to move fast. It sounds like you&apos;re still in the early exploration phase.
                  </p>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 text-left">
                    <p className="text-sm font-medium text-foreground mb-3">Here&apos;s what we recommend:</p>
                    <ul className="space-y-2 text-sm text-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">1.</span>
                        <span>Validate your idea with potential customers first</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">2.</span>
                        <span>Come back when you&apos;re ready to build in 30 days or less</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">3.</span>
                        <span>Consider our full MVP service if you need hands-on guidance</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <a
                      href="/"
                      className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium transition-colors"
                    >
                      Learn about our $950 MVP service
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>

                  <button
                    onClick={() => setStep("landing")}
                    className="mt-6 text-sm text-muted hover:text-foreground transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      )}
    </main>
  );
}
