import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://950mvp.com";

export const metadata: Metadata = {
  title: "Free Prototype — Get a Clickable React Prototype in 24-48 Hours",
  description: "Get a FREE clickable React prototype + landing page for your startup idea. No credit card required. Limited to 10 spots per day. Delivered in 24-48 hours.",
  keywords: [
    "free prototype",
    "startup prototype",
    "React prototype",
    "clickable prototype",
    "landing page",
    "startup validation",
    "MVP prototype",
    "free startup tools",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/free-prototype`,
    siteName: "$950 MVP",
    title: "Free Prototype — Clickable React Prototype in 24-48 Hours",
    description: "Get a FREE clickable React prototype + landing page for your startup idea. No credit card. Limited spots daily.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Free Prototype - Get a Clickable React Prototype",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Prototype — Clickable React Prototype in 24-48 Hours",
    description: "Get a FREE clickable React prototype + landing page for your startup idea. No credit card. Limited spots daily.",
    images: ["/og-image.svg"],
  },
  alternates: {
    canonical: `${siteUrl}/free-prototype`,
  },
};

// JSON-LD for free prototype page
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Free Prototype Service",
  description: "Get a free clickable React prototype and landing page for your startup idea. Delivered in 24-48 hours.",
  url: `${siteUrl}/free-prototype`,
  provider: {
    "@type": "Organization",
    name: "7th Pillar",
    url: "https://7thpillar.com",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free clickable prototype with landing page",
    availability: "https://schema.org/LimitedAvailability",
  },
  areaServed: "Worldwide",
};

export default function FreePrototypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
