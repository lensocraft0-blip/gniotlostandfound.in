import React, { useState } from 'react';
import { PageId } from '../types/navigation';
import {
  GNIOT_CAMPUS_LOCATIONS,
  GNIOT_CAMPUS_ZONES,
  GNIOT_HELPDESKS,
  CAMPUS_RULES_AND_FAQS,
} from '../config/campus';
import { MapPin, Clock, ShieldCheck, ChevronDown, ChevronUp, PlusCircle, Building2 } from 'lucide-react';
import gniotCampusAerial from '../assets/images/gniot_campus_aerial.png';

interface CampusLocationsPageProps {
  onNavigate: (page: PageId, itemId?: string) => void;
}

export const CampusLocationsPage: React.FC<CampusLocationsPageProps> = ({ onNavigate }) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="space-y-10 pb-16">
      <div>
        <h1 className="text-3xl font-bold font-display text-[#E8EDF2]">
          Campus Locations &amp; Recovery Desks
        </h1>
        <p className="text-xs text-[#BFC8D2] mt-0.5">
          Directory of official physical drop-off points and designated zones across GNIOT Greater Noida.
        </p>
      </div>

      {/* Campus Aerial Overview Card */}
      <div className="relative rounded-2xl overflow-hidden border border-[#E8EDF2]/15 bg-[#1D1020] shadow-2xl">
        <div className="relative h-64 sm:h-72 w-full overflow-hidden">
          <img
            src={gniotCampusAerial}
            alt="Original GNIOT Group of Institutions Campus Aerial View"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1D1020] via-[#1D1020]/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#D9A441] font-bold tracking-wider">
                ORIGINAL CAMPUS PANORAMA
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-[#E8EDF2]">
                GNIOT Knowledge Park II, Greater Noida
              </h2>
              <p className="text-xs text-[#BFC8D2] max-w-xl mt-0.5">
                Covering Academic Blocks A, B, and C, Central Computer Center, Central Library, and Student Hostel Quads.
              </p>
            </div>
            <button
              onClick={() => onNavigate('report_lost')}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#D9A441] text-[#1D1020] font-semibold text-xs hover:bg-[#F3C35C] transition-colors shadow-lg shrink-0 flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Item at Campus</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Help Desks Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-[#E8EDF2]">
          Authorized Campus Lost Property Desks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {GNIOT_HELPDESKS.map((desk, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl glass-card border border-[#E8EDF2]/10 bg-[#1D1020]/90 space-y-3 text-xs"
            >
              <div className="flex items-center gap-2 text-[#D9A441] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-display text-sm text-[#E8EDF2]">{desk.name}</span>
              </div>

              <div className="space-y-1.5 text-[#BFC8D2]">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D9A441] shrink-0 mt-0.5" />
                  <span>{desk.location}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#BFC8D2] shrink-0 mt-0.5" />
                  <span>{desk.operatingHours}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#BFC8D2]/80 leading-relaxed border-t border-[#E8EDF2]/10 pt-2">
                {desk.notes}
              </p>

              <div className="pt-1">
                <span className="text-[10px] font-mono text-emerald-400">
                  Verified Institutional Desk
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Zones Directory */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-[#E8EDF2]">
          GNIOT Campus Zones &amp; Academic Blocks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {GNIOT_CAMPUS_LOCATIONS.map((loc, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl glass-card border border-[#E8EDF2]/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D9A441]" />
                <span className="text-[#E8EDF2] font-medium">{loc}</span>
              </div>
              <button
                onClick={() => onNavigate('report_lost')}
                className="text-[11px] text-[#D9A441] hover:underline"
              >
                Report Here
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Regulations & FAQs */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-[#E8EDF2]">
          Campus Recovery Regulations
        </h2>
        <div className="space-y-3">
          {CAMPUS_RULES_AND_FAQS.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl glass-card border border-[#E8EDF2]/10 overflow-hidden text-xs"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-semibold text-[#E8EDF2] flex items-center justify-between hover:bg-[#30152F]/40 transition-colors"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#D9A441]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#BFC8D2]" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-[#BFC8D2] leading-relaxed border-t border-[#E8EDF2]/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
