"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const TOTAL_SPOTS = 10;
const STORAGE_KEY = 'free_prototype_submitted';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Common disposable email domains
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

// Thinking messages that rotate based on message count
const THINKING_MESSAGES = [
  "Getting ready...",
  "Nice to meet you...",
  "Interesting...",
  "Understanding your vision...",
  "Thinking about the product...",
  "Mapping out features...",
  "Considering the design...",
  "Almost there...",
  "Wrapping things up...",
];

export default function FreePrototype() {
  const [mounted, setMounted] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState(TOTAL_SPOTS);
  const [totalSpots, setTotalSpots] = useState(TOTAL_SPOTS);
  const [started, setStarted] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

    // Check if user has already submitted
    const submitted = localStorage.getItem(STORAGE_KEY);
    if (submitted) {
      setAlreadySubmitted(true);
    }
  }, [fetchSpots]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, streamingText]);

  // Lock body scroll when chat is open
  useEffect(() => {
    if (started) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [started]);

  // Start the conversation
  const startConversation = async () => {
    setStarted(true);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat/conversational', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], action: 'start' }),
      });

      const data = await res.json();
      setChatMessages([{ role: "assistant", content: data.message }]);
    } catch {
      setChatMessages([{
        role: "assistant",
        content: "Hey there! 👋 I'm excited to help bring your idea to life with a free prototype.\n\nLet's start with the basics. **What's your name?**"
      }]);
    }
    setIsTyping(false);
  };

  // Send message with streaming
  const sendMessage = async (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping || waitingForEmailValidation) return;

    // Check if this looks like an email (second user message after name)
    const userMessageCount = chatMessages.filter(m => m.role === "user").length;
    const isEmailEntry = userMessageCount === 1 && trimmedInput.includes('@');

    if (isEmailEntry) {
      // Validate email format
      if (!EMAIL_REGEX.test(trimmedInput)) {
        setChatMessages([
          ...chatMessages,
          { role: "user", content: trimmedInput },
          { role: "assistant", content: "Hmm, that doesn't look like a valid email address. Could you double-check it?\n\n**What's your email?**" }
        ]);
        return;
      }

      // Check for disposable email
      const emailDomain = trimmedInput.toLowerCase().split('@')[1];
      if (DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain)) {
        setChatMessages([
          ...chatMessages,
          { role: "user", content: trimmedInput },
          { role: "assistant", content: "We don't accept temporary or disposable email addresses. Please use your real email so we can send you the prototype! 📧\n\n**What's your email?**" }
        ]);
        return;
      }

      // Check if email already exists or too many from same domain
      setWaitingForEmailValidation(true);
      try {
        const checkRes = await fetch('/api/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedInput }),
        });
        const checkData = await checkRes.json();

        if (checkData.exists) {
          setChatMessages([
            ...chatMessages,
            { role: "user", content: trimmedInput },
            { role: "assistant", content: "It looks like you've already submitted a prototype request with this email. 📧\n\nWe're working on it! Check your inbox (and spam folder) for updates. If you haven't received anything in 48 hours, reach out to us.\n\nWant to explore our **[$950 full MVP service](/)** instead?" }
          ]);
          setAlreadySubmitted(true);
          localStorage.setItem(STORAGE_KEY, 'true');
          setWaitingForEmailValidation(false);
          return;
        }

        if (checkData.domainLimitReached) {
          setChatMessages([
            ...chatMessages,
            { role: "user", content: trimmedInput },
            { role: "assistant", content: "We've reached our limit for submissions from this email domain. This helps us ensure fair access for everyone.\n\nPlease use a different email address, or check out our **[$950 full MVP service](/)** for unlimited access.\n\n**What's your email?**" }
          ]);
          setWaitingForEmailValidation(false);
          return;
        }
      } catch (err) {
        console.error('Error checking email:', err);
      }
      setWaitingForEmailValidation(false);
    }

    const newMessages = [...chatMessages, { role: "user" as const, content: trimmedInput }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsTyping(true);
    setStreamingText("");
    setMessageCount(prev => prev + 1);

    try {
      const res = await fetch('/api/chat/conversational', {
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
                // Message streaming complete - finalize UI immediately
                setChatMessages([...newMessages, { role: "assistant", content: fullText }]);
                setStreamingText("");
                setIsTyping(false);
                // Focus input after a short delay
                setTimeout(() => inputRef.current?.focus(), 50);
              } else if (data.type === 'done') {
                // Handle metadata (runs after parsing)
                if (data.leadCreated && data.leadId) {
                  setLeadId(data.leadId);
                  // Decrement spots
                  fetch('/api/spots', { method: 'POST' }).then(() => fetchSpots());
                }

                if (data.email) {
                  setUserEmail(data.email);
                }

                if (data.rejected) {
                  setIsRejected(true);
                }

                if (data.isComplete) {
                  setIsComplete(true);
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 3000);
                  // Save to localStorage to prevent re-entry
                  localStorage.setItem(STORAGE_KEY, 'true');
                  setAlreadySubmitted(true);
                }
              } else if (data.type === 'error') {
                setChatMessages([
                  ...newMessages,
                  { role: "assistant", content: "Sorry, I had a hiccup. Could you try that again?" }
                ]);
                setStreamingText("");
              }
            } catch {
              // Ignore parse errors for incomplete chunks
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
  };

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

  // Quick reply buttons for numbered options
  const handleQuickReply = (num: number) => {
    sendMessage(num.toString());
  };

  // Check if last message has numbered options
  const getNumberedOptions = () => {
    if (chatMessages.length === 0) return null;
    const lastAssistant = chatMessages.filter(m => m.role === "assistant").pop();
    if (!lastAssistant) return null;

    // Look for numbered options pattern (1. Option, 2. Option, etc.)
    const matches = lastAssistant.content.match(/^[1-4]\.\s+.+$/gm);
    if (matches && matches.length >= 2) {
      return matches.map((m, i) => ({
        num: i + 1,
        text: m.replace(/^[1-4]\.\s+/, '').trim()
      }));
    }
    return null;
  };

  const numberedOptions = getNumberedOptions();
  const isUrgent = spotsRemaining <= 3;
  const showDone = isComplete || isRejected;

  // Get thinking message based on message count
  const thinkingMessage = THINKING_MESSAGES[Math.min(messageCount, THINKING_MESSAGES.length - 1)];

  // Extract user's name from conversation for avatar
  const getUserInitial = () => {
    const firstUserMsg = chatMessages.find(m => m.role === "user");
    if (firstUserMsg && chatMessages.indexOf(firstUserMsg) === 1) {
      return firstUserMsg.content.trim()[0]?.toUpperCase() || "U";
    }
    return "U";
  };

  // Render markdown-style text
  const renderText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-amber-400 hover:text-amber-300">$1</a>');
  };

  return (
    <main className="min-h-screen overflow-x-hidden">
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
              <a href="#how-it-works" className="text-sm text-muted hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#showcase" className="text-sm text-muted hover:text-foreground transition-colors">
                Showcase
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
                className="text-sm font-medium px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors"
              >
                $950 MVP Service
              </a>
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
                  href="#how-it-works"
                  className="text-sm text-muted hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </a>
                <a
                  href="#showcase"
                  className="text-sm text-muted hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Showcase
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
                <a
                  href="/"
                  className="text-sm font-medium px-4 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  $950 MVP Service
                </a>
              </nav>
            </div>
          )}
        </header>
      )}

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

      {!started ? (
        <>
        {/* Landing view */}
        <section className="relative min-h-screen flex items-center justify-center px-6 py-20 pt-24 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-amber-950/20" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl animate-float-delayed" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(245, 158, 11, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.3) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative max-w-4xl mx-auto text-center z-10">
            {/* Spots counter */}
            <div className={`mb-10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className={`inline-flex flex-col items-center gap-2 px-8 py-4 rounded-2xl border-2 backdrop-blur-sm ${
                isUrgent
                  ? "bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/20"
                  : "bg-amber-500/5 border-amber-500/30"
              }`}>
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl md:text-5xl font-bold font-serif tabular-nums ${isUrgent ? "text-red-400" : "text-amber-400"}`}>
                      {spotsRemaining}
                    </span>
                    <span className="text-muted text-lg">/ {totalSpots}</span>
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
                    style={{ width: `${(spotsRemaining / totalSpots) * 100}%` }}
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

            {/* Headline - Problem */}
            <h1 className={`font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight mb-6 transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              Got a startup idea{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent italic">
                  stuck in your head?
                </span>
              </span>
            </h1>

            {/* Agitation */}
            <p className={`text-xl md:text-2xl text-muted max-w-2xl mx-auto mb-4 transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              You know it could work. But between everything going on and figuring out where to start — it just sits there.{" "}
              <span className="text-foreground">Weeks turn into months.</span> Meanwhile, someone else might be building the same thing.
            </p>

            {/* Solution */}
            <p className={`text-lg text-muted/90 max-w-xl mx-auto mb-10 transition-all duration-700 delay-400 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              Get a{" "}
              <span className="text-emerald-400 font-semibold">free working prototype</span> of your idea.
              Something you can click around, share with friends, investors, or potential customers.{" "}
              <span className="text-foreground font-medium">See if it has legs — before you go all in.</span>
            </p>

            {/* CTA */}
            <div className={`transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              {alreadySubmitted ? (
                <div className="inline-flex flex-col items-center gap-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-8 py-6">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">You&apos;ve already submitted a request!</span>
                  </div>
                  <p className="text-muted text-sm text-center max-w-sm">
                    We&apos;re working on your prototype. Check your email for updates within 24-48 hours.
                  </p>
                  <a
                    href="/"
                    className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium text-sm transition-colors"
                  >
                    Explore $950 Full MVP Service
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              ) : (
                <button
                  onClick={startConversation}
                  disabled={spotsRemaining <= 0}
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-500 disabled:to-gray-600 text-background font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{spotsRemaining > 0 ? "Start Chatting — It's Free" : "All Spots Taken Today"}</span>
                  {spotsRemaining > 0 && (
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {/* Trust indicators */}
            <p className={`mt-6 text-sm text-muted/70 transition-all duration-700 delay-600 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              No credit card. No catch. Just a 2-minute chat about your idea.
            </p>

            {/* Agency link */}
            <div className={`mt-10 transition-all duration-700 delay-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
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
              </a>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="relative px-6 py-24 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-amber-500 bg-amber-500/10 rounded-full">
                How It Works
              </span>
              <h2 className="font-serif text-3xl md:text-5xl">
                Here&apos;s how it works
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Tell us your idea",
                  description: "Just chat with us for 2 minutes. No forms, no jargon. Explain it like you would to a friend.",
                },
                {
                  step: "02",
                  title: "We build it overnight",
                  description: "Our team turns your idea into something real. Screens you can click. A page that explains what you're building.",
                },
                {
                  step: "03",
                  title: "Check your inbox",
                  description: "Within 24-48 hours, you'll have a working prototype + landing page. Yours to keep, share, and test.",
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
                This isn&apos;t a mockup.{" "}
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  It&apos;s the real thing.
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-amber-500/30 transition-colors">
                <div className="w-12 h-12 flex items-center justify-center bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl mb-4">Working Prototype</h3>
                <ul className="space-y-3 text-muted">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">✓</span>
                    Screens that actually work (not just pictures)
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">✓</span>
                    Built with real code you can keep
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">✓</span>
                    Works on your phone too
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">✓</span>
                    Live link you can send to anyone
                  </li>
                </ul>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-amber-500/30 transition-colors">
                <div className="w-12 h-12 flex items-center justify-center bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl mb-4">Landing Page</h3>
                <ul className="space-y-3 text-muted">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">✓</span>
                    Explains your idea clearly
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">✓</span>
                    Captures emails from interested people
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">✓</span>
                    Helps you test if anyone actually cares
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">✓</span>
                    Looks legit (not some sketchy template)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Showcase Section */}
        <section id="showcase" className="relative px-6 py-24 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-amber-500 bg-amber-500/10 rounded-full">
                Recent Work
              </span>
              <h2 className="font-serif text-3xl md:text-5xl mb-4">
                Here&apos;s what we built{" "}
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  this week
                </span>
              </h2>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                Real prototypes for real founders. Not mockups. Not wireframes. Working stuff.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Ownsy",
                  description: "Fractional real estate investment platform with tokenized property ownership",
                  category: "Proptech",
                  url: "https://ownsy.netlify.app/",
                  screenshot: "/screenshots/ownsy.png",
                  color: "from-emerald-500/20 to-teal-500/20",
                  borderColor: "border-emerald-500/30",
                },
                {
                  name: "FurnishVision",
                  description: "AI-powered home decor e-commerce with room visualization",
                  category: "E-commerce",
                  url: "https://furnishvision.netlify.app/",
                  screenshot: "/screenshots/furnishvision.png",
                  color: "from-amber-500/20 to-orange-500/20",
                  borderColor: "border-amber-500/30",
                },
                {
                  name: "Villiers",
                  description: "Private jet charter marketplace with instant booking",
                  category: "Luxury Travel",
                  url: "https://villiers-redesign.netlify.app/",
                  screenshot: "/screenshots/villiers.png",
                  color: "from-blue-500/20 to-indigo-500/20",
                  borderColor: "border-blue-500/30",
                },
                {
                  name: "Melodist",
                  description: "Music distribution platform for independent artists",
                  category: "Music Tech",
                  url: "https://upwork-music-distribution-platform.vercel.app/",
                  screenshot: "/screenshots/melodist.png",
                  color: "from-violet-500/20 to-purple-500/20",
                  borderColor: "border-violet-500/30",
                },
                {
                  name: "Mod Society",
                  description: "Live music gig management for musicians and venues",
                  category: "Event Management",
                  url: "https://mod-society-mock.vercel.app/admin/dashboard",
                  screenshot: "/screenshots/modsociety.png",
                  color: "from-pink-500/20 to-rose-500/20",
                  borderColor: "border-pink-500/30",
                },
                {
                  name: "yd.io",
                  description: "Creator economy platform for digital artists",
                  category: "Creator Economy",
                  url: "https://yd-io.vercel.app/",
                  screenshot: "/screenshots/ydio.png",
                  color: "from-cyan-500/20 to-teal-500/20",
                  borderColor: "border-cyan-500/30",
                },
              ].map((project, i) => (
                <a
                  key={i}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative bg-gradient-to-br ${project.color} border ${project.borderColor} rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300`}
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
              {!alreadySubmitted && (
                <button
                  onClick={startConversation}
                  disabled={spotsRemaining <= 0}
                  className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium transition-colors"
                >
                  Get your free prototype
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative px-6 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-5xl mb-6">
              Your idea deserves more than{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                a notes app
              </span>
            </h2>
            <p className="text-muted text-lg mb-10">
              {spotsRemaining > 0
                ? `Stop describing it. Start showing it. ${spotsRemaining} spots left today.`
                : "All spots taken for today. Come back tomorrow!"}
            </p>
            {alreadySubmitted ? (
              <div className="inline-flex items-center gap-3 text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">You&apos;ve already submitted a request!</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  startConversation();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={spotsRemaining <= 0}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-500 disabled:to-gray-600 text-background font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{spotsRemaining > 0 ? "Start Chatting — It's Free" : "Come Back Tomorrow"}</span>
                {spotsRemaining > 0 && (
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                )}
              </button>
            )}

            <div className="mt-12 pt-12 border-t border-white/10">
              <p className="text-muted mb-4">Need more than a prototype?</p>
              <a
                href="/"
                className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium transition-colors"
              >
                Get a full MVP built for $950
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
                <a href="/" className="text-muted hover:text-foreground transition-colors text-sm">
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
              <div>© {new Date().getFullYear()} — We&apos;ve been doing this for 10+ years.</div>
              <a
                href="https://7thpillar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <span>Built by</span>
                <span className="font-medium text-foreground">7th Pillar</span>
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
                  <div className="font-medium">Prototype Assistant</div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
              {/* Spots indicator */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                isUrgent ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
              }`}>
                <span className="font-bold">{spotsRemaining}</span>
                <span className="text-muted">spots left</span>
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
                      {msg.role === "user" ? "You" : "Prototype Assistant"}
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
                    <div className="text-xs text-muted mb-1 font-medium">Prototype Assistant</div>
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white/[0.08] border border-white/10">
                      <div
                        className="whitespace-pre-wrap text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: renderText(streamingText) }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Typing indicator (only when not streaming) */}
              {isTyping && !streamingText && (
                <div className="flex gap-3 items-start animate-fade-in">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-gradient-to-br from-amber-500 to-orange-500 text-background">
                    AI
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted mb-1 font-medium">Prototype Assistant</div>
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
                    <h3 className="font-serif text-2xl mb-2">You&apos;re all set!</h3>
                    <p className="text-muted text-sm mb-4">
                      We&apos;ll send your prototype to <span className="text-foreground font-medium">{userEmail}</span> within 24-48 hours.
                    </p>
                    <a
                      href="/"
                      className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium"
                    >
                      Explore $950 Full MVP
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

          {/* Quick reply buttons for numbered options */}
          {numberedOptions && !isTyping && !showDone && (
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
          {!showDone && (
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
