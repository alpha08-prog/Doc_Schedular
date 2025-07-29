"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";

interface LoginForm {
  login: string;
  password?: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.login, password: data.password })
      });
      const result = await res.json();
      if (result.success) {
        document.cookie = "auth=true; path=/; max-age=86400";
        router.push('/');
      } else {
        setLoginError(result.error || 'Login failed');
      }
    } catch {
      setLoginError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F3F7FF] to-[#E9F1FF] font-sans">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] p-8 sm:p-10 md:p-16 lg:p-20">
        {/* Greeting */}
        <div className="mb-2 text-xs md:text-sm text-gray-500">
          Hi there welcome too <span className="text-primary font-semibold">Shedula</span>
        </div>
        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">Login</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Input */}
          <div>
            <input
              type="text"
              {...register("login", { required: "Required" })}
              placeholder="login with email or mobile number"
              className="w-full px-3 py-2 md:py-3 md:text-base rounded-xl border border-gray-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm placeholder-gray-400 outline-none transition"
              style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, sans-serif' }}
              onChange={e => {
                const value = e.target.value;
                setShowPassword(value.includes("@"));
                // Let react-hook-form handle the value
                register("login").onChange(e);
              }}
            />
            {errors.login && (
              <span className="text-xs text-red-500 mt-1 block">{errors.login.message as string}</span>
            )}
          </div>
          {showPassword && (
            <div>
              <input
                type="password"
                {...register("password", { required: "Password required" })}
                placeholder="Password"
                className="w-full px-3 py-2 md:py-3 md:text-base rounded-xl border border-gray-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm placeholder-gray-400 outline-none transition mt-3"
                style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, sans-serif' }}
              />
              {errors.password && (
                <span className="text-xs text-red-500 mt-1 block">{errors.password.message as string}</span>
              )}
            </div>
          )}
          {loginError && <span className="text-xs text-red-500 mt-1 block">{loginError}</span>}
          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs mb-2 gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-primary rounded" />
              <span className="text-gray-500">Remember Me</span>
            </label>
            <a href="#" className="text-pink-400 font-medium hover:underline">Forgot Password</a>
          </div>
          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-primary text-white font-semibold py-2 md:py-3 rounded-xl shadow-md hover:bg-[#3bb2cb] transition text-sm md:text-base flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, sans-serif' }}
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : null}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {/* Login with Phone Number Button */}
        <button
          type="button"
          onClick={() => router.push('/otp')}
          className="w-full mt-2 bg-white border border-primary text-primary font-semibold py-2 md:py-3 rounded-xl shadow-sm hover:bg-blue-50 transition text-sm md:text-base"
          style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, sans-serif' }}
        >
          Login with Phone Number
        </button>
        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-3 text-gray-400 text-xs">Or login With</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        {/* Google Button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-xl py-2 md:py-3 font-medium text-gray-700 hover:bg-gray-50 transition text-sm md:text-base mb-2"
          style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, sans-serif' }}
        >
          <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} className="w-5 h-5" />
          Continue with Google
        </button>
        {/* Sign Up Link */}
        <div className="mt-6 text-center text-xs md:text-sm text-gray-500">
          Don’t have an account?{' '}
          <a href="#" className="text-primary font-semibold hover:underline">Sign Up</a>
        </div>
      </div>
    </div>
  );
} 