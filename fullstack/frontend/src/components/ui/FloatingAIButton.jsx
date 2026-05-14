// src/components/ui/FloatingAIButton.jsx

/**
 * FloatingAIButton — A fixed-position floating action button displaying the AI chip icon.
 * Appears at the top-right corner of the viewport after the user completes their first analysis.
 *
 * Requirements: 3.6, 5.1, 5.2, 5.4
 */
export default function FloatingAIButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Run AI Analysis"
      className="fixed top-5 right-5 z-50 flex items-center justify-center w-12 h-12 min-w-[44px] min-h-[44px] rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:scale-[1.07] transition-transform duration-[175ms] ease-out cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="15" x2="23" y2="15" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="15" x2="4" y2="15" />
      </svg>
    </button>
  );
}
