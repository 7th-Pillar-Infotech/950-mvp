"use client";

import { useState, useSyncExternalStore, useRef } from "react";
import {
  EMAIL_REGEX,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  ALLOWED_EXTENSIONS,
  DISPOSABLE_EMAIL_DOMAINS,
} from "@/lib/constants";

const STORAGE_KEY = "mvp_submitted";

export function MvpLeadForm() {
  const [formData, setFormData] = useState({ name: "", email: "", idea: "" });
  const [briefFile, setBriefFile] = useState<File | null>(null);
  const [formStatus, setFormStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const alreadySubmitted = useSyncExternalStore(
    (cb) => {
      window.addEventListener("storage", cb);
      return () => window.removeEventListener("storage", cb);
    },
    () => {
      const submitted = localStorage.getItem(STORAGE_KEY);
      if (!submitted) return false;
      const timestamp = parseInt(submitted, 10);
      const isExpired =
        !isNaN(timestamp) && Date.now() - timestamp > 24 * 60 * 60 * 1000;
      if (submitted === "true" || !isExpired) return true;
      localStorage.removeItem(STORAGE_KEY);
      return false;
    },
    () => false,
  );

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "File must be under 10MB";
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return "Allowed formats: PDF, DOC, DOCX, TXT, PNG, JPG";
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type !== "") {
      return "Allowed formats: PDF, DOC, DOCX, TXT, PNG, JPG";
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
    setFormError("");
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
    setFormError("");

    // Validate
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
      const body = new FormData();
      body.append("name", formData.name.trim());
      body.append("email", formData.email.trim());
      body.append("idea", formData.idea.trim());
      if (briefFile) {
        body.append("brief", briefFile);
      }

      const res = await fetch("/api/leads/mvp", { method: "POST", body });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || "Something went wrong. Please try again.");
        setFormStatus("error");
        return;
      }

      setFormStatus("success");
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      setFormError("Something went wrong. Please try again.");
      setFormStatus("error");
    }
  };

  return (
    <section id="get-started" className="relative px-6 py-20">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif text-4xl md:text-5xl mb-4">
            Tell us what you&apos;re{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              building
            </span>
          </h2>
          <p className="text-muted text-lg mb-4">
            Fill out the form below and we&apos;ll get back to you within 12
            hours.
          </p>
          <p className="text-sm font-medium flex items-center justify-center gap-2 text-blue-600">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            We take on 3-5 projects per month
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
            <h3 className="font-serif text-2xl mb-2">Got it!</h3>
            <p className="text-muted text-sm mb-4">
              We&apos;ll review your requirements and get back to you within 12
              hours.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setFormStatus("idle");
                setFormData({ name: "", email: "", idea: "" });
                setBriefFile(null);
              }}
              className="text-sm text-muted hover:text-blue-600 transition-colors underline underline-offset-4"
            >
              Have another idea? Submit again
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleFormSubmit}
            className="space-y-6 bg-white border border-gray-200 rounded-2xl p-8"
          >
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name <span className="text-blue-600">*</span>
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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-muted/50"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email <span className="text-blue-600">*</span>
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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-muted/50"
              />
            </div>

            {/* Idea */}
            <div>
              <label htmlFor="idea" className="block text-sm font-medium mb-2">
                Describe your idea <span className="text-blue-600">*</span>
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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-muted/50 resize-none"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload a brief{" "}
                <span className="text-muted">(optional)</span>
              </label>
              {briefFile ? (
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{briefFile.name}</p>
                    <p className="text-xs text-muted">
                      {formatFileSize(briefFile.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBriefFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-1 text-muted hover:text-red-400 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl px-4 py-8 text-center cursor-pointer transition-colors"
                >
                  <svg
                    className="w-8 h-8 text-muted mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-muted">
                    Drag & drop or{" "}
                    <span className="text-blue-600">browse</span>
                  </p>
                  <p className="text-xs text-muted/60 mt-1">
                    PDF, DOC, DOCX, TXT, PNG, JPG — 10MB max
                  </p>
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
              disabled={formStatus === "submitting"}
              className="w-full group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-10 py-5 text-lg transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/25 rounded-xl"
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
                  <span>Let&apos;s Build This</span>
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
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Reply within 12 hours
              </span>
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                No commitment until you say go
              </span>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
