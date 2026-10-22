import React from 'react';
import { PageId } from '../../types/navigation';
import { GniotLogo } from './GniotLogo';
import { Shield, MapPin, Clock } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (page: PageId) => void }> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-[#E8EDF2]/10 bg-[#1D1020] text-[#BFC8D2] text-xs py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Official Identity */}
          <div className="space-y-4">
            <GniotLogo size="md" showSubtitle />
            <p className="text-xs leading-relaxed text-[#BFC8D2]/80">
              Official campus lost and found recovery infrastructure for Greater Noida Institute of Technology students, faculty, and administrative staff.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#D9A441]">
              <Shield className="w-3.5 h-3.5" />
              <span>Institutional Privacy &amp; Claim Verification</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#E8EDF2]">Platform Registry</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavigate('browse')} className="hover:text-[#D9A441] transition-colors">
                  Browse Active Reports
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('report_lost')} className="hover:text-[#D9A441] transition-colors">
                  Report a Lost Item
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('report_found')} className="hover:text-[#D9A441] transition-colors">
                  Report a Found Item
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ai_matches')} className="hover:text-[#D9A441] transition-colors">
                  Heuristic Match Engine
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('visual_search')} className="hover:text-[#D9A441] transition-colors">
                  Visual Search
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Assistance & Rules */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#E8EDF2]">Campus Support</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavigate('aura_assistant')} className="hover:text-[#D9A441] transition-colors">
                  AURA AI Campus Assistant
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('campus_locations')} className="hover:text-[#D9A441] transition-colors">
                  Campus Desks &amp; Locations
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('offline_state')} className="hover:text-[#D9A441] transition-colors">
                  Offline Drafts &amp; Local Vault
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Campus Coordinates */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#E8EDF2]">Central Security Drop-off</h4>
            <div className="flex items-start gap-2 text-[11px] leading-relaxed">
              <MapPin className="w-3.5 h-3.5 text-[#D9A441] shrink-0 mt-0.5" />
              <span>Gate 1 Security Cabin &amp; Admin Block Room 104, Plot No. 7, Knowledge Park II, Greater Noida, UP 201310</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#BFC8D2]/90">
              <Clock className="w-3.5 h-3.5 text-[#D9A441] shrink-0" />
              <span>Mon – Sat: 08:30 AM – 06:00 PM IST</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E8EDF2]/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#BFC8D2]/70">
          <p>© {new Date().getFullYear()} GNIOT Group of Institutions. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Offline-Ready PWA</span>
            <span>·</span>
            <span>Zero-Knowledge Verification</span>
            <span>·</span>
            <span>PostgreSQL &amp; RLS Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
