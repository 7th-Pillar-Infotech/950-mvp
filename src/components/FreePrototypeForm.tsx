"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { EMAIL_REGEX, DISPOSABLE_EMAIL_DOMAINS } from "@/lib/constants";

const STORAGE_KEY = "free_prototype_submitted";

export function FreePrototypeForm() {
  const [formData, setFormData] = useState({ name: "", email: "", idea: "" });
  const [formStatus, setFormStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [formError, setFormError] = useState("");

  const alreadySubmitted = useSyncExternalStore(
    (cb) => {
      window.addEventListener("storage", cb);
      return () => window.removeEventListener("storage", cb);
    },
    () => localStorage.getItem(STORAGE_KEY) !== null,
    () => false,
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.idea.trim()
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (!EMAIL_REGEX.test(formData.email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }
    const emailDomain = formData.email.trim().toLowerCase().split("@")[1];
    if (DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain)) {
      setFormError("Please use a real email address, not a temporary one.");
      return;
    }

    setFormStatus("submitting");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          idea: formData.idea.trim(),
          stage: "idea",
          timeline: "asap",
          budget: "0",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || "Something went wrong. Please try again.");
        setFormStatus("error");
        return;
      }

      // Decrement spots
      await fetch("/api/spots", { method: "POST" });

      setFormStatus("success");
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      setFormError("Something went wrong. Please try again.");
      setFormStatus("error");
    }
  };

  return (
    <section id="get-started" className="relative px-6 py-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
            Free
          </span>
          <h2 className="font-serif text-4xl md:text-5xl mb-4">
            Tell us your{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              idea
            </span>
          </h2>
          <p className="text-muted text-lg mb-4">
            We&apos;ll build you a working prototype and send it within 24-48
            hours.
          </p>
          <p className="text-sm font-medium flex items-center justify-center gap-2 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            We build 10 free prototypes per month
          </p>
        </div>

        {alreadySubmitted || formStatus === "success" ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full text-white shadow-xl shadow-emerald-500/40">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="font-serif text-2xl mb-2">You&apos;re all set!</h3>
            <p className="text-muted text-sm mb-4">
              We&apos;ll send your prototype within 24-48 hours. Check your
              email for updates.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
            >
              Need more? Check out $950 Full MVP
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
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleFormSubmit}
            className="space-y-6 bg-white border border-gray-200 rounded-2xl p-8"
          >
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name <span className="text-emerald-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Your name"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all placeholder:text-muted/50"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email <span className="text-emerald-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="you@company.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all placeholder:text-muted/50"
              />
            </div>

            {/* Idea */}
            <div>
              <label htmlFor="idea" className="block text-sm font-medium mb-2">
                Describe your idea <span className="text-emerald-500">*</span>
              </label>
              <textarea
                id="idea"
                required
                value={formData.idea}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, idea: e.target.value }))
                }
                placeholder="What are you building? What problem does it solve? Who is it for?"
                rows={5}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all placeholder:text-muted/50 resize-none"
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
              disabled={formStatus === "submitting"}
              className="w-full group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 rounded-xl"
            >
              {formStatus === "submitting" ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Claim My Prototype</span>
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
                </>
              )}
            </button>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted">
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                100% free
              </span>
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Delivered in 24-48 hours
              </span>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
