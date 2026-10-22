import React, { useState } from 'react';
import { PageId } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Download, Trash2, CheckCircle2 } from 'lucide-react';

interface UserProfilePageProps {
  onNavigate: (page: PageId) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ onNavigate }) => {
  const { user, email, updateProfile, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      display_name: displayName,
      department,
      phone,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(user, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `gniot_user_profile_${user?.id || 'export'}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-bold font-display text-[#E8EDF2]">Profile &amp; Settings</h1>
        <p className="text-xs text-[#BFC8D2] mt-0.5">
          Manage your campus identity, privacy settings, and data exports.
        </p>
      </div>

      <div className="rounded-2xl glass-card border border-[#E8EDF2]/15 p-6 sm:p-8 bg-[#1D1020]/90 shadow-2xl space-y-6">
        <div className="flex items-center gap-4 border-b border-[#E8EDF2]/10 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D9A441] to-[#30152F] flex items-center justify-center text-[#1D1020] font-black text-2xl shadow-xl">
            {user?.display_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-display text-[#E8EDF2]">{user?.display_name}</h2>
            <p className="text-xs text-[#BFC8D2]">{email}</p>
            <span className="inline-block text-[10px] font-mono uppercase bg-[#30152F] text-[#D9A441] px-2 py-0.5 rounded border border-[#D9A441]/30">
              {user?.campus_role?.toUpperCase()} {user?.is_admin ? '· AUTHORIZED ADMIN' : ''}
            </span>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Profile information updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#E8EDF2] font-medium mb-1">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#E8EDF2] font-medium mb-1">Student / Staff ID (Private)</label>
            <input
              type="text"
              disabled
              value={user?.student_identifier || 'Not set'}
              className="w-full px-3 py-2.5 rounded-lg bg-[#130b15]/50 border border-[#E8EDF2]/10 text-[#BFC8D2] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[#E8EDF2] font-medium mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#E8EDF2] font-medium mb-1">Safe Contact Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#D9A441] text-[#1D1020] font-semibold text-xs hover:bg-[#F3C35C] transition-colors shadow-md"
            >
              Save Profile Changes
            </button>
          </div>
        </form>

        {/* Data & Privacy Actions */}
        <div className="border-t border-[#E8EDF2]/10 pt-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#E8EDF2]">Data Sovereignty &amp; Privacy</h3>
          <p className="text-xs text-[#BFC8D2] leading-relaxed">
            In compliance with student data protections, your private verification answers, contact numbers, and student IDs are never indexed publicly. You can export or delete your profile at any time.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleExportData}
              className="px-3.5 py-2 rounded-lg border border-[#E8EDF2]/15 text-xs text-[#E8EDF2] hover:bg-[#30152F] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#D9A441]" />
              <span>Export My Data (JSON)</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Sign out of your session on this device?')) {
                  signOut();
                  onNavigate('landing');
                }
              }}
              className="px-3.5 py-2 rounded-lg border border-red-500/20 text-xs text-red-400 hover:bg-red-500/10"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
