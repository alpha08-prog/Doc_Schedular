import React from "react";

/**
 * Tabs component for switching between views.
 * @param tabs - Array of tab labels.
 * @param activeIndex - Index of the currently active tab.
 * @param onChange - Handler called with the new index when a tab is clicked.
 * @param className - Optional extra classes for the container.
 */
interface TabsProps {
  tabs: string[];
  activeIndex: number;
  onChange: (index: number) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeIndex, onChange, className = "" }) => (
  <div className={`flex justify-between border-b border-gray-200 mb-2 ${className}`}>
    {tabs.map((tab, idx) => (
      <button
        key={tab}
        className={`pb-2 flex-1 text-base font-medium transition border-b-2 ${
          idx === activeIndex
            ? "text-sky-500 font-semibold border-sky-400"
            : "text-gray-400 border-transparent hover:text-sky-400"
        }`}
        onClick={() => onChange(idx)}
      >
        {tab}
      </button>
    ))}
  </div>
);

export default Tabs; 