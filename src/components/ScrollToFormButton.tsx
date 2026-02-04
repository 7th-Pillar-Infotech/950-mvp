"use client";

interface ScrollToFormButtonProps {
  formId: string;
  children: React.ReactNode;
  className?: string;
}

export function ScrollToFormButton({ formId, children, className }: ScrollToFormButtonProps) {
  return (
    <button
      onClick={() => document.getElementById(formId)?.scrollIntoView({ behavior: 'smooth' })}
      className={className}
    >
      {children}
    </button>
  );
}
