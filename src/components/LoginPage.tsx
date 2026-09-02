import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (trimmedEmail === 'demo@brainx.com' && trimmedPassword === 'BrainX@123') {
      onLoginSuccess();
    } else {
      setErrorMessage('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF0] text-[#381D2A] flex flex-col justify-between antialiased selection:bg-[#D1D0A3] selection:text-[#381D2A]">
      {/* Top Bar Minimal Brand Header */}
      <header className="w-full bg-[#FFFFFF] border-b border-[#AAA694]/30 px-6 sm:px-12 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            <div
              id="login-brainx-logo"
              className="w-8 h-8 rounded bg-[#381D2A] flex items-center justify-center p-1.5 shadow-xs shrink-0"
              title="BrainX Security Prioritization"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-[#D1D0A3]"
              >
                <path
                  d="M4 6H12M12 6L16 12M12 6V18M16 12L20 18M16 12H8M20 18H4M4 18L8 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="6" r="1.5" fill="#FDFBF0" />
                <circle cx="16" cy="12" r="1.5" fill="#FDFBF0" />
                <circle cx="8" cy="12" r="1.5" fill="#FDFBF0" />
                <circle cx="4" cy="18" r="1.5" fill="#FDFBF0" />
                <circle cx="20" cy="18" r="1.5" fill="#FDFBF0" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-lg tracking-tight text-[#381D2A]">
                BrainX
              </span>
              <span className="text-[11px] font-mono font-medium text-[#857E61] uppercase tracking-wider">
                Prioritization
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#7C6C77] bg-[#FDFBF0] px-2.5 py-1 rounded border border-[#AAA694]/30">
            Security Ops Portal
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-[#FFFFFF] border border-[#AAA694]/40 rounded-lg p-6 sm:p-8 shadow-md space-y-6">
          {/* Heading */}
          <div className="space-y-1.5 border-b border-[#AAA694]/25 pb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#381D2A] tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-[#7C6C77]">
              Sign in to access your cyber incident prioritization queue.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div
              id="login-error-message"
              className="flex items-center gap-2 p-3 rounded bg-[#FDFBF0] border border-[#7C6C77] text-xs font-mono text-[#381D2A]"
            >
              <AlertCircle className="w-4 h-4 text-[#7C6C77] shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email-input"
                className="block text-xs font-mono font-semibold text-[#381D2A]"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#857E61]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder=""
                  className="w-full pl-9 pr-3 py-2 bg-[#FDFBF0] border border-[#AAA694]/40 rounded-md text-xs font-mono text-[#381D2A] placeholder-[#AAA694] focus:outline-none focus:border-[#381D2A] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password-input"
                className="block text-xs font-mono font-semibold text-[#381D2A]"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#857E61]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder=""
                  className="w-full pl-9 pr-10 py-2 bg-[#FDFBF0] border border-[#AAA694]/40 rounded-md text-xs font-mono text-[#381D2A] placeholder-[#AAA694] focus:outline-none focus:border-[#381D2A] transition-colors"
                />
                <button
                  type="button"
                  id="toggle-password-visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7C6C77] hover:text-[#381D2A] transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              id="login-submit-btn"
              type="submit"
              className="w-full py-2.5 px-4 rounded bg-[#381D2A] text-[#FDFBF0] text-xs font-semibold hover:bg-[#381D2A]/90 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer border border-[#381D2A] mt-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D1D0A3]" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#AAA694]/30 px-6 py-4 text-center text-xs font-mono text-[#7C6C77] bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BrainX Incident Prioritization Engine</span>
          <span>Authoritative Six-Factor Scoring</span>
        </div>
      </footer>
    </div>
  );
};
