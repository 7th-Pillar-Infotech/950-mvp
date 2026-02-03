"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = 'mvp_submitted';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'guerrillamail.org',
  'mailinator.com', 'maildrop.cc', 'throwaway.email', 'fakeinbox.com',
  'trashmail.com', 'tempinbox.com', '10minutemail.com', '10minutemail.net',
  'minutemail.com', 'dispostable.com', 'mailnesia.com', 'tempail.com',
  'tempr.email', 'discard.email', 'discardmail.com', 'spamgourmet.com',
  'mytrashmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net',
  'spam4.me', 'grr.la', 'mailexpire.com', 'meltmail.com', 'yopmail.com',
  'yopmail.fr', 'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc', 'nomail.xl.cx',
  'mega.zik.dj', 'speed.1s.fr', 'courriel.fr.nf', 'moncourrier.fr.nf',
  'monemail.fr.nf', 'monmail.fr.nf', 'getnada.com', 'tempmailo.com',
  'emailondeck.com', 'tempmailaddress.com', 'burnermail.io', 'mailsac.com',
  'inboxkitten.com', 'emailfake.com', 'fakemailgenerator.com', 'mohmal.com',
  'tempsky.com', 'trashinbox.com', 'dropmail.me', 'instantemailaddress.com',
  'crazymailing.com', 'throwawaymail.com', 'getairmail.com', 'mailcatch.com',
  'tmail.ws', 'tmpmail.org', 'tmpmail.net', 'tempmails.net', 'disposablemail.com',
];

const THINKING_MESSAGES = [
  "Getting ready...",
  "Nice to meet you...",
  "Interesting...",
  "Understanding your vision...",
  "Thinking about the product...",
  "Considering options...",
  "Mapping out features...",
  "Almost there...",
];

const PROJECTS = [
  {
    name: "Ownsy",
    description: "Fractional real estate investment platform with tokenized property ownership",
    category: "Proptech",
    url: "https://ownsy.netlify.app/",
    screenshot: "/screenshots/ownsy.jpg",
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
  },
  {
    name: "FurnishVision",
    description: "AI-powered home decor e-commerce with room visualization",
    category: "E-commerce",
    url: "https://furnishvision.netlify.app/",
    screenshot: "/screenshots/furnishvision.jpg",
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/30",
  },
  {
    name: "Villiers",
    description: "Private jet charter marketplace with instant booking",
    category: "Luxury Travel",
    url: "https://villiers-redesign.netlify.app/",
    screenshot: "/screenshots/villiers.jpg",
    color: "from-blue-500/20 to-indigo-500/20",
    borderColor: "border-blue-500/30",
  },
  {
    name: "Melodist",
    description: "Music distribution platform for independent artists",
    category: "Music Tech",
    url: "https://upwork-music-distribution-platform.vercel.app/",
    screenshot: "/screenshots/melodist.jpg",
    color: "from-violet-500/20 to-purple-500/20",
    borderColor: "border-violet-500/30",
  },
  {
    name: "Mod Society",
    description: "Live music gig management for musicians and venues",
    category: "Event Management",
    url: "https://mod-society-mock.vercel.app/admin/dashboard",
    screenshot: "/screenshots/modsociety.jpg",
    color: "from-pink-500/20 to-rose-500/20",
    borderColor: "border-pink-500/30",
  },
  {
    name: "yd.io",
    description: "Creator economy platform for digital artists",
    category: "Creator Economy",
    url: "https://yd-io.vercel.app/",
    screenshot: "/screenshots/ydio.jpg",
    color: "from-cyan-500/20 to-teal-500/20",
    borderColor: "border-cyan-500/30",
  },
];

export default function MVPPage() {
  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [waitingForEmailValidation, setWaitingForEmailValidation] = useState(false);

  const [chatMessages, setChatMessages] = useState<Array<{ role: "assistant" | "user"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [mvpSpotsRemaining, setMvpSpotsRemaining] = useState(5);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchMvpSpots = useCallback(async () => {
    try {
      const res = await fetch('/api/spots/mvp');
      const data = await res.json();
      setMvpSpotsRemaining(data.spots_remaining);
    } catch (err) {
      console.error('Error fetching MVP spots:', err);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchMvpSpots();
    const submitted = localStorage.getItem(STORAGE_KEY);
    if (submitted) {
      // Expire after 24 hours so returning visitors aren't permanently blocked
      const timestamp = parseInt(submitted, 10);
      const isExpired = !isNaN(timestamp) && Date.now() - timestamp > 24 * 60 * 60 * 1000;
      if (submitted === 'true' || !isExpired) {
        setAlreadySubmitted(true);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [fetchMvpSpots]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, streamingText]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedProject !== null) {
        setSelectedProject(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedProject]);

  useEffect(() => {
    if (started || selectedProject !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [started, selectedProject]);

  const startConversation = async () => {
    setStarted(true);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat/mvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], action: 'start' }),
      });

      const data = await res.json();
      setChatMessages([{ role: "assistant", content: data.message }]);
    } catch {
      setChatMessages([{
        role: "assistant",
        content: "Hey there! 👋 I'm here to help you get started with your $950 MVP.\n\nLet's chat about what you're looking to build. **What's your name?**"
      }]);
    }
    setIsTyping(false);
  };

  const sendMessage = useCallback(async (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping || waitingForEmailValidation) return;

    // Check if the bot just asked for an email (last assistant message contains "email")
    const lastAssistant = chatMessages.filter(m => m.role === "assistant").pop();
    const botAskedForEmail = lastAssistant?.content.toLowerCase().includes("email");
    const looksLikeEmail = trimmedInput.includes('@');

    if (botAskedForEmail && looksLikeEmail) {
      if (!EMAIL_REGEX.test(trimmedInput)) {
        setChatMessages([
          ...chatMessages,
          { role: "user", content: trimmedInput },
          { role: "assistant", content: "Hmm, that doesn't look like a valid email address. Could you double-check it?\n\n**What's your email?**" }
        ]);
        return;
      }

      const emailDomain = trimmedInput.toLowerCase().split('@')[1];
      if (DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain)) {
        setChatMessages([
          ...chatMessages,
          { role: "user", content: trimmedInput },
          { role: "assistant", content: "We don't accept temporary or disposable email addresses. Please use your real email so we can follow up with you!\n\n**What's your email?**" }
        ]);
        return;
      }
    }

    const newMessages = [...chatMessages, { role: "user" as const, content: trimmedInput }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsTyping(true);
    setStreamingText("");
    setMessageCount(prev => prev + 1);

    try {
      const res = await fetch('/api/chat/mvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          leadId,
        }),
      });

      // Handle rate limit or ban errors
      if (res.status === 429 || res.status === 403) {
        await handleApiError(res, newMessages);
        setStreamingText("");
        setIsTyping(false);
        return;
      }

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'text') {
                fullText += data.content;
                setStreamingText(fullText);
              } else if (data.type === 'message_done') {
                setChatMessages([...newMessages, { role: "assistant", content: fullText }]);
                setStreamingText("");
                setIsTyping(false);
                setTimeout(() => inputRef.current?.focus(), 50);
              } else if (data.type === 'done') {
                if (data.leadCreated && data.leadId) {
                  setLeadId(data.leadId);
                }

                if (data.email) {
                  setUserEmail(data.email);
                }

                if (data.isComplete) {
                  setIsComplete(true);
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 3000);
                  localStorage.setItem(STORAGE_KEY, Date.now().toString());
                  setAlreadySubmitted(true);

                  // Decrement monthly spots
                  fetch('/api/spots/mvp', { method: 'POST' })
                    .then(res => res.json())
                    .then(spotData => {
                      if (spotData.spots_remaining !== undefined) {
                        setMvpSpotsRemaining(spotData.spots_remaining);
                      }
                    })
                    .catch(() => {});
                }
              } else if (data.type === 'error') {
                setChatMessages([
                  ...newMessages,
                  { role: "assistant", content: "Sorry, I had a hiccup. Could you try that again?" }
                ]);
                setStreamingText("");
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      console.error('Stream error:', err);
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." }
      ]);
      setStreamingText("");
      setIsTyping(false);
    }
  }, [chatMessages, isTyping, waitingForEmailValidation, leadId]);

  // Handle rate limit/ban errors
  const handleApiError = async (res: Response, newMessages: Array<{ role: "assistant" | "user"; content: string }>) => {
    if (res.status === 429) {
      const data = await res.json();
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: `Whoa, slow down! ${data.error || "Too many messages too quickly."} Please wait a moment before trying again.` }
      ]);
      return true;
    }
    if (res.status === 403) {
      const data = await res.json();
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: data.error || "You have been temporarily blocked. Please try again later." }
      ]);
      return true;
    }
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(chatInput);
  };

  const handleQuickReply = (num: number) => {
    sendMessage(num.toString());
  };

  const getNumberedOptions = () => {
    if (chatMessages.length === 0) return null;
    const lastAssistant = chatMessages.filter(m => m.role === "assistant").pop();
    if (!lastAssistant) return null;

    const matches = lastAssistant.content.match(/^[1-5]\.\s+.+$/gm);
    if (matches && matches.length >= 2) {
      return matches.map((m, i) => ({
        num: i + 1,
        text: m.replace(/^[1-5]\.\s+/, '').trim()
      }));
    }
    return null;
  };

  const numberedOptions = getNumberedOptions();
  const thinkingMessage = THINKING_MESSAGES[Math.min(messageCount, THINKING_MESSAGES.length - 1)];

  const getUserInitial = () => {
    const firstUserMsg = chatMessages.find(m => m.role === "user");
    if (firstUserMsg && chatMessages.indexOf(firstUserMsg) === 1) {
      return firstUserMsg.content.trim()[0]?.toUpperCase() || "U";
    }
    return "U";
  };

  const renderText = (text: string) => {
    // Escape HTML entities first to prevent XSS
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    // Then apply markdown formatting on the safe string
    return escaped
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-amber-400 hover:text-amber-300">$1</a>');
  };

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Confetti */}
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

      {/* Header - only show when not in chat */}
      {!started && (
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
            <a
              href="/free-prototype"
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2"
            >
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/20 border border-emerald-500/30 rounded">Free</span>
              Get a Prototype
            </a>
            <a
              href="https://7thpillar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Our Agency
            </a>
            <button
              onClick={startConversation}
              className="text-sm font-medium px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-background rounded-lg transition-all shadow-md shadow-amber-500/20"
            >
              Get Started
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted hover:text-foreground transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-md">
            <nav className="flex flex-col p-4 space-y-4">
              <a
                href="/free-prototype"
                className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/20 border border-emerald-500/30 rounded">Free</span>
                Get a Prototype
              </a>
              <a
                href="https://7thpillar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Our Agency
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  startConversation();
                }}
                className="text-sm font-medium px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-background rounded-lg transition-all shadow-md shadow-amber-500/20 w-full"
              >
                Get Started
              </button>
            </nav>
          </div>
        )}
      </header>
      )}

      {!started ? (
      <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 pt-24 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-amber-950/20" />

        {/* Animated orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(245, 158, 11, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Geometric accents */}
        <div className="absolute top-20 right-20 w-72 h-72 border border-amber-500/20 rotate-45 animate-spin-slow" />
        <div className="absolute top-24 right-24 w-64 h-64 border border-amber-500/10 rotate-45 animate-spin-slow-reverse" />
        <div className="absolute bottom-32 left-16 w-40 h-40 border-2 border-amber-500/20 rotate-12 animate-pulse" />

        <div className="relative max-w-5xl mx-auto text-center z-10">
          {/* Urgency badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 mb-4 ${mvpSpotsRemaining <= 2 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'} border rounded-full text-sm font-medium transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${mvpSpotsRemaining <= 2 ? 'bg-red-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${mvpSpotsRemaining <= 2 ? 'bg-red-500' : 'bg-amber-500'}`}></span>
            </span>
            {mvpSpotsRemaining > 0
              ? `Only ${mvpSpotsRemaining} spot${mvpSpotsRemaining === 1 ? '' : 's'} left this month`
              : 'Fully booked this month — join the waitlist'}
          </div>

          {/* Eyebrow */}
          <div
            className={`inline-flex items-center gap-3 px-5 py-2.5 mb-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-muted transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="tracking-wide">Web Apps &bull; Mobile &bull; AI Agents &bull; Voice &bull; Automation</span>
          </div>

          {/* Main headline */}
          <h1
            className={`font-serif text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Stop talking about your idea.
            <br />
            <span className="relative inline-block mt-2">
              <span className="italic bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                Start showing it.
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-500/30" viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0 7 Q50 0 100 7 T200 7" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className={`text-xl md:text-2xl text-muted max-w-2xl mx-auto mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            A real, working product — built and delivered in days, not months.
          </p>

          {/* Price callout */}
          <div
            className={`flex items-center justify-center gap-4 mb-12 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/50" />
            <div className="text-center">
              <span className="text-5xl md:text-6xl font-serif font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">$950</span>
              <span className="block text-sm text-muted mt-1">flat. No hourly billing. No surprises.</span>
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/50" />
          </div>

          {/* CTA */}
          <div className={`transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {alreadySubmitted ? (
              <div className="inline-flex flex-col items-center gap-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-8 py-6">
                <div className="flex items-center gap-3 text-emerald-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">You&apos;ve already submitted a request!</span>
                </div>
                <p className="text-muted text-sm text-center max-w-sm">
                  We&apos;re reviewing your submission. Check your email for updates.
                </p>
                <button
                  onClick={() => {
                    localStorage.removeItem(STORAGE_KEY);
                    setAlreadySubmitted(false);
                  }}
                  className="text-sm text-muted hover:text-amber-400 transition-colors underline underline-offset-4"
                >
                  Have another idea? Start a new conversation
                </button>
              </div>
            ) : (
              <button
                onClick={startConversation}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-background font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="relative z-10">Tell Us What You&apos;re Building</span>
                <svg
                  className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          {/* Trust badges */}
          <div className={`mt-16 flex flex-wrap justify-center gap-10 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {[
              { icon: "✓", text: "50+ products shipped" },
              { icon: "⚡", text: "5-10 day delivery" },
              { icon: "🔒", text: "You own 100% of the code" }
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
                <span className="text-amber-500">{badge.icon}</span>
                <span className="text-sm text-muted">{badge.text}</span>
              </div>
            ))}
          </div>

          {/* Free prototype text link */}
          <div className={`mt-6 mb-20 transition-all duration-700 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <a
              href="/free-prototype"
              className="text-sm text-muted hover:text-emerald-400 transition-colors"
            >
              Not sure yet? <span className="underline underline-offset-4">Try a free prototype first</span>
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-muted uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 border-2 border-muted/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-amber-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="relative px-6 py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-amber-500 bg-amber-500/10 rounded-full">
              Our Work
            </span>
            <h2 className="font-serif text-4xl md:text-6xl mb-4">
              Don&apos;t take our word for it.{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                See what we shipped.
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.map((project, i) => (
              <div
                key={i}
                onClick={() => setSelectedProject(i)}
                className={`group relative bg-gradient-to-br ${project.color} border ${project.borderColor} rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
              >
                <div className="aspect-video bg-black/20 border-b border-white/10 overflow-hidden">
                  <img
                    src={project.screenshot}
                    alt={project.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium px-2 py-1 bg-white/10 rounded-full text-muted">
                      {project.category}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl mb-2 group-hover:text-amber-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-muted text-sm mb-4">{project.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-amber-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View details
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Delivered
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Modal */}
      {selectedProject !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedProject(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal content */}
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-white/10 rounded-2xl shadow-2xl animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-sm border border-white/10 rounded-full text-muted hover:text-foreground hover:bg-black/70 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Screenshot */}
            <div className="aspect-video bg-black/30 overflow-hidden rounded-t-2xl">
              <img
                src={PROJECTS[selectedProject].screenshot}
                alt={PROJECTS[selectedProject].name}
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Details */}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium px-3 py-1 bg-white/10 rounded-full text-muted">
                  {PROJECTS[selectedProject].category}
                </span>
                <span className="text-emerald-400 flex items-center gap-1 text-xs">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Delivered
                </span>
              </div>

              <h3 className="font-serif text-3xl md:text-4xl mb-3">
                {PROJECTS[selectedProject].name}
              </h3>
              <p className="text-muted text-lg mb-8">
                {PROJECTS[selectedProject].description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={startConversation}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-background font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/25"
                >
                  Build Something Like This — $950
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <a
                  href={PROJECTS[selectedProject].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/10 rounded-xl text-muted hover:text-foreground hover:border-white/20 transition-all"
                >
                  Visit Live Site
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credibility Section */}
      <section className="relative px-6 py-32 bg-gradient-to-b from-background to-amber-950/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-amber-500 bg-amber-500/10 rounded-full">
              Who We Are
            </span>
            <h2 className="font-serif text-4xl md:text-6xl mb-4">
              Built by a real team.{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
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
                className="text-center p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-amber-500/30 transition-colors"
              >
                <div className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Team members */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-12">
            {[
              { name: "Rashin", role: "CEO & AI Architect", photo: "/team/rashin.png" },
              { name: "Sarath", role: "AI Agents Engineer", photo: "/team/sarath.png" },
              { name: "Smartin", role: "AI App Development", photo: "/team/smartin.png" },
              { name: "Kishan", role: "Voice Agents", photo: "/team/kishan.png" },
              { name: "Abhiram", role: "Full Stack AI Dev", photo: "/team/abhiram.png" },
              { name: "Abin", role: "Backend & AI Infra", photo: "/team/abin.png" },
              { name: "Akbar", role: "AI DevOps", photo: "/team/akbar.png" },
              { name: "Areeb", role: "AI UX Engineer", photo: "/team/areeb.png" },
              { name: "Ritto", role: "AI Data Engineer", photo: "/team/ritto.png" },
              { name: "Sarang", role: "Mobile AI Dev", photo: "/team/sarang.png" },
              { name: "Suma", role: "Product Strategist", photo: "/team/suma.png" },
            ].map((member, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 shadow-lg">
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
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://7thpillar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted hover:text-amber-400 transition-colors text-sm"
            >
              Learn more about 7th Pillar
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="relative px-6 py-32 bg-gradient-to-b from-amber-950/10 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-amber-500 bg-amber-500/10 rounded-full">
              The Problem
            </span>
            <h2 className="font-serif text-4xl md:text-6xl mb-4">
              You&apos;ve probably tried{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                these already
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: "Hire a dev team",
                description: "$10K-50K, 3-6 months, scope creep, missed deadlines. And you still might not get what you actually need.",
                gradient: "from-red-500/20 to-orange-500/20"
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                ),
                title: "DIY with no-code",
                description: "Looks okay at first. Then you hit the wall — can\u2019t customize, can\u2019t scale, looks like every other template out there.",
                gradient: "from-yellow-500/20 to-amber-500/20"
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Do it yourself",
                description: "Weekends turn into months. That side project? Still sitting in a private repo. Life keeps getting in the way.",
                gradient: "from-blue-500/20 to-indigo-500/20"
              }
            ].map((card, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

                <div className="relative z-10">
                  <div className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-muted mb-6 group-hover:text-amber-400 transition-colors">
                    {card.icon}
                  </div>
                  <h3 className="font-serif text-2xl mb-4 group-hover:text-amber-400 transition-colors">{card.title}</h3>
                  <p className="text-muted leading-relaxed">{card.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-2xl md:text-3xl font-serif">
              There&apos;s a{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent italic">faster way.</span>
            </p>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="relative px-6 py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-amber-500 bg-amber-500/10 rounded-full">
              What You Get
            </span>
            <h2 className="font-serif text-4xl md:text-6xl mb-6">
              Pick your format.{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">We&apos;ll build it.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Web App",
                description: "A working app with your core features, user accounts, and a clean design. Ready to demo or test with real users.",
                gradient: "from-blue-500/20 to-cyan-500/20"
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                title: "AI Assistant",
                description: "A smart assistant trained on your content. Answers customer questions, handles support, guides users.",
                gradient: "from-purple-500/20 to-pink-500/20"
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ),
                title: "Voice Agent",
                description: "An AI that talks to your customers — for bookings, support, or qualifying leads.",
                gradient: "from-emerald-500/20 to-teal-500/20"
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ),
                title: "Automation",
                description: "Turn repetitive tasks into autopilot. Social posts, emails, reports — set it up once.",
                gradient: "from-orange-500/20 to-red-500/20"
              }
            ].map((card, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

                <div className="relative z-10">
                  <div className="w-14 h-14 flex items-center justify-center bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 mb-6 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                    {card.icon}
                  </div>
                  <h3 className="font-serif text-2xl mb-4 group-hover:text-amber-400 transition-colors">{card.title}</h3>
                  <p className="text-muted leading-relaxed">{card.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mid-page CTA */}
          <div className="text-center mt-16">
            <button
              onClick={startConversation}
              className="group inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              <span>Ready? Tell us what you&apos;re building</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative px-6 py-32 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-amber-500 bg-amber-500/10 rounded-full">
              How It Works
            </span>
            <h2 className="font-serif text-4xl md:text-6xl">
              Three steps.{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">That&apos;s it.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Tell us your idea",
                description: "2-minute chat, no forms. Just tell us what you\u2019re building.",
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
                <div className="text-7xl font-serif text-amber-500/20 mb-4">
                  {item.step}
                </div>
                <h3 className="font-serif text-2xl mb-3">{item.title}</h3>
                <p className="text-muted text-lg">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Mid-page CTA */}
          <div className="text-center mt-16">
            <button
              onClick={startConversation}
              className="group inline-flex items-center gap-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 font-medium px-8 py-4 rounded-xl transition-all duration-300"
            >
              <span>Start Your $950 MVP</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Side Projects Section */}
      <section className="relative px-6 py-32 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-amber-500 bg-amber-500/10 rounded-full">
              Sound Familiar?
            </span>
            <h2 className="font-serif text-4xl md:text-6xl mb-6">
              Got a side project{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                collecting dust?
              </span>
            </h2>
            <p className="text-muted text-xl max-w-2xl mx-auto">
              That brilliant idea you started months ago. The repo you haven&apos;t touched in weeks.
              The domain you&apos;re still paying for with nothing to show.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* The Problem */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 flex items-center justify-center bg-red-500/10 rounded-xl text-red-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-red-300">The Graveyard</h3>
              </div>
              <ul className="space-y-4 text-muted">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Half-finished projects sitting in private repos</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Great ideas that never made it past the README</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Domains you&apos;re paying for with nothing live</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>&quot;I&apos;ll finish it this weekend&quot; — for 6 months</span>
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 flex items-center justify-center bg-emerald-500/10 rounded-xl text-emerald-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-emerald-300">We Ship It For You</h3>
              </div>
              <ul className="space-y-4 text-muted">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Send us your stalled project — we&apos;ll finish it</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Turn your half-baked idea into a working product</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Finally put something live on that domain</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Go from &quot;someday&quot; to shipped in 5-10 days</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted text-lg mb-6">Stop letting good ideas die in your backlog.</p>
            {!alreadySubmitted && (
              <button
                onClick={startConversation}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-background font-semibold px-8 py-4 text-lg transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105"
              >
                <span>Revive Your Project — $950</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Testimonial + Scale Teaser */}
      <section className="relative px-6 py-32 bg-gradient-to-b from-amber-950/10 to-background">
        <div className="max-w-6xl mx-auto">
          {/* Testimonials */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-amber-500 bg-amber-500/10 rounded-full">
              What Clients Say
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                quote: "I thought I needed $20K and three months. Got a working product for $950 in a week. Validated my idea before burning through my savings.",
                name: "Emmanuel Onate",
                role: "Founder",
              },
              {
                quote: "They took my messy Notion doc and turned it into a real product. The speed was unreal — I was onboarding users within days.",
                name: "Priya Sharma",
                role: "Solo Founder, SaaS",
              },
              {
                quote: "I&apos;d been quoted $15K by agencies. These guys shipped something better for a fraction. Code was clean, handoff was smooth.",
                name: "Marcus Chen",
                role: "Technical Co-founder",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="relative bg-white/[0.02] border border-white/10 rounded-2xl p-8 hover:border-amber-500/30 transition-colors"
              >
                <svg className="w-10 h-10 text-amber-500/20 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <blockquote className="font-serif text-lg italic leading-relaxed mb-6 text-foreground/90">
                  {t.quote}
                </blockquote>
                <cite className="text-muted text-sm not-italic">
                  — {t.name}, {t.role}
                </cite>
              </div>
            ))}
          </div>

          {/* Scale teaser */}
          <div className="mt-24 text-center max-w-2xl mx-auto p-8 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 rounded-2xl border border-amber-500/20">
            <h3 className="font-serif text-2xl mb-4">And when you&apos;re ready to grow...</h3>
            <p className="text-muted text-lg">
              Your $950 MVP isn&apos;t throwaway code. It&apos;s built on a foundation that scales. When you&apos;re ready for the full product — more features, integrations, mobile apps, enterprise — we&apos;re already familiar with your vision. <span className="text-foreground font-medium">Same team. No re-explaining. No starting over.</span>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-24 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl">
              Questions?{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Answered.
              </span>
            </h2>
          </div>

          <div className="space-y-6">
            {[
              { q: "What exactly do I get for $950?", a: "A working product — deployed and live. Depending on what you're building, that's a web app with core features and user accounts, an AI assistant trained on your content, a voice agent, or an automation pipeline. You get the source code, hosting setup, and everything you need to run it." },
              { q: "How long does it take?", a: "5-10 days from the time we kick off. We'll confirm the timeline after our initial chat." },
              { q: "What if my idea is too complex?", a: "We'll tell you upfront. Some ideas need a $950 MVP to validate first. Others genuinely need more. We'll be honest about which yours is — no upselling, no surprises." },
              { q: "Do I own the code?", a: "100%. It's yours. No lock-in, no licensing fees, no recurring charges. Take it, modify it, hand it to another developer — whatever you want." }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-amber-500/30 transition-colors">
                <h3 className="font-medium text-lg mb-3">{item.q}</h3>
                <p className="text-muted">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Prototype Downsell */}
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
                Start with a free working prototype. See what we can do — no commitment, no cost.
              </p>
              <a
                href="/free-prototype"
                className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-background font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105"
              >
                <span>Get a Free Prototype</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="submit" className="relative px-6 py-32">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-4">
            Ready to finally{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              ship it?
            </span>
          </h2>
          <p className="text-muted text-lg mb-4">
            No forms. Just tell us what you&apos;re building.
          </p>
          <p className={`text-sm font-medium mb-10 flex items-center justify-center gap-2 ${mvpSpotsRemaining <= 2 ? 'text-red-400' : 'text-amber-400'}`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${mvpSpotsRemaining <= 2 ? 'bg-red-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${mvpSpotsRemaining <= 2 ? 'bg-red-500' : 'bg-amber-500'}`}></span>
            </span>
            {mvpSpotsRemaining > 0
              ? `Only ${mvpSpotsRemaining} spot${mvpSpotsRemaining === 1 ? '' : 's'} available this month`
              : 'Fully booked this month — join the waitlist'}
          </p>

          {alreadySubmitted ? (
            <div className="inline-flex flex-col items-center gap-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-8 py-6">
              <div className="flex items-center gap-3 text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">You&apos;ve already submitted a request!</span>
              </div>
              <p className="text-muted text-sm text-center max-w-sm">
                We&apos;re reviewing your submission. Check your email for updates within 12 hours.
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  setAlreadySubmitted(false);
                }}
                className="text-sm text-muted hover:text-amber-400 transition-colors underline underline-offset-4"
              >
                Have another idea? Start a new conversation
              </button>
            </div>
          ) : (
            <button
              onClick={startConversation}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-background font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105"
            >
              <span>Get Started — $950</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          )}

          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Reply within 12 hours
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No commitment until you say go
            </span>
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
                href="/free-prototype"
                className="text-muted hover:text-foreground transition-colors text-sm"
              >
                Free Prototype
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
      </>
      ) : (
        /* Full-screen chat */
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          {/* Chat header */}
          <div className="px-6 py-4 border-b border-white/10 flex-shrink-0 bg-card">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setStarted(false);
                    setChatMessages([]);
                    setStreamingText("");
                    setIsTyping(false);
                    setMessageCount(0);
                  }}
                  className="p-2 -ml-2 text-muted hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                  title="Back to home"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-background font-bold shadow-lg shadow-amber-500/30">
                  AI
                </div>
                <div>
                  <div className="font-medium">MVP Consultant</div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
              {/* Price indicator */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400">
                <span className="font-serif font-bold text-lg">$950</span>
                <span className="text-muted text-sm">flat rate</span>
              </div>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-5 md:p-8">
            <div className="max-w-3xl mx-auto space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === "user"
                      ? "bg-amber-500/30 text-amber-400 border border-amber-500/50"
                      : "bg-gradient-to-br from-amber-500 to-orange-500 text-background"
                  }`}>
                    {msg.role === "user" ? getUserInitial() : "AI"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted mb-1 font-medium">
                      {msg.role === "user" ? "You" : "MVP Consultant"}
                    </div>
                    <div className={`rounded-2xl rounded-tl-sm px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-amber-500/15 border border-amber-500/30"
                        : "bg-white/[0.08] border border-white/10"
                    }`}>
                      <div
                        className="whitespace-pre-wrap text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: renderText(msg.content) }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Streaming text */}
              {streamingText && (
                <div className="flex gap-3 items-start animate-fade-in">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-gradient-to-br from-amber-500 to-orange-500 text-background">
                    AI
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted mb-1 font-medium">MVP Consultant</div>
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white/[0.08] border border-white/10">
                      <div
                        className="whitespace-pre-wrap text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: renderText(streamingText) }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {isTyping && !streamingText && (
                <div className="flex gap-3 items-start animate-fade-in">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-gradient-to-br from-amber-500 to-orange-500 text-background">
                    AI
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted mb-1 font-medium">MVP Consultant</div>
                    <div className="bg-white/[0.08] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 inline-flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                      </div>
                      <span className="text-sm text-muted italic">{thinkingMessage}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Success state */}
              {isComplete && !isTyping && (
                <div className="flex justify-center py-8 animate-fade-in">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full text-white shadow-xl shadow-emerald-500/40">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-serif text-2xl mb-2">Got it!</h3>
                    <p className="text-muted text-sm mb-4">
                      We&apos;ll review your requirements and get back to you at <span className="text-foreground font-medium">{userEmail}</span> within 12 hours.
                    </p>
                    <a
                      href="/free-prototype"
                      className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                    >
                      Or try our Free Prototype
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Quick reply buttons */}
          {numberedOptions && !isTyping && !isComplete && (
            <div className="px-4 md:px-6 pb-2 flex-shrink-0">
              <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
                {numberedOptions.map((opt) => (
                  <button
                    key={opt.num}
                    onClick={() => handleQuickReply(opt.num)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-amber-500/10 hover:border-amber-500/30 transition-all text-sm"
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold">
                      {opt.num}
                    </span>
                    <span className="text-muted">{opt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat input */}
          {!isComplete && (
            <form onSubmit={handleSubmit} className="p-4 md:p-6 border-t border-white/10 bg-card flex-shrink-0">
              <div className="max-w-3xl mx-auto flex gap-3">
                <textarea
                  ref={inputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (chatInput.trim() && !isTyping) {
                        sendMessage(chatInput);
                      }
                    }
                  }}
                  placeholder={numberedOptions ? "Or type your answer..." : "Type your message..."}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all placeholder:text-muted/50 resize-none min-h-[48px] max-h-[120px]"
                  autoFocus
                  disabled={isTyping}
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-background px-5 rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center self-end h-[48px]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </main>
  );
}
