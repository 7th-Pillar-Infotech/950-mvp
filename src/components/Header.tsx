"use client";

import { useState } from "react";
import Link from "next/link";

interface HeaderProps {
  variant: "mvp" | "free-prototype";
}

export function Header({ variant }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToForm = () => {
    document.getElementById("get-started")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-serif text-xl">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            $950
          </span>{" "}
          MVP
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {variant === "mvp" && (
            <>
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
                className="text-sm font-medium px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg transition-all shadow-md shadow-blue-600/15"
              >
                Get Started
              </button>
            </>
          )}
          {variant === "free-prototype" && (
            <>
              <a href="#how-it-works" className="text-sm text-muted hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#what-you-get" className="text-sm text-muted hover:text-foreground transition-colors">
                What You Get
              </a>
              <a
                href="https://7thpillar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Our Agency
              </a>
              <Link
                href="/"
                className="text-sm font-medium px-4 py-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                $950 MVP Service
              </Link>
            </>
          )}
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
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
          <nav className="flex flex-col p-4 space-y-4">
            {variant === "mvp" && (
              <>
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
                  className="text-sm font-medium px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg transition-all shadow-md shadow-blue-600/15 w-full"
                >
                  Get Started
                </button>
              </>
            )}
            {variant === "free-prototype" && (
              <>
                <a href="#how-it-works" className="text-sm text-muted hover:text-foreground transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                  How It Works
                </a>
                <a href="#what-you-get" className="text-sm text-muted hover:text-foreground transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                  What You Get
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
                <Link
                  href="/"
                  className="text-sm font-medium px-4 py-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  $950 MVP Service
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
