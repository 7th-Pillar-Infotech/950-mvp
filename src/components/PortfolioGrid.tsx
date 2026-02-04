"use client";

import { useState, useEffect } from "react";

interface Project {
  name: string;
  description: string;
  category: string;
  url: string;
  video?: string;
  screenshot?: string;
  color: string;
  borderColor: string;
}

interface PortfolioGridProps {
  projects: Project[];
}

export function PortfolioGrid({ projects }: PortfolioGridProps) {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  // ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Body scroll lock when modal is open
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

  const scrollToForm = () => {
    setSelectedProject(null);
    setTimeout(() => {
      document.getElementById("get-started")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((project, i) => (
          <div
            key={i}
            onClick={() => setSelectedProject(i)}
            className={`group relative bg-gradient-to-br ${project.color} border ${project.borderColor} rounded-2xl overflow-hidden hover:scale-[1.02] hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer`}
          >
            <div className="aspect-video bg-black/20 border-b border-gray-200 overflow-hidden relative">
              {project.video ? (
                <>
                  <video
                    src={project.video}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover object-top"
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none">
                    <div className="w-14 h-14 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                      <svg
                        className="w-6 h-6 text-white ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </>
              ) : project.screenshot ? (
                <img
                  src={project.screenshot}
                  alt={project.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-top"
                />
              ) : null}
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
              <p className="text-muted text-sm mb-4">{project.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600 flex items-center gap-1">
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View details
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
          </div>
        ))}
      </div>

      {/* Portfolio Modal */}
      {selectedProject !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedProject(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal content */}
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-all"
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

            {/* Video or Screenshot */}
            <div className="aspect-video bg-black/30 overflow-hidden rounded-t-2xl">
              {projects[selectedProject].video ? (
                <video
                  src={projects[selectedProject].video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className="w-full h-full object-cover object-top"
                />
              ) : projects[selectedProject].screenshot ? (
                <img
                  src={projects[selectedProject].screenshot}
                  alt={projects[selectedProject].name}
                  className="w-full h-full object-cover object-top"
                />
              ) : null}
            </div>

            {/* Details */}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-muted">
                  {projects[selectedProject].category}
                </span>
                <span className="text-emerald-400 flex items-center gap-1 text-xs">
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

              <h3 className="font-serif text-3xl md:text-4xl mb-3">
                {projects[selectedProject].name}
              </h3>
              <p className="text-muted text-lg mb-8">
                {projects[selectedProject].description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToForm}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                >
                  Build Something Like This — $950
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
                </button>
                <a
                  href={projects[selectedProject].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-muted hover:text-foreground hover:border-gray-300 transition-all"
                >
                  Visit Live Site
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
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
