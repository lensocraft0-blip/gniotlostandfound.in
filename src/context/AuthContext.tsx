import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, CampusRole } from '../types/database';

interface AuthContextType {
  user: UserProfile | null;
  email: string | null;
  loading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    campusRole?: CampusRole,
    studentId?: string
  ) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configured administrator email list from environment
const rawAdminEmails = (import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase();
const ALLOWED_ADMIN_EMAILS = new Set(
  rawAdminEmails
    .split(',')
    .map((e: string) => e.trim())
    .filter(Boolean)
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to verify if an authenticated user holds administrative authority
  const verifyAdminStatus = (userEmail?: string | null, profileAdminFlag?: boolean): boolean => {
    if (profileAdminFlag === true) return true;
    if (userEmail && ALLOWED_ADMIN_EMAILS.has(userEmail.toLowerCase())) return true;
    return false;
  };

  useEffect(() => {
    async function initSession() {
      if (!isSupabaseConfigured || !supabase) {
        setUser(null);
        setEmail(null);
        setLoading(false);
        return;
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('Session retrieval error:', sessionError.message);
        }

        if (session?.user) {
          const userEmail = session.user.email || null;
          setEmail(userEmail);

          // Retrieve genuine profile from Supabase PostgreSQL
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const hasAdminAuthority = verifyAdminStatus(userEmail, profile?.is_admin);

          if (profile && !profileError) {
            setUser({
              ...profile,
              email: userEmail || undefined,
              is_admin: hasAdminAuthority,
            } as UserProfile);
          } else {
            // Profile entry created from Supabase auth user metadata
            setUser({
              id: session.user.id,
              email: userEmail || undefined,
              display_name: session.user.user_metadata?.full_name || userEmail?.split('@')[0] || 'GNIOT Member',
              campus_role: (session.user.user_metadata?.campus_role as CampusRole) || 'student',
              is_admin: hasAdminAuthority,
              created_at: session.user.created_at,
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          setUser(null);
          setEmail(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }

      // Real-time auth state listener
      const client = supabase;
      const { data: authListener } = client.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const userEmail = session.user.email || null;
          setEmail(userEmail);

          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const hasAdmin = verifyAdminStatus(userEmail, profile?.is_admin);

          if (profile) {
            setUser({
              ...profile,
              email: userEmail || undefined,
              is_admin: hasAdmin,
            } as UserProfile);
          } else {
            setUser({
              id: session.user.id,
              email: userEmail || undefined,
              display_name: session.user.user_metadata?.full_name || userEmail?.split('@')[0] || 'GNIOT Member',
              campus_role: (session.user.user_metadata?.campus_role as CampusRole) || 'student',
              is_admin: hasAdmin,
              created_at: session.user.created_at,
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          setUser(null);
          setEmail(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }

    initSession();
  }, []);

  const signIn = async (inputEmail: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase credentials missing. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable authentication.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: inputEmail.trim(),
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  };

  const signUp = async (
    inputEmail: string,
    password: string,
    displayName: string,
    campusRole: CampusRole = 'student',
    studentId?: string
  ) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase credentials missing. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable registration.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: inputEmail.trim(),
      password,
      options: {
        data: {
          full_name: displayName.trim(),
          campus_role: campusRole,
          student_identifier: studentId?.trim(),
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase credentials missing. Please configure Supabase to use Google sign-in.' };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setEmail(null);
  };

  const resetPassword = async (targetEmail: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured. Add credentials to send recovery emails.' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(targetEmail.trim(), {
      redirectTo: window.location.origin + window.location.pathname + '#/auth_recovery',
    });

    if (error) {
      return { error: error.message };
    }

    return { message: 'Password recovery email sent. Please check your inbox for instructions.' };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !supabase || !isSupabaseConfigured) {
      return { error: 'Authentication required' };
    }

    // Never allow updating is_admin via client
    const safeUpdates = { ...updates };
    delete safeUpdates.is_admin;
    delete safeUpdates.id;

    const { error } = await supabase
      .from('profiles')
      .update({ ...safeUpdates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      return { error: error.message };
    }

    setUser({ ...user, ...safeUpdates });
    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        email,
        loading,
        isConfigured: isSupabaseConfigured,
        isAdmin: Boolean(user?.is_admin),
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
