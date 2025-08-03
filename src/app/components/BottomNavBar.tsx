"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";

const navItems = [
  {
    label: "Find Doctor",
    href: "/",
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
    ),
  },
  {
    label: "Appointments",
    href: "/booking",
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Records",
    href: "/records",
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

const BottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 flex justify-around items-center h-14 z-50 shadow-lg">
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <button
            key={item.label}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-200 relative group ${
              active 
                ? "text-blue-600" 
                : "text-gray-400 hover:text-blue-500"
            }`}
            onClick={() => router.push(item.href as any)}
          >
            {/* Active indicator */}
            {active && (
              <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full animate-scale-in" />
            )}
            
            {/* Icon container */}
            <div className={`p-1.5 rounded-lg transition-all duration-200 ${
              active 
                ? "bg-blue-50 scale-110" 
                : "group-hover:bg-gray-50 group-active:scale-95"
            }`}>
              <div className={`transition-transform duration-200 ${
                active ? "scale-110" : "group-hover:scale-105"
              }`}>
                {item.icon}
              </div>
            </div>
            
            {/* Label */}
            <span className={`text-xs font-medium mt-0.5 transition-all duration-200 ${
              active ? "font-semibold" : ""
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavBar; 