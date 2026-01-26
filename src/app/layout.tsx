import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "$950 MVP — From Idea to Product",
  description: "Yes, AI can build your MVP. We make sure it's worth building. Get a scalable, investor-ready MVP starting at $950.",
  keywords: ["MVP", "startup", "app development", "AI", "chatbot", "voice agent", "automation"],
  openGraph: {
    title: "$950 MVP — From Idea to Product",
    description: "Yes, AI can build your MVP. We make sure it's worth building.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
