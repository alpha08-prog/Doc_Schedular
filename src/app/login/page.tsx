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
        router.push('/booking'); // Redirect to booking page
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 animate-fade-in">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 000-6.364L12 4.636 4.318 6.318z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your <span className="text-gradient font-semibold">Doc Scheduler</span> account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email/Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email or Phone</label>
              <input
                type="text"
                {...register("login", { required: "Email or phone is required" })}
                placeholder="Enter your email or mobile number"
                className="input-field"
                onChange={(e) => {
                  const value = e.target.value;
                  setShowPassword(value.includes("@"));
                  register("login").onChange(e);
                }}
              />
              {errors.login && (
                <span className="text-xs text-red-500 mt-1 block">{errors.login.message as string}</span>
              )}
            </div>
            
            {/* Password Input */}
            {showPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  {...register("password", { required: "Password is required" })}
                  placeholder="Enter your password"
                  className="input-field"
                />
                {errors.password && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.password.message as string}</span>
                )}
              </div>
            )}
            
            {loginError && (
              <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">
                {loginError}
              </div>
            )}
            
            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-500 font-medium">Forgot password?</a>
            </div>
            
            {/* Login Button */}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          {/* Alternative Login Options */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => router.push('/otp')}
              className="btn-secondary w-full mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Login with Phone Number
            </button>
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            {/* Google Button */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              <Image 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                alt="Google" 
                width={20} 
                height={20} 
                className="w-5 h-5" 
              />
              Continue with Google
            </button>
          </div>
          
          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 