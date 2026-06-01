import React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full px-4 py-3 border rounded-xl transition-all duration-200 bg-white",
            "placeholder-gray-400 text-gray-900 text-sm resize-none",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            error ? "border-red-400 focus:ring-red-400" : "border-gray-200",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {!error && hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
