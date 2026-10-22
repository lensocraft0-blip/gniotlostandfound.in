import React, { useState } from 'react';
import { PageId } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthRecoveryPageProps {
  onNavigate: (page: PageId) => void;
}

export const AuthRecoveryPage: React.FC<AuthRecoveryPageProps> = ({ onNavigate }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError('Please provide your institutional email address.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.message) {
      setMessage(result.message);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-8 pb-16">
      <div className="rounded-2xl glass-card border border-[#E8EDF2]/15 p-6 sm:p-8 bg-[#1D1020]/90 shadow-2xl space-y-6">
        <button
          onClick={() => onNavigate('login')}
          className="inline-flex items-center gap-1.5 text-xs text-[#BFC8D2] hover:text-[#E8EDF2] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#30152F] border border-[#D9A441]/40 flex items-center justify-center text-[#D9A441]">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-display text-[#E8EDF2]">Password Recovery</h1>
          <p className="text-xs text-[#BFC8D2]">
            Enter your institutional email address to receive password reset and email verification instructions.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#E8EDF2] font-medium mb-1">Institutional Email</label>
            <input
              type="email"
              required
              placeholder="student@gniot.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-[#D9A441] text-[#1D1020] font-semibold text-xs hover:bg-[#F3C35C] transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'Sending Instructions...' : 'Send Recovery Link'}
          </button>
        </form>
      </div>
    </div>
  );
};
