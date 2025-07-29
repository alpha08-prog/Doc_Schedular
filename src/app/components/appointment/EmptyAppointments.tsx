import React from "react";

/**
 * EmptyAppointments displays an empty state with illustration, message, and a button.
 * @param title - Main message/title.
 * @param description - Subtext/description.
 * @param buttonText - Text for the action button.
 * @param onBook - Click handler for the button.
 * @param illustration - Optional custom illustration (defaults to clipboard SVG).
 * @param className - Optional extra classes.
 */
interface EmptyAppointmentsProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onBook: () => void;
  illustration?: React.ReactNode;
  className?: string;
}

const DefaultIllustration = (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
    <rect x="20" y="30" width="80" height="60" rx="8" fill="#E5E7EB" />
    <rect x="30" y="40" width="60" height="40" rx="6" fill="#F3F4F6" />
    <rect x="40" y="50" width="40" height="20" rx="4" fill="#E0F2FE" />
  </svg>
);

const EmptyAppointments: React.FC<EmptyAppointmentsProps> = ({
  title = "You don't have an appointment yet",
  description = "Please click the button below to book an appointment.",
  buttonText = "Book appointment",
  onBook,
  illustration,
  className = "",
}) => (
  <div className={`flex flex-col items-center justify-center h-full py-16 ${className}`}>
    {illustration || DefaultIllustration}
    <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">{title}</h2>
    <p className="text-gray-500 mb-6 text-center">{description}</p>
    <button
      onClick={onBook}
      className="bg-sky-400 hover:bg-sky-500 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
    >
      {buttonText}
    </button>
  </div>
);

export default EmptyAppointments; 