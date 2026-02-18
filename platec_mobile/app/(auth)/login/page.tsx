'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        router.replace('/dashboard');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen-safe bg-[#F9FAFB] flex flex-col">
      {/* Content */}
      <div className="flex-1 flex flex-col px-4 pt-20 pb-8 safe-area-top safe-area-bottom">
        {/* Logo & Welcome */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#7357C6] rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#111827] mb-2">Welcome back</h1>
          <p className="text-[#6B7280]">Sign in to check your attendance</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in stagger-1">
          {error && (
            <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg">
              <p className="text-[#991B1B] text-sm text-center">{error}</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#374151]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full px-3 py-3 bg-white border border-[#D1D5DB] rounded-lg text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[#7357C6]"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#374151]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-3 bg-white border border-[#D1D5DB] rounded-lg text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[#7357C6]"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#7357C6] text-white font-medium text-base rounded-lg border border-[#7357C6] hover:bg-[#5d44a8] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-auto pt-8 text-center animate-fade-in stagger-2">
          <p className="text-[#6B7280] text-sm">
            Student Attendance Management System
          </p>
        </div>
      </div>
    </div>
  );
}
