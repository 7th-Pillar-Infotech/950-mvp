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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
    const submitted = localStorage.getItem(STORAGE_KEY);
    if (submitted) {
      setAlreadySubmitted(true);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, streamingText]);

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

    const userMessageCount = chatMessages.filter(m => m.role === "user").length;
    const isEmailEntry = userMessageCount === 1 && trimmedInput.includes('@');

    if (isEmailEntry) {
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
          { role: "assistant", content: "We don't accept temporary or disposable email addresses. Please use your real email so we can follow up with you! 📧\n\n**What's your email?**" }
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
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-amber-400 hover:text-amber-300">$1</a>');
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
          <button className="md:hidden p-2 text-muted hover:text-foreground transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
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
          {/* Eyebrow */}
          <div
            className={`inline-flex items-center gap-3 px-5 py-2.5 mb-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-muted transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="tracking-wide">Web • Mobile • AI Agents • Voice • Automation</span>
          </div>

          {/* Main headline */}
          <h1
            className={`font-serif text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Yes, AI can build your MVP.
            <br />
            <span className="relative inline-block mt-2">
              <span className="italic bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                We make sure it&apos;s worth building.
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-500/30" viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0 7 Q50 0 100 7 T200 7" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
          </h1>

          {/* Price callout */}
          <div
            className={`flex items-center justify-center gap-4 mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/50" />
            <span className="text-5xl md:text-6xl font-serif font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">$950</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/50" />
          </div>

          {/* Subheadline */}
          <p
            className={`text-xl md:text-2xl text-muted max-w-2xl mx-auto mb-4 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            A scalable, investor-ready MVP built by people who&apos;ve seen what succeeds and what flops.
          </p>

          {/* Supporting text */}
          <p
            className={`text-base md:text-lg text-muted/80 max-w-xl mx-auto mb-12 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Tools like Claude and Lovable let anyone generate code. But code isn&apos;t a product. We bring the business acumen, architecture decisions, and product thinking that turns your idea into something that actually works — and grows.
          </p>

          {/* CTA */}
          <div className={`transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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
              </div>
            ) : (
              <button
                onClick={startConversation}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-background font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="relative z-10">Start Chatting — $950</span>
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
            <p className="mt-5 text-sm text-muted">
              Tell us what you&apos;re building. We&apos;ll reply within <span className="text-amber-500 font-medium">12 hours</span>.
            </p>
          </div>

          {/* Trust badges */}
          <div className={`mt-20 flex flex-wrap justify-center gap-10 transition-all duration-700 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {[
              { icon: "✓", text: "50+ MVPs launched" },
              { icon: "⚡", text: "5-10 day delivery" },
              { icon: "🔒", text: "You own 100% of the code" }
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
                <span className="text-amber-500">{badge.icon}</span>
                <span className="text-sm text-muted">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-muted uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 border-2 border-muted/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-amber-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="relative px-6 py-32 overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-amber-500 bg-amber-500/10 rounded-full">
              What You Get
            </span>
            <h2 className="font-serif text-4xl md:text-6xl mb-6">
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">$950</span> buys you clarity
            </h2>
            <p className="text-muted text-xl max-w-xl mx-auto">
              Four proven MVP formats. Pick one, tell us your idea, and we&apos;ll build it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Web App MVP",
                description: "A working app with 1-2 core features, user auth, and a clean database structure. Ready to demo to investors or test with real users.",
                gradient: "from-blue-500/20 to-cyan-500/20"
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                title: "AI Assistant / Chatbot",
                description: "A custom AI trained on your content — answers questions, handles support, or guides users. Powered by RAG so it actually knows your stuff.",
                gradient: "from-purple-500/20 to-pink-500/20"
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ),
                title: "Voice Agent",
                description: "Conversational AI that talks to your customers — for bookings, support, or lead qualification. One focused use case, fully functional.",
                gradient: "from-emerald-500/20 to-teal-500/20"
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ),
                title: "Content Automation",
                description: "Auto-generate social posts, emails, blog drafts, or marketing copy from your inputs. Set up once, produce endlessly.",
                gradient: "from-orange-500/20 to-red-500/20"
              }
            ].map((card, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-1"
              >
                {/* Hover gradient */}
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

          {/* Honesty differentiator */}
          <div className="mt-28 max-w-3xl mx-auto">
            <div className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-amber-500 before:to-orange-500 before:rounded-full">
              <h3 className="font-serif text-3xl md:text-4xl mb-8">
                <span className="italic text-muted">&ldquo;Why not just use AI tools yourself?&rdquo;</span>
              </h3>
              <p className="text-muted text-lg mb-8">
                You could. And for some people, that&apos;s the right call. But here&apos;s what we&apos;ve learned building 50+ MVPs:
              </p>
              <ul className="space-y-5 text-lg">
                {[
                  { bold: "Code isn't the hard part anymore", rest: "— knowing what to build is." },
                  { bold: "Most MVPs fail because of bad product decisions", rest: ", not bad code." },
                  { bold: "Scaling a prototype is painful", rest: " if the foundation is wrong." }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5">
                      <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    </span>
                    <span>
                      <strong className="text-foreground">{item.bold}</strong>
                      <span className="text-muted">{item.rest}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-lg text-foreground font-medium">
                We don&apos;t just build. We advise. We challenge your assumptions. We help you avoid the mistakes we&apos;ve seen sink other founders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative px-6 py-32 bg-gradient-to-b from-amber-950/10 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-amber-500 bg-amber-500/10 rounded-full">
              Case Studies
            </span>
            <h2 className="font-serif text-4xl md:text-6xl mb-4">
              Built to Validate.{" "}
              <span className="italic bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Architected to Scale.
              </span>
            </h2>
            <p className="text-muted text-xl">Real MVPs. Real outcomes.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { type: "Web App", title: "FinTech Dashboard MVP", desc: "A founder needed to demo a financial analytics tool to investors. We built a working dashboard with real-time data visualization in 5 days.", result: "Raised seed round 3 weeks later" },
              { type: "Mobile App", title: "On-Demand Service App", desc: "A small business owner wanted to test if customers would book through an app. MVP launched, validated the concept quickly.", result: "200 bookings in first month" },
              { type: "AI Chatbot", title: "Customer Support AI", desc: "A store owner was drowning in repetitive questions. We built a RAG-powered assistant trained on their product catalog.", result: "Support tickets dropped 40%" },
              { type: "Automation", title: "Content Engine for a Coach", desc: "A business coach needed consistent social content but hated writing. We built a pipeline that turns voice notes into posts.", result: "LinkedIn, emails, tweets — all automated" }
            ].map((item, i) => (
              <div key={i} className="group relative p-8 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.05] hover:border-amber-500/30 transition-all duration-300">
                <div className="absolute top-6 right-6 px-3 py-1 text-xs text-muted uppercase tracking-wider bg-white/5 rounded-full">
                  {item.type}
                </div>
                <h3 className="font-serif text-xl mb-4 pr-24">{item.title}</h3>
                <p className="text-muted mb-6">{item.desc}</p>
                <div className="flex items-center gap-2 text-amber-500 text-sm font-medium">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{item.result}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-20 max-w-3xl mx-auto text-center">
            <div className="relative inline-block">
              <svg className="absolute -top-8 -left-8 w-16 h-16 text-amber-500/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <blockquote className="font-serif text-2xl md:text-3xl italic leading-relaxed mb-8">
                I thought I needed $20K and three months. I got a working prototype for $950 in a week. Validated my idea before burning through my savings.
              </blockquote>
            </div>
            <cite className="text-muted not-italic">— Early-stage Founder</cite>
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

      {/* CTA Section */}
      <section id="submit" className="relative px-6 py-32">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-amber-500 bg-amber-500/10 rounded-full">
            Get Started
          </span>
          <h2 className="font-serif text-4xl md:text-5xl mb-4">
            Ready to Build?{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Let&apos;s Chat.
            </span>
          </h2>
          <p className="text-muted text-lg mb-10">
            No forms. No lengthy proposals. Just a quick conversation about your idea.
            <br />We&apos;ll reply within <span className="text-amber-500 font-medium">12 hours</span>.
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
            </div>
          ) : (
            <button
              onClick={startConversation}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-background font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Start Chatting — $950</span>
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
              { q: "What if my idea is too complex for $950?", a: "We'll tell you. Some ideas need a $950 MVP to validate first. Others need more. We'll be honest about which yours is." },
              { q: "How long does it take?", a: "Most MVPs are delivered within 5-10 days depending on complexity." },
              { q: "What tech do you use?", a: "Modern, scalable stack — React, Next.js, Python, cloud infrastructure. Built to grow with you." },
              { q: "Do I own the code?", a: "100%. It's yours. No lock-in, no licensing fees." }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-amber-500/30 transition-colors">
                <h3 className="font-medium text-lg mb-3">{item.q}</h3>
                <p className="text-muted">{item.a}</p>
              </div>
            ))}
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
