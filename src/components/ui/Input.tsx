import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftAddon, rightAddon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full py-3 border rounded-xl transition-all duration-200 bg-white",
              "placeholder-gray-400 text-gray-900 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              error ? "border-red-400 focus:ring-red-400" : "border-gray-200",
              leftAddon ? "pl-10" : "pl-4",
              rightAddon ? "pr-10" : "pr-4",
              className
            )}
            {...props}
          />
          {rightAddon && (
            <div className="absolute right-3 flex items-center text-gray-400">{rightAddon}</div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {!error && hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
