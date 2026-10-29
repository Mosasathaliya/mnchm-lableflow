import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onLogin: (code: string) => Promise<void>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [accessCode, setAccessCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accessCode.trim()) {
      setError('Please enter the workspace access code.');
      return;
    }

    try {
      setLoading(true);
      await onLogin(accessCode.trim());
    } catch (err: any) {
      setError(err.message || 'Invalid access code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setAccessCode('3056');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06152b] via-[#092244] to-[#040e1d] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background industrial pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#00a3e0_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Branding Container */}
        <div className="text-center">
          <div className="mx-auto w-24 h-24 mb-4 rounded-2xl bg-white shadow-2xl p-2 flex items-center justify-center border border-white/20 transform transition hover:scale-105 duration-300">
            <img
              src="/logo.png"
              alt="MNChem LabelFlow"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            MNChem <span className="text-[#00a3e0]">LabelFlow</span>
          </h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-slate-300 font-semibold">
            Chemical Packaging Label Studio
          </p>
          <div className="mt-2 flex items-center justify-center space-x-1.5 text-xs text-slate-400">
            <span>Modern National Chemicals</span>
            <span>•</span>
            <span>Dammam, KSA</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0b284e]/80 backdrop-blur-md border border-[#163e72] shadow-2xl rounded-2xl p-6 sm:p-8">
          <div className="mb-6 pb-4 border-b border-[#163e72] flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-200">
              <Lock className="w-5 h-5 text-[#00a3e0]" />
              <h2 className="text-base font-semibold">Authorized Access Gate</h2>
            </div>
            <span className="inline-flex items-center text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 mr-1" />
              v1.0 Protected
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-200 text-sm flex items-start space-x-2 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="access-code" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Access Code
              </label>
              <div className="relative rounded-lg shadow-sm">
                <input
                  id="access-code"
                  type={showCode ? 'text' : 'password'}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter 4-digit code"
                  autoFocus
                  required
                  className="block w-full px-4 py-3 bg-[#061833] border border-[#1c4880] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00a3e0] focus:border-transparent font-mono text-lg tracking-widest transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                  tabIndex={-1}
                  aria-label={showCode ? "Hide access code" : "Show access code"}
                >
                  {showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-[#00a3e0] hover:bg-[#028ec5] text-white font-semibold text-sm shadow-lg hover:shadow-cyan-500/20 active:scale-[0.99] transition duration-150 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span>Validating Session...</span>
              ) : (
                <>
                  <span>Enter Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper Hint */}
          <div className="mt-6 pt-4 border-t border-[#163e72]/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-[#00a3e0] mr-1" />
              Shared Access: <strong className="ml-1 text-slate-200">3056</strong>
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[#00a3e0] hover:underline hover:text-cyan-300 font-medium"
            >
              Auto-fill code
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500">
          MNChem Industrial Packaging &copy; {new Date().getFullYear()} Modern National Chemicals.
          <br />A4 Standard Chemical Drum & Container Label System.
        </p>
      </div>
    </div>
  );
};
