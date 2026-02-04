"use client";

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = 'mvp_submitted';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/png',
  'image/jpeg',
];
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg'];

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

const PROJECTS = [
  {
    name: "BookingOps",
    description: "AI-powered operations platform for service businesses — scheduling, dispatch, payments, and customer management in one system with AI route optimization and voice agents.",
    category: "SaaS",
    url: "https://bookingops.buildmatic.ai",
    video: "https://db-bookingops.buildmatic.ai/storage/v1/object/public/feature_videos/BookingOpsDemo-preview.mp4",
    color: "from-blue-500/20 to-indigo-500/20",
    borderColor: "border-blue-500/30",
  },
  {
    name: "AI-CRM",
    description: "Intelligent sales automation that discovers leads from social conversations, generates personalized outreach across email and LinkedIn, and accelerates the entire sales pipeline with AI.",
    category: "Sales Automation",
    url: "https://ai-crm.buildmatic.ai",
    video: "https://ai-crm.buildmatic.ai/videos/previews/ai_crm_explainer_preview.mp4",
    color: "from-violet-500/20 to-purple-500/20",
    borderColor: "border-violet-500/30",
  },
];

export default function MVPPage() {
  const [mounted, setMounted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [mvpSpotsRemaining, setMvpSpotsRemaining] = useState(5);

  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', idea: '' });
  const [briefFile, setBriefFile] = useState<File | null>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchMvpSpots();
    const submitted = localStorage.getItem(STORAGE_KEY);
    if (submitted) {
      const timestamp = parseInt(submitted, 10);
      const isExpired = !isNaN(timestamp) && Date.now() - timestamp > 24 * 60 * 60 * 1000;
      if (submitted === 'true' || !isExpired) {
        setAlreadySubmitted(true);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

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
    if (selectedProject !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  const fetchMvpSpots = async () => {
    try {
      const res = await fetch('/api/spots/mvp');
      const data = await res.json();
      setMvpSpotsRemaining(data.spots_remaining);
    } catch (err) {
      console.error('Error fetching MVP spots:', err);
    }
  };

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File must be under 10MB';
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return 'Allowed formats: PDF, DOC, DOCX, TXT, PNG, JPG';
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type !== '') {
      return 'Allowed formats: PDF, DOC, DOCX, TXT, PNG, JPG';
    }
    return null;
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const error = validateFile(file);
    if (error) {
      setFormError(error);
      return;
    }
    setFormError('');
    setBriefFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validate
    if (!formData.name.trim() || !formData.email.trim() || !formData.idea.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (!EMAIL_REGEX.test(formData.email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    const emailDomain = formData.email.trim().toLowerCase().split('@')[1];
    if (DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain)) {
      setFormError('Please use a real email address, not a temporary one.');
      return;
    }

    setFormStatus('submitting');

    try {
      const body = new FormData();
      body.append('name', formData.name.trim());
      body.append('email', formData.email.trim());
      body.append('idea', formData.idea.trim());
      if (briefFile) {
        body.append('brief', briefFile);
      }

      const res = await fetch('/api/leads/mvp', { method: 'POST', body });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || 'Something went wrong. Please try again.');
        setFormStatus('error');
        return;
      }

      setFormStatus('success');
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
      setAlreadySubmitted(true);
      fetchMvpSpots();
    } catch {
      setFormError('Something went wrong. Please try again.');
      setFormStatus('error');
    }
  };

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
            <a href="#portfolio" className="text-sm text-muted hover:text-foreground transition-colors">
              Portfolio
            </a>
            <a href="#how-it-works" className="text-sm text-muted hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#team" className="text-sm text-muted hover:text-foreground transition-colors">
              Team
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
              onClick={scrollToForm}
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
              <a href="#portfolio" className="text-sm text-muted hover:text-foreground transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                Portfolio
              </a>
              <a href="#how-it-works" className="text-sm text-muted hover:text-foreground transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                How It Works
              </a>
              <a href="#team" className="text-sm text-muted hover:text-foreground transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                Team
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
                  scrollToForm();
                }}
                className="text-sm font-medium px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-background rounded-lg transition-all shadow-md shadow-amber-500/20 w-full"
              >
                Get Started
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 pt-24 overflow-hidden">
        {/* Static gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-amber-950/20" />

        {/* Static ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(245, 158, 11, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center z-10">
          {/* Urgency badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 mb-4 ${mvpSpotsRemaining <= 2 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'} border rounded-full text-sm font-medium transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <span className="relative flex h-2 w-2">
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
                    setFormStatus('idle');
                  }}
                  className="text-sm text-muted hover:text-amber-400 transition-colors underline underline-offset-4"
                >
                  Have another idea? Submit again
                </button>
              </div>
            ) : (
              <button
                onClick={scrollToForm}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-background font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105"
              >
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
            <div className="w-1 h-2 bg-amber-500 rounded-full" />
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="relative px-6 py-20 overflow-hidden">
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

          <div className="grid md:grid-cols-2 gap-6">
            {PROJECTS.map((project, i) => (
              <div
                key={i}
                onClick={() => setSelectedProject(i)}
                className={`group relative bg-gradient-to-br ${project.color} border ${project.borderColor} rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
              >
                <div className="aspect-video bg-black/20 border-b border-white/10 overflow-hidden relative">
                  <video
                    src={project.video}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover object-top"
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none">
                    <div className="w-14 h-14 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
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
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-white/10 rounded-2xl shadow-2xl"
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

            {/* Video */}
            <div className="aspect-video bg-black/30 overflow-hidden rounded-t-2xl">
              <video
                src={PROJECTS[selectedProject].video}
                autoPlay
                muted
                loop
                playsInline
                controls
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
                  onClick={scrollToForm}
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
      <section id="team" className="relative px-6 py-20 bg-gradient-to-b from-background to-amber-950/10">
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

          {/* Team members - auto-scrolling marquee */}
          <div className="relative overflow-hidden mb-12">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="animate-marquee flex gap-8 w-max">
              {[...Array(2)].map((_, setIndex) =>
                [
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
                  <div key={`${setIndex}-${i}`} className="flex flex-col items-center gap-2 flex-shrink-0">
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
                ))
              )}
            </div>
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
      <section className="relative px-6 py-20 bg-gradient-to-b from-amber-950/10 to-background">
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
      <section className="relative px-6 py-20 overflow-hidden">
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
              onClick={scrollToForm}
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
      <section id="how-it-works" className="relative px-6 py-20 border-t border-white/10">
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
                description: "Fill out the form below. Attach a brief if you have one.",
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
              onClick={scrollToForm}
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
      <section className="relative px-6 py-20 border-t border-white/10">
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
                onClick={scrollToForm}
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
      <section className="relative px-6 py-20 bg-gradient-to-b from-amber-950/10 to-background">
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
                quote: "I\u2019d been quoted $15K by agencies. These guys shipped something better for a fraction. Code was clean, handoff was smooth.",
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

      {/* Lead Form Section */}
      <section ref={formSectionRef} id="get-started" className="relative px-6 py-20">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-4xl md:text-5xl mb-4">
              Tell us what you&apos;re{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                building
              </span>
            </h2>
            <p className="text-muted text-lg mb-4">
              Fill out the form below and we&apos;ll get back to you within 12 hours.
            </p>
            <p className={`text-sm font-medium flex items-center justify-center gap-2 ${mvpSpotsRemaining <= 2 ? 'text-red-400' : 'text-amber-400'}`}>
              <span className="relative flex h-2 w-2">
                <span className={`relative inline-flex rounded-full h-2 w-2 ${mvpSpotsRemaining <= 2 ? 'bg-red-500' : 'bg-amber-500'}`}></span>
              </span>
              {mvpSpotsRemaining > 0
                ? `Only ${mvpSpotsRemaining} spot${mvpSpotsRemaining === 1 ? '' : 's'} available this month`
                : 'Fully booked this month — join the waitlist'}
            </p>
          </div>

          {alreadySubmitted || formStatus === 'success' ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full text-white shadow-xl shadow-emerald-500/40">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl mb-2">Got it!</h3>
              <p className="text-muted text-sm mb-4">
                We&apos;ll review your requirements and get back to you within 12 hours.
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  setAlreadySubmitted(false);
                  setFormStatus('idle');
                  setFormData({ name: '', email: '', idea: '' });
                  setBriefFile(null);
                }}
                className="text-sm text-muted hover:text-amber-400 transition-colors underline underline-offset-4"
              >
                Have another idea? Submit again
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6 bg-white/[0.03] border border-white/10 rounded-2xl p-8">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Name <span className="text-amber-500">*</span></label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all placeholder:text-muted/50"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email <span className="text-amber-500">*</span></label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="you@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all placeholder:text-muted/50"
                />
              </div>

              {/* Idea */}
              <div>
                <label htmlFor="idea" className="block text-sm font-medium mb-2">Describe your idea <span className="text-amber-500">*</span></label>
                <textarea
                  id="idea"
                  required
                  value={formData.idea}
                  onChange={(e) => setFormData(prev => ({ ...prev, idea: e.target.value }))}
                  placeholder="What are you building? What problem does it solve? Who is it for?"
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all placeholder:text-muted/50 resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Upload a brief <span className="text-muted">(optional)</span></label>
                {briefFile ? (
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{briefFile.name}</p>
                      <p className="text-xs text-muted">{formatFileSize(briefFile.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBriefFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1 text-muted hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 hover:border-amber-500/30 rounded-xl px-4 py-8 text-center cursor-pointer transition-colors"
                  >
                    <svg className="w-8 h-8 text-muted mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-muted">
                      Drag & drop or <span className="text-amber-400">browse</span>
                    </p>
                    <p className="text-xs text-muted/60 mt-1">PDF, DOC, DOCX, TXT, PNG, JPG — 10MB max</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={(e) => handleFileChange(e.target.files)}
                />
              </div>

              {/* Error */}
              {formError && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {formError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="w-full group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-background font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 rounded-xl"
              >
                {formStatus === 'submitting' ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Idea</span>
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted">
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
            </form>
          )}
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
    </main>
  );
}
