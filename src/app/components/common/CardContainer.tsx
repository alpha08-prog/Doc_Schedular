import React from "react";

/**
 * CardContainer for wrapping content in a card-style layout.
 * @param children - Content to display inside the card.
 * @param className - Optional extra classes for the card.
 */
interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
}

const CardContainer: React.FC<CardContainerProps> = ({ children, className = "" }) => (
  <div className={`w-full max-w-md md:max-w-2xl bg-white rounded-2xl shadow-xl mx-auto p-0 md:p-8 transition-all ${className}`}>
    {children}
  </div>
);

export default CardContainer; 