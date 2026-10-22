import React, { useState } from 'react';
import { PageId } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { CampusRole } from '../types/database';
import { GniotLogo } from '../components/common/GniotLogo';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SignUpPageProps {
  onNavigate: (page: PageId) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { signUp, signInWithGoogle, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [campusRole, setCampusRole] = useState<CampusRole>('student');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password || !displayName.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, displayName, campusRole, studentId);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1500);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    setGoogleLoading(false);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-8 pb-16">
      <div className="rounded-2xl glass-card border border-[#E8EDF2]/15 p-6 sm:p-8 bg-[#1D1020]/95 shadow-2xl space-y-6">
        {/* Official GNIOT Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <GniotLogo size="lg" />
          <div>
            <h1 className="text-2xl font-bold font-display text-[#E8EDF2]">Register Campus Account</h1>
            <p className="text-xs text-[#BFC8D2] mt-1">
              Join the institutional GNIOT Lost &amp; Found network.
            </p>
          </div>
        </div>

        {!isConfigured && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
            <strong>Supabase Setup Required:</strong> To enable real user accounts and session persistence, configure <code className="font-mono text-[#D9A441]">VITE_SUPABASE_URL</code> and <code className="font-mono text-[#D9A441]">VITE_SUPABASE_ANON_KEY</code>.
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Registration successful! Redirecting to campus dashboard...</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-[#E8EDF2]/20 bg-[#30152F]/40 hover:bg-[#30152F] text-[#E8EDF2] text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? 'Connecting...' : 'Sign Up with Google Account'}</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#E8EDF2]/10 w-full" />
          <span className="bg-[#1D1020] px-3 text-[11px] font-mono uppercase text-[#BFC8D2]/60 absolute">
            or register with institutional email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#E8EDF2] font-medium mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ayush Jaiswal"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#E8EDF2] font-medium mb-1">Institutional Email *</label>
            <input
              type="email"
              required
              placeholder="e.g. student@gniot.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#E8EDF2] font-medium mb-1">Password * (min 6 characters)</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#E8EDF2] font-medium mb-1">Campus Role</label>
              <select
                value={campusRole}
                onChange={(e) => setCampusRole(e.target.value as CampusRole)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
                <option value="staff">Campus Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-[#E8EDF2] font-medium mb-1">Student / Staff ID</label>
              <input
                type="text"
                placeholder="GNIOT/..."
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 px-4 rounded-lg bg-[#D9A441] text-[#1D1020] font-semibold text-xs hover:bg-[#F3C35C] transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <span>{loading ? 'Creating Supabase Account...' : 'Register Institutional Profile'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-[#E8EDF2]/10 pt-4 text-center text-xs text-[#BFC8D2]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-[#D9A441] font-semibold hover:underline"
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
};
