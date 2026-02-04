import Link from "next/link";
import { Header } from "@/components/Header";
import { StickyCTA } from "@/components/StickyCTA";
import { FreePrototypeForm } from "@/components/FreePrototypeForm";
import { ScrollToFormButton } from "@/components/ScrollToFormButton";

const projects = [
  {
    name: "Ownsy",
    description:
      "Fractional real estate investment platform with tokenized property ownership",
    category: "Proptech",
    url: "https://ownsy.netlify.app/",
    screenshot: "/screenshots/ownsy.jpg",
    color: "from-gray-50 to-white",
    borderColor: "border-gray-200",
  },
  {
    name: "FurnishVision",
    description: "AI-powered home decor e-commerce with room visualization",
    category: "E-commerce",
    url: "https://furnishvision.netlify.app/",
    screenshot: "/screenshots/furnishvision.jpg",
    color: "from-gray-50 to-white",
    borderColor: "border-gray-200",
  },
  {
    name: "Villiers",
    description: "Private jet charter marketplace with instant booking",
    category: "Luxury Travel",
    url: "https://villiers-redesign.netlify.app/",
    screenshot: "/screenshots/villiers.jpg",
    color: "from-gray-50 to-white",
    borderColor: "border-gray-200",
  },
  {
    name: "Melodist",
    description: "Music distribution platform for independent artists",
    category: "Music Tech",
    url: "https://upwork-music-distribution-platform.vercel.app/",
    screenshot: "/screenshots/melodist.jpg",
    color: "from-gray-50 to-white",
    borderColor: "border-gray-200",
  },
  {
    name: "Mod Society",
    description: "Live music gig management for musicians and venues",
    category: "Event Management",
    url: "https://mod-society-mock.vercel.app/admin/dashboard",
    screenshot: "/screenshots/modsociety.jpg",
    color: "from-gray-50 to-white",
    borderColor: "border-gray-200",
  },
  {
    name: "yd.io",
    description: "Creator economy platform for digital artists",
    category: "Creator Economy",
    url: "https://yd-io.vercel.app/",
    screenshot: "/screenshots/ydio.jpg",
    color: "from-gray-50 to-white",
    borderColor: "border-gray-200",
  },
];

const faqItems = [
  {
    question: "Why is this free?",
    answer:
      "We build your prototype for free because it\u2019s the best way to show you what we can do. When you\u2019re ready for the full product, you already know our quality.",
  },
  {
    question: "What\u2019s the catch?",
    answer:
      "No catch. No credit card. No hidden fees. We build it, you keep it. If you want to continue with a full MVP, we\u2019re here. If not, no hard feelings.",
  },
  {
    question: "How good can a free prototype be?",
    answer:
      "These aren\u2019t mockups or wireframes. They\u2019re real React applications with working screens, navigation, and responsive design. Check the showcase above.",
  },
  {
    question: "Will you contact me after?",
    answer:
      "We\u2019ll send your prototype and follow up once. No spam, no aggressive sales. You can reach out when you\u2019re ready.",
  },
  {
    question: "What if my idea is too complex for a prototype?",
    answer:
      "We\u2019ll tell you upfront and suggest the best path forward \u2014 whether that\u2019s scoping down for a prototype or going straight to a full MVP.",
  },
];

export default function FreePrototype() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Header */}
      <Header variant="free-prototype" />

      {/* Sticky CTA */}
      <StickyCTA
        heroSentinelId="hero-sentinel"
        formSectionId="get-started"
        variant="free-prototype"
        label="Get My Free Prototype"
      />

      {/* ─── 1. Hero ─── */}
      <section
        id="hero-sentinel"
        className="relative min-h-screen flex items-center justify-center px-6 py-20 pt-24 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-emerald-50" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.15) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center z-10">
          {/* Capacity note */}
          <p className="mb-10 text-emerald-400 text-sm font-medium">
            We build 10 free prototypes per month
          </p>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight mb-6">
            Got a startup idea{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent italic">
                stuck in your head?
              </span>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted max-w-2xl mx-auto mb-4">
            You know it could work. But between everything going on and figuring
            out where to start — it just sits there.{" "}
            <span className="text-foreground">Weeks turn into months.</span>{" "}
            Meanwhile, someone else might be building the same thing.
          </p>

          <p className="text-lg text-muted/90 max-w-xl mx-auto mb-10">
            Get a{" "}
            <span className="text-emerald-400 font-semibold">
              free working prototype
            </span>{" "}
            of your idea. Something you can click around, share with friends,
            investors, or potential customers.{" "}
            <span className="text-foreground font-medium">
              See if it has legs — before you go all in.
            </span>
          </p>

          {/* CTA */}
          <ScrollToFormButton
            formId="get-started"
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105"
          >
            <span>Get My Free Prototype</span>
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
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

          <p className="mt-6 text-sm text-muted/70">
            No credit card. No catch. Just tell us your idea.
          </p>

          <div className="mt-10">
            <a
              href="https://7thpillar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted/70 hover:text-muted transition-colors"
            >
              <span>By</span>
              <span className="font-medium text-muted">7th Pillar</span>
              <span className="text-muted/50">&bull;</span>
              <span>50+ products shipped, 12 years in business</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── 2. How It Works ─── */}
      <section
        id="how-it-works"
        className="relative px-6 py-20 border-t border-gray-200"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-blue-600 bg-blue-50 rounded-full">
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
                description:
                  "Fill out the form below. Just explain your idea like you would to a friend — no jargon needed.",
              },
              {
                step: "02",
                title: "We build it overnight",
                description:
                  "Our team turns your idea into something real. Screens you can click. A page that explains what you\u2019re building.",
              },
              {
                step: "03",
                title: "Check your inbox",
                description:
                  "Within 24-48 hours, you\u2019ll have a working prototype + landing page. Yours to keep, share, and test.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-serif text-blue-600/15 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-8 pl-4">
                  <h3 className="font-serif text-xl mb-3">{item.title}</h3>
                  <p className="text-muted">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Intermediate CTA */}
          <div className="text-center mt-12">
            <ScrollToFormButton
              formId="get-started"
              className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Get My Free Prototype
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
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </ScrollToFormButton>
          </div>
        </div>
      </section>

      {/* ─── 3. What You Get ─── */}
      <section
        id="what-you-get"
        className="relative px-6 py-20 bg-gradient-to-b from-emerald-50/50 to-background"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-blue-600 bg-blue-50 rounded-full">
              What You Get
            </span>
            <h2 className="font-serif text-3xl md:text-5xl mb-4">
              This isn&apos;t a mockup.{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                It&apos;s the real thing.
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Working Prototype card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500 mb-6">
                <svg
                  className="w-6 h-6"
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
              </div>
              <h3 className="font-serif text-2xl mb-4">Working Prototype</h3>
              <ul className="space-y-3 text-muted">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">&#10003;</span>
                  Screens that actually work (not just pictures)
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">&#10003;</span>
                  Built with real code you can keep
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">&#10003;</span>
                  Mobile-responsive by default
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">&#10003;</span>
                  Designed to impress investors and early users
                </li>
              </ul>
            </div>

            {/* Landing Page card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500 mb-6">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
                  <span className="text-emerald-500 mt-1">&#10003;</span>
                  Explains your idea clearly
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">&#10003;</span>
                  Captures emails from interested people
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">&#10003;</span>
                  Validate demand before you invest
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">&#10003;</span>
                  Professional design that builds trust
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. Showcase ─── */}
      <section
        id="showcase"
        className="relative px-6 py-20 border-t border-gray-200"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-blue-600 bg-blue-50 rounded-full">
              Recent Work
            </span>
            <h2 className="font-serif text-3xl md:text-5xl mb-4">
              Here&apos;s what we built{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                this week
              </span>
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Real prototypes for real founders. Not mockups. Not wireframes.
              Working stuff.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <a
                key={i}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative bg-gradient-to-br ${project.color} border ${project.borderColor} rounded-2xl overflow-hidden hover:scale-[1.02] hover:border-blue-300 hover:shadow-lg transition-all duration-300`}
              >
                <div className="aspect-video bg-gray-100 border-b border-gray-200 overflow-hidden">
                  <img
                    src={project.screenshot}
                    alt={project.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-muted">
                      {project.category}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl mb-2 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-muted text-sm mb-4">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted flex items-center gap-1">
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
                      View live
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Delivered
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Mid-page CTA */}
          <div className="text-center mt-12">
            <p className="text-muted mb-4">Yours could be next.</p>
            <ScrollToFormButton
              formId="get-started"
              className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Get My Free Prototype
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
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </ScrollToFormButton>
          </div>
        </div>
      </section>

      {/* ─── 5. FAQ ─── */}
      <section className="relative px-6 py-20 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium uppercase tracking-widest text-blue-600 bg-blue-50 rounded-full">
              FAQ
            </span>
            <h2 className="font-serif text-3xl md:text-5xl">
              Questions?{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Answered.
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-emerald-500/30 transition-colors"
              >
                <h3 className="font-serif text-lg mb-2">{item.question}</h3>
                <p className="text-muted">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. Lead Form ─── */}
      <FreePrototypeForm />

      {/* ─── 7. Footer ─── */}
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
                href="/"
                className="text-muted hover:text-foreground transition-colors text-sm"
              >
                $950 MVP Service
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
              &copy; {new Date().getFullYear()} &mdash; We&apos;ve been doing
              this for 12+ years.
            </div>
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
    </main>
  );
}
