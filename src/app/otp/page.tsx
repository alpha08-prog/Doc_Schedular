"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useNotification } from "@/contexts/NotificationContext";

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

export default function OTPPage() {
  const { notify } = useNotification();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const focusInput = (idx: number) => {
    inputsRef.current[idx]?.focus();
    inputsRef.current[idx]?.select();
  };

  const handleChange = (idx: number, value: string) => {
    // Allow only a single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < OTP_LENGTH - 1) {
      focusInput(idx + 1);
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      e.preventDefault();
      const next = [...otp];
      next[idx - 1] = "";
      setOtp(next);
      focusInput(idx - 1);
    } else if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      focusInput(idx - 1);
    } else if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
      e.preventDefault();
      focusInput(idx + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setOtp(Array(OTP_LENGTH).fill(""));
    setSecondsLeft(RESEND_SECONDS);
    focusInput(0);
    notify("A new verification code has been sent", "success");
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      notify("Please enter the complete 4-digit code", "error");
      return;
    }
    notify("Code verified successfully", "success");
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-12">
      <Card padding="lg" className="w-full max-w-md mx-auto rounded-3xl shadow-xl animate-fade-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-center mb-2 text-gray-900">OTP Code Verification</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Enter the 4-digit code sent to your registered mobile number
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-4 mb-6" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onFocus={(e) => e.target.select()}
              aria-label={`Digit ${idx + 1} of ${OTP_LENGTH}`}
              className={`w-14 h-14 text-center text-2xl font-semibold rounded-xl border-2 bg-gray-50 text-gray-900 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white ${
                digit ? "border-blue-500 bg-white" : "border-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Resend Timer */}
        <div className="text-center text-sm mb-6">
          {secondsLeft > 0 ? (
            <span className="text-gray-400">
              Resend code in{" "}
              <span className="text-blue-600 font-medium tabular-nums">{secondsLeft}s</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-blue-600 font-medium hover:text-blue-700 transition-colors focus:outline-none focus:underline"
            >
              Resend code
            </button>
          )}
        </div>

        {/* Verify Button */}
        <Button variant="primary" size="lg" fullWidth disabled={!isComplete} onClick={handleVerify}>
          Verify
        </Button>
      </Card>
    </div>
  );
}
