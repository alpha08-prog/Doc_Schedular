"use client";
import React from "react";

type Props = {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: number;
};

export default function StarRating({ value, onChange, readOnly = false, size = 22 }: Props) {
  const stars = [1, 2, 3, 4, 5];
  const color = (i: number) => (i <= value ? "#f59e0b" : "#d1d5db");

  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${value} of 5`}>
      {stars.map((i) => (
        <button
          key={i}
          type={onChange ? "button" : "button"}
          disabled={readOnly}
          onClick={() => onChange && onChange(i)}
          className={readOnly ? "cursor-default" : "cursor-pointer hover:scale-105 transition"}
          aria-label={`${i} star`}
        >
          <svg width={size} height={size} viewBox="0 0 20 20" fill={color(i)} xmlns="http://www.w3.org/2000/svg">
            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.562-.955L10 0l2.95 5.955 6.562.955-4.756 4.634 1.122 6.545z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
