import React, { useState } from 'react';
import { PageId } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { CampusRole } from '../types/database';
import { UserCheck, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface OnboardingProfilePageProps {
  onNavigate: (page: PageId) => void;
}

export const OnboardingProfilePage: React.FC<OnboardingProfilePageProps> = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [studentId, setStudentId] = useState(user?.student_identifier || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [campusRole, setCampusRole] = useState<CampusRole>(user?.campus_role || 'student');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      display_name: displayName,
      department,
      student_identifier: studentId,
      phone,
      campus_role: campusRole,
    });
    setSaving(false);
    onNavigate('dashboard');
  };

  return (
    <div className="max-w-xl mx-auto pt-8 pb-16">
      <div className="rounded-2xl glass-card border border-[#E8EDF2]/15 p-6 sm:p-8 bg-[#1D1020]/90 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#30152F] border border-[#D9A441]/40 flex items-center justify-center text-[#D9A441]">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-display text-[#E8EDF2]">Campus Profile Setup</h1>
          <p className="text-xs text-[#BFC8D2]">
            Complete your institutional profile to streamline claim verification and item identification.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#30152F]/40 border border-[#E8EDF2]/10 flex items-start gap-3 text-xs text-[#BFC8D2]">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Your student identifier and phone number are kept private. They are never published openly on public item cards.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#E8EDF2] font-medium mb-1">Campus Role</label>
              <select
                value={campusRole}
                onChange={(e) => setCampusRole(e.target.value as CampusRole)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
                <option value="staff">Administrative Staff</option>
                <option value="admin">Campus Security Officer</option>
              </select>
            </div>

            <div>
              <label className="block text-[#E8EDF2] font-medium mb-1">Student / Staff ID</label>
              <input
                type="text"
                placeholder="GNIOT/2023/CS/..."
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#E8EDF2] font-medium mb-1">Department / Branch</label>
            <input
              type="text"
              placeholder="e.g. Computer Science, Mechanical Engineering, MBA"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#E8EDF2] font-medium mb-1">Contact Phone (Optional - For Safe Handoff)</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="text-xs text-[#BFC8D2] hover:text-[#E8EDF2]"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-5 rounded-lg bg-[#D9A441] text-[#1D1020] font-semibold text-xs hover:bg-[#F3C35C] transition-colors flex items-center gap-2 shadow-md"
            >
              <span>{saving ? 'Saving...' : 'Enter Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
