'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Dumbbell, Mail, ArrowLeft, ArrowRight, Check, KeyRound, Lock, Eye, EyeOff
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send reset code');
      } else {
        setStep('code');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid code');
      } else {
        setStep('reset');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
      } else {
        setStep('success');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>

          {/* Card */}
          <div className="relative">
            {/* Animated gradient border */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 rounded-3xl blur-lg opacity-50 animate-pulse pointer-events-none" />

            <div className="relative bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden">
              {/* Header gradient */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-orange-500/20 via-pink-500/10 to-transparent pointer-events-none" />

              <div className="relative p-8">
                {/* Logo and Title */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl blur-lg opacity-50 pointer-events-none" />
                    <div className="relative w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center">
                      {step === 'success' ? (
                        <Check className="w-7 h-7 text-white" />
                      ) : step === 'reset' ? (
                        <Lock className="w-7 h-7 text-white" />
                      ) : step === 'code' ? (
                        <KeyRound className="w-7 h-7 text-white" />
                      ) : (
                        <Mail className="w-7 h-7 text-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      {step === 'success' && 'Password Reset!'}
                      {step === 'reset' && 'New Password'}
                      {step === 'code' && 'Enter Code'}
                      {step === 'email' && 'Reset Password'}
                    </h2>
                    <p className="text-zinc-400">
                      {step === 'success' && 'You can now sign in'}
                      {step === 'reset' && 'Choose a strong password'}
                      {step === 'code' && 'Check your email inbox'}
                      {step === 'email' && "We'll send you a reset code"}
                    </p>
                  </div>
                </div>

                {/* Step 1: Email */}
                {step === 'email' && (
                  <form onSubmit={handleSendCode} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl opacity-0 group-focus-within:opacity-50 blur transition-opacity pointer-events-none" />
                        <div className="relative flex items-center">
                          <Mail className="absolute left-4 w-5 h-5 text-zinc-500 pointer-events-none" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all"
                            placeholder="you@example.com"
                            autoComplete="email"
                            autoFocus
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="relative w-full group"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold py-4 rounded-xl text-lg">
                        {loading ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Send Reset Code
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </button>
                  </form>
                )}

                {/* Step 2: Code Verification */}
                {step === 'code' && (
                  <form onSubmit={handleVerifyCode} className="space-y-5">
                    <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-sm mb-4">
                      We sent a 6-digit code to <strong>{email}</strong>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Verification Code</label>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl opacity-0 group-focus-within:opacity-50 blur transition-opacity pointer-events-none" />
                        <div className="relative flex items-center">
                          <KeyRound className="absolute left-4 w-5 h-5 text-zinc-500 pointer-events-none" />
                          <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all text-center text-2xl tracking-[0.5em] font-mono"
                            placeholder="000000"
                            maxLength={6}
                            autoFocus
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || code.length !== 6}
                      className="relative w-full group disabled:opacity-50"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold py-4 rounded-xl text-lg">
                        {loading ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Verify Code
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="w-full text-center text-zinc-400 hover:text-white transition-colors text-sm"
                    >
                      Didn't receive it? Try again
                    </button>
                  </form>
                )}

                {/* Step 3: New Password */}
                {step === 'reset' && (
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">New Password</label>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl opacity-0 group-focus-within:opacity-50 blur transition-opacity pointer-events-none" />
                        <div className="relative flex items-center">
                          <Lock className="absolute left-4 w-5 h-5 text-zinc-500 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full pl-12 pr-12 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all"
                            placeholder="Min 8 characters"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 text-zinc-500 hover:text-zinc-300 z-10"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Confirm Password</label>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl opacity-0 group-focus-within:opacity-50 blur transition-opacity pointer-events-none" />
                        <div className="relative flex items-center">
                          <Lock className="absolute left-4 w-5 h-5 text-zinc-500 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all"
                            placeholder="Confirm password"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="relative w-full group"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold py-4 rounded-xl text-lg">
                        {loading ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Reset Password
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </button>
                  </form>
                )}

                {/* Step 4: Success */}
                {step === 'success' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-zinc-400">
                        Your password has been successfully reset. You can now sign in with your new password.
                      </p>
                    </div>

                    <button
                      onClick={() => router.push('/login')}
                      className="relative w-full group"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold py-4 rounded-xl text-lg">
                        Sign In Now
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  </div>
                )}

                {/* Progress indicator */}
                {step !== 'success' && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {['email', 'code', 'reset'].map((s, i) => (
                      <div
                        key={s}
                        className={`h-2 rounded-full transition-all ${
                          s === step
                            ? 'w-8 bg-gradient-to-r from-orange-500 to-pink-500'
                            : ['email', 'code', 'reset'].indexOf(step) > i
                              ? 'w-2 bg-orange-500'
                              : 'w-2 bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security note */}
          <p className="text-center text-zinc-500 text-sm mt-6">
            Need help? Contact{' '}
            <a href="mailto:support@snapfit.com" className="text-orange-400 hover:text-orange-300">
              support@snapfit.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
