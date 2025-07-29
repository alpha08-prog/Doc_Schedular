import React from "react";

/**
 * IconButton for icon-only clickable buttons.
 * @param children - The icon to display.
 * @param onClick - Click handler.
 * @param ariaLabel - Accessibility label.
 * @param className - Optional extra classes.
 */
interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ children, onClick, ariaLabel, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className={`p-2 rounded-full hover:bg-gray-100 transition ${className}`}
  >
    {children}
  </button>
);

export default IconButton; 