import React from "react";

/**
 * TopBar component for page headers.
 * @param title - The main title to display.
 * @param right - Optional right-side content (icons/buttons).
 */
interface TopBarProps {
  title: string;
  right?: React.ReactNode;
  className?: string;
}

const TopBar: React.FC<TopBarProps> = ({ title, right, className = "" }) => (
  <div className={`flex items-center justify-between px-6 pt-6 pb-4 md:px-0 md:pt-0 ${className}`}>
    <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
    {right && <div className="flex items-center gap-2">{right}</div>}
  </div>
);

export default TopBar; 