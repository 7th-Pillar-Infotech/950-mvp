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
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "$950 MVP - From Idea to Product",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "$950 MVP — From Idea to Product",
    description: "Yes, AI can build your MVP. We make sure it's worth building. Get a scalable, investor-ready MVP for $950.",
    images: ["/og-image.svg"],
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
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
