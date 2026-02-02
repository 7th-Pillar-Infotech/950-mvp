"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const TOTAL_SPOTS = 10;

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

export default function ConversationalPrototype() {
  const [mounted, setMounted] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState(TOTAL_SPOTS);
  const [totalSpots, setTotalSpots] = useState(TOTAL_SPOTS);
  const [started, setStarted] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [chatMessages, setChatMessages] = useState<Array<{ role: "assistant" | "user"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
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
        content: "Hey there! 👋 I'm excited to help bring your idea to life.\n\nLet's start with the basics. **What's your name?**"
      }]);
    }
    setIsTyping(false);
  };

  // Send message to AI
  const sendMessage = async (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping) return;

    const newMessages = [...chatMessages, { role: "user" as const, content: trimmedInput }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsTyping(true);
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

      const data = await res.json();

      // Handle different response states
      if (data.leadCreated && data.leadId) {
        setLeadId(data.leadId);
        // Decrement spots
        await fetch('/api/spots', { method: 'POST' });
        await fetchSpots();
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
      }

      setChatMessages([...newMessages, { role: "assistant", content: data.message }]);
    } catch {
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, I had a hiccup. Could you try that again?" }
      ]);
    }

    setIsTyping(false);
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
      // First user message is likely their name
      return firstUserMsg.content.trim()[0]?.toUpperCase() || "U";
    }
    return "U";
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

      {!started ? (
        /* Landing view */
        <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-amber-950/20" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl animate-float-delayed" />

          <div className="relative max-w-3xl mx-auto text-center z-10">
            {/* Spots counter */}
            <div className={`mb-10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className={`inline-flex flex-col items-center gap-2 px-8 py-4 rounded-2xl border-2 backdrop-blur-sm ${
                isUrgent
                  ? "bg-red-500/10 border-red-500/50"
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
              </div>
            </div>

            {/* Headline */}
            <h1 className={`font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight mb-6 transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              Get a{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent font-bold">
                FREE
              </span>{" "}
              prototype
              <br />
              <span className="italic bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                in a 2-minute chat.
              </span>
            </h1>

            <p className={`text-xl md:text-2xl text-muted max-w-2xl mx-auto mb-10 transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              No forms. Just a quick conversation with our AI to understand your idea.
            </p>

            {/* CTA */}
            <button
              onClick={startConversation}
              disabled={spotsRemaining <= 0}
              className={`group relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-500 disabled:to-gray-600 text-background font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Start Chatting</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            {/* Agency link */}
            <div className={`mt-12 transition-all duration-700 delay-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
              <a
                href="https://7thpillar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted/70 hover:text-muted transition-colors"
              >
                <span>Built by</span>
                <span className="font-medium text-muted">7th Pillar</span>
              </a>
            </div>
          </div>
        </section>
      ) : (
        /* Full-screen chat */
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          {/* Chat header */}
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
                <div key={i} className="flex gap-3 items-start animate-fade-in">
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
                        dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-amber-400 hover:text-amber-300">$1</a>')
                        }}
                      />
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
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={numberedOptions ? "Or type your answer..." : "Type your message..."}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all placeholder:text-muted/50"
                  autoFocus
                  disabled={isTyping}
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
          )}
        </div>
      )}
    </main>
  );
}
