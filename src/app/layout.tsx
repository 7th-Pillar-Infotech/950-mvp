import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://950mvp.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "$950 MVP — From Idea to Product",
    template: "%s | $950 MVP",
  },
  description: "Yes, AI can build your MVP. We make sure it's worth building. Get a scalable, investor-ready MVP for $950 — web apps, AI chatbots, voice agents, and automation. Built by experts with 10+ years of experience.",
  keywords: [
    "MVP development",
    "startup MVP",
    "app development",
    "AI chatbot",
    "voice agent",
    "automation",
    "web app development",
    "rapid prototyping",
    "product development",
    "startup launch",
    "investor demo",
    "minimum viable product",
  ],
  authors: [{ name: "7th Pillar", url: "https://7thpillar.com" }],
  creator: "7th Pillar",
  publisher: "7th Pillar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "$950 MVP",
    title: "$950 MVP — From Idea to Product",
    description: "Yes, AI can build your MVP. We make sure it's worth building. Get a scalable, investor-ready MVP for $950.",
  },
  twitter: {
    card: "summary_large_image",
    title: "$950 MVP — From Idea to Product",
    description: "Yes, AI can build your MVP. We make sure it's worth building. Get a scalable, investor-ready MVP for $950.",
    creator: "@7thpillar",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
};

// JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "$950 MVP",
  description: "MVP development service for startups. Get a scalable, investor-ready MVP for $950.",
  url: siteUrl,
  logo: `${siteUrl}/favicon.svg`,
  priceRange: "$950",
  areaServed: "Worldwide",
  serviceType: ["MVP Development", "Web App Development", "AI Chatbot Development", "Voice Agent Development", "Automation"],
  provider: {
    "@type": "Organization",
    name: "7th Pillar",
    url: "https://7thpillar.com",
  },
  offers: {
    "@type": "Offer",
    price: "950",
    priceCurrency: "USD",
    description: "Complete MVP development including web apps, AI chatbots, voice agents, and automation",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${instrumentSerif.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* PostHog Analytics */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init rs ls bi ns us ts ss capture calculateEventProperties vs register register_once register_for_session unregister unregister_for_session gs getFeatureFlag getFeatureFlagPayload getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty fs ds createPersonProfile ps Qr opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing hs debug O cs getPageViewId captureTraceFeedback captureTraceMetric Kr".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
              posthog.init('phc_rhmFvQaHiJZ6nqKq6Z88dKFURiqBsyvgIRWBEi005ds', {
                  api_host: 'https://us.i.posthog.com',
                  defaults: '2025-11-30',
                  person_profiles: 'identified_only',
              })
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
