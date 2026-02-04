"use client";

import { useState, useEffect } from "react";

interface StickyCTAProps {
  variant: "mvp" | "free-prototype";
  label: string;
  heroSentinelId: string;
  formSectionId: string;
}

export function StickyCTA({
  variant,
  label,
  heroSentinelId,
  formSectionId,
}: StickyCTAProps) {
  const [pastHero, setPastHero] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const heroSentinel = document.getElementById(heroSentinelId);
    if (!heroSentinel) return;

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        // Show CTA when hero sentinel is NOT in viewport (user scrolled past hero)
        setPastHero(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    heroObserver.observe(heroSentinel);

    return () => {
      heroObserver.disconnect();
    };
  }, [heroSentinelId]);

  useEffect(() => {
    const formSection = document.getElementById(formSectionId);
    if (!formSection) return;

    const formObserver = new IntersectionObserver(
      ([entry]) => {
        // Hide CTA when form section IS in viewport
        setFormVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    formObserver.observe(formSection);

    return () => {
      formObserver.disconnect();
    };
  }, [formSectionId]);

  const visible = pastHero && !formVisible;

  const handleClick = () => {
    document
      .getElementById(formSectionId)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const buttonGradient =
    variant === "mvp"
      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/20"
      : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25";

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="p-4 max-w-2xl mx-auto">
        <button
          onClick={handleClick}
          className={`w-full text-white font-semibold py-3.5 px-6 rounded-xl cursor-pointer transition-all duration-200 ${buttonGradient}`}
        >
          {label}
        </button>
      </div>
    </div>
  );
}
