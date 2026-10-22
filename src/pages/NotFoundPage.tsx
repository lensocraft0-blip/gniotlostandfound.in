import React from 'react';
import { PageId } from '../types/navigation';
import { Compass, ArrowRight, Home } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: PageId) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-md mx-auto py-20 text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-[#30152F] border border-[#D9A441]/40 flex items-center justify-center text-[#D9A441] shadow-2xl">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono text-[#D9A441] uppercase tracking-wider">
          Error 404 · Uncharted Campus Route
        </span>
        <h1 className="text-3xl font-bold font-display text-[#E8EDF2]">
          Page Not Located
        </h1>
        <p className="text-xs text-[#BFC8D2] leading-relaxed">
          The requested campus lost and found route or record does not exist or has been relocated to another section.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 rounded-xl bg-[#D9A441] text-[#1D1020] text-xs font-semibold hover:bg-[#F3C35C] flex items-center gap-1.5 shadow-md"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Campus Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('browse')}
          className="px-4 py-2 rounded-xl border border-[#E8EDF2]/15 bg-[#30152F]/70 text-[#E8EDF2] text-xs font-semibold hover:bg-[#30152F] flex items-center gap-1.5"
        >
          <span>Browse Registry</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
