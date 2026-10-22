import React, { useState } from 'react';
import { X, Copy, Check, Database, Key, ShieldCheck, Terminal, ExternalLink } from 'lucide-react';
import { getSupabaseConfigStatus } from '../../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'env' | 'schema' | 'rls' | 'storage'>('env');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const status = getSupabaseConfigStatus();

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleEnvText = `# .env or environment configuration
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`;

  const schemaSqlQuick = `-- Run this in Supabase SQL Editor:
-- (Full schema is saved in supabase/migrations/20261022000001_initial_schema.sql)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  campus_role text check (campus_role in ('student', 'faculty', 'staff', 'admin')) default 'student',
  student_identifier text,
  department text,
  avatar_path text,
  phone text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  report_type text check (report_type in ('lost', 'found')) not null,
  title text not null,
  category text not null,
  description text not null,
  brand text,
  color text,
  event_date date,
  event_time text,
  reported_at timestamp with time zone default timezone('utc'::text, now()) not null,
  campus_location text not null,
  campus_zone text,
  image_paths text[] default array[]::text[],
  status text check (status in ('open', 'potential_match', 'claimed', 'resolved', 'archived')) default 'open',
  contact_preference text check (contact_preference in ('in_app', 'email', 'helpdesk')) default 'in_app',
  private_verification_question text,
  private_verification_answer text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.items(id) on delete cascade not null,
  claimant_id uuid references auth.users(id) on delete cascade not null,
  private_verification_answers text not null,
  evidence_paths text[] default array[]::text[],
  status text check (status in ('pending', 'under_review', 'approved', 'rejected')) default 'pending',
  reviewer_id uuid references auth.users(id) on delete set null,
  reviewer_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('match_found', 'claim_submitted', 'claim_approved', 'claim_rejected', 'status_changed', 'admin_notice')) not null,
  title text not null,
  message text not null,
  related_item_id uuid references public.items(id) on delete set null,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  safe_metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-2xl glass-card border border-[#E8EDF2]/15 bg-[#1D1020] text-[#E8EDF2] p-6 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8EDF2]/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#30152F] border border-[#D9A441]/40 flex items-center justify-center text-[#D9A441]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold font-display text-[#E8EDF2]">
                Supabase Connection &amp; Migration Guide
              </h2>
              <p className="text-xs text-[#BFC8D2]">
                Current status:{' '}
                {status.configured ? (
                  <span className="text-emerald-400 font-medium">Connected to {status.projectHost}</span>
                ) : (
                  <span className="text-[#D9A441] font-medium">
                    Running in Interactive Sandbox Mode (No production keys set)
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#BFC8D2] hover:text-white hover:bg-[#30152F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E8EDF2]/10 mt-4 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('env')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 ${
              activeTab === 'env'
                ? 'border-[#D9A441] text-[#D9A441]'
                : 'border-transparent text-[#BFC8D2] hover:text-[#E8EDF2]'
            }`}
          >
            1. Credentials &amp; Env
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 ${
              activeTab === 'schema'
                ? 'border-[#D9A441] text-[#D9A441]'
                : 'border-transparent text-[#BFC8D2] hover:text-[#E8EDF2]'
            }`}
          >
            2. Database Schema
          </button>
          <button
            onClick={() => setActiveTab('rls')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 ${
              activeTab === 'rls'
                ? 'border-[#D9A441] text-[#D9A441]'
                : 'border-transparent text-[#BFC8D2] hover:text-[#E8EDF2]'
            }`}
          >
            3. RLS Policies
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 ${
              activeTab === 'storage'
                ? 'border-[#D9A441] text-[#D9A441]'
                : 'border-transparent text-[#BFC8D2] hover:text-[#E8EDF2]'
            }`}
          >
            4. Storage &amp; Auth URL
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 text-xs space-y-4">
          {activeTab === 'env' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#30152F]/40 border border-[#E8EDF2]/10 space-y-2">
                <h4 className="font-semibold text-sm text-[#E8EDF2] flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-[#D9A441]" /> Step 1: Create Supabase Project &amp; Get Keys
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-[#BFC8D2] leading-relaxed">
                  <li>Go to <span className="text-[#E8EDF2] font-mono">supabase.com</span> and create a new project.</li>
                  <li>In your Supabase project dashboard, navigate to <strong>Project Settings &rarr; API</strong>.</li>
                  <li>Copy the <strong>Project URL</strong> and <strong>anon / public key</strong>.</li>
                  <li>Add them to your environment (or AI Studio Secrets) as:</li>
                </ol>
              </div>

              <div className="relative rounded-xl bg-[#130b15] p-3 font-mono text-[11px] border border-[#E8EDF2]/10 text-[#E8EDF2]">
                <pre>{sampleEnvText}</pre>
                <button
                  onClick={() => handleCopy(sampleEnvText, 'env')}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-[#30152F] text-xs text-[#E8EDF2] hover:bg-[#30152F]/80 border border-[#E8EDF2]/10"
                >
                  {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'env' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <p className="text-[#BFC8D2]">
                Execute the following PostgreSQL script in the Supabase <strong>SQL Editor</strong> to provision the 5 core tables and indexes:
              </p>
              <div className="relative rounded-xl bg-[#130b15] p-3 font-mono text-[11px] border border-[#E8EDF2]/10 text-[#E8EDF2] max-h-64 overflow-y-auto">
                <pre>{schemaSqlQuick}</pre>
                <button
                  onClick={() => handleCopy(schemaSqlQuick, 'schema')}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-[#30152F] text-xs text-[#E8EDF2] hover:bg-[#30152F]/80 border border-[#E8EDF2]/10"
                >
                  {copiedKey === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'schema' ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#BFC8D2]/80">
                Full file is also located at: <span className="font-mono text-[#D9A441]">supabase/migrations/20261022000001_initial_schema.sql</span>
              </p>
            </div>
          )}

          {activeTab === 'rls' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#30152F]/40 border border-[#E8EDF2]/10">
                <h4 className="font-semibold text-sm text-[#E8EDF2] flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Row Level Security (RLS) Rules
                </h4>
                <ul className="list-disc list-inside space-y-1 text-[#BFC8D2] leading-relaxed">
                  <li><strong>Profiles:</strong> Users can update only their own profile fields. Client-side role cannot grant admin status.</li>
                  <li><strong>Items:</strong> Public read access; authenticated users insert their own items; only owners or admins can edit/delete.</li>
                  <li><strong>Claims:</strong> Private verification answers visible strictly to claimant, item owner, and authorized admins.</li>
                  <li><strong>Audit Logs:</strong> Viewable exclusively by authorized administrators.</li>
                </ul>
              </div>
              <p className="text-[11px] text-[#BFC8D2]">
                RLS migration script is located at: <span className="font-mono text-[#D9A441]">supabase/migrations/20261022000002_rls_policies.sql</span>
              </p>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#30152F]/40 border border-[#E8EDF2]/10 space-y-2">
                <h4 className="font-semibold text-sm text-[#E8EDF2]">Storage Bucket Setup</h4>
                <p className="text-[#BFC8D2] leading-relaxed">
                  In Supabase Dashboard &rarr; <strong>Storage</strong>, create a bucket named <span className="font-mono text-[#E8EDF2]">item-photos</span> with Public access enabled so item images can be safely previewed.
                </p>
                <h4 className="font-semibold text-sm text-[#E8EDF2] pt-2">Site URL &amp; Redirects (For GitHub Pages)</h4>
                <p className="text-[#BFC8D2] leading-relaxed">
                  In Supabase Dashboard &rarr; <strong>Authentication &rarr; URL Configuration</strong>, set:
                </p>
                <div className="bg-[#130b15] p-2 rounded font-mono text-[11px] text-[#D9A441]">
                  https://ayushjaiswal272008-star.github.io/gniot-lost-and-found/
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E8EDF2]/10 pt-3 flex justify-between items-center text-xs">
          <span className="text-[#BFC8D2]">
            Need help? Check the <span className="font-mono text-[#D9A441]">.env.example</span> file in project root.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#D9A441] text-[#1D1020] font-semibold hover:bg-[#F3C35C] transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
