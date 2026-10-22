import React, { useEffect, useState } from 'react';
import { PageId } from '../types/navigation';
import { ItemReport } from '../types/database';
import { DataService } from '../services/dataService';
import { CampusHeroScene } from '../components/3d/CampusHeroScene';
import { ItemCard } from '../components/items/ItemCard';
import { GniotLogo } from '../components/common/GniotLogo';
import gniotCampusAerial from '../assets/images/gniot_campus_aerial.png';
import smartCampusKiosk from '../assets/images/smart_campus_kiosk_1792676762354.jpg';
import { Search, PlusCircle, CheckCircle2, Shield, Sparkles, MapPin, ArrowRight, ArrowUpRight, Cpu, PackageOpen } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: PageId, itemId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [recentItems, setRecentItems] = useState<ItemReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getItems()
      .then((items) => {
        setRecentItems(items.slice(0, 4));
      })
      .catch((err) => {
        console.warn('Could not load landing recent items:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('browse');
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <GniotLogo size="sm" />
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#D9A441] tracking-wider uppercase bg-[#30152F]/70 px-3 py-1.5 rounded-md border border-[#D9A441]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
                <span>Knowledge Park II Campus Recovery</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#E8EDF2] font-display text-balance leading-[1.1]">
              Reuniting Campus Belongings with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D9A441] via-[#F3C35C] to-[#E8EDF2]">
                Intelligent Precision
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#BFC8D2] leading-relaxed max-w-2xl">
              Official institutional lost &amp; found registry for GNIOT students, faculty, and administrative security. Built with 3D spatial indexing, multi-attribute heuristic matching, and private zero-knowledge claim verification.
            </p>

            {/* Quick Search */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl flex items-center gap-2 p-1.5 rounded-xl glass-card border border-[#E8EDF2]/15 bg-[#1D1020]/80 shadow-xl">
              <Search className="w-5 h-5 text-[#BFC8D2] ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search lost calculator, ID card, keys, earbuds, bottles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-2 py-2 text-sm text-[#E8EDF2] placeholder-[#BFC8D2]/50 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#D9A441] text-[#1D1020] text-xs font-semibold hover:bg-[#F3C35C] transition-colors whitespace-nowrap shrink-0"
              >
                Search Registry
              </button>
            </form>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('report_lost')}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#D9A441] to-[#c79133] text-[#1D1020] font-semibold text-sm hover:brightness-110 transition shadow-lg flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Lost Item</span>
              </button>

              <button
                onClick={() => onNavigate('report_found')}
                className="px-5 py-3 rounded-xl border border-[#E8EDF2]/20 bg-[#30152F]/70 text-[#E8EDF2] font-semibold text-sm hover:border-[#D9A441]/50 hover:bg-[#30152F] transition flex items-center gap-2"
              >
                <span>Report Found Item</span>
                <ArrowRight className="w-4 h-4 text-[#D9A441]" />
              </button>

              <button
                onClick={() => onNavigate('visual_search')}
                className="px-4 py-3 rounded-xl text-xs font-medium text-[#BFC8D2] hover:text-[#E8EDF2] flex items-center gap-1.5"
              >
                <Cpu className="w-4 h-4 text-[#D9A441]" />
                <span>Visual Match Search</span>
              </button>
            </div>
          </div>

          {/* Right Column: 3D Scene */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl glass-card border border-[#E8EDF2]/15 p-2 bg-gradient-to-b from-[#30152F]/40 to-[#1D1020]/90 shadow-2xl">
              <CampusHeroScene />
            </div>
          </div>
        </div>
      </section>

      {/* Campus Identity & Location Showcase */}
      <section className="rounded-2xl glass-card border border-[#E8EDF2]/10 p-6 sm:p-8 bg-[#30152F]/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-mono text-[#D9A441] tracking-wider uppercase">
              Location · Plot No. 7, Knowledge Park II, Greater Noida
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#E8EDF2]">
              Knowledge Park II Campus Integration
            </h2>
            <p className="text-sm text-[#BFC8D2] leading-relaxed">
              Serving Academic Blocks A, B, and C, the Central Library, student cafeteria, hostel quads, and Gate 1 security desk with indexed campus zones.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('campus_locations')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#D9A441] hover:underline"
              >
                <span>View Campus Help Desks &amp; Map Coordinates</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group relative rounded-xl overflow-hidden aspect-[4/3] border border-[#E8EDF2]/10 bg-[#130b15] shadow-lg">
              <img
                src={gniotCampusAerial}
                alt="Original GNIOT Group of Institutions Campus Aerial - Greater Noida"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                <span className="text-[11px] font-medium text-[#E8EDF2] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D9A441]" />
                  <span>GNIOT Main Campus &amp; Academic Blocks</span>
                </span>
              </div>
            </div>
            <div className="group relative rounded-xl overflow-hidden aspect-[4/3] border border-[#E8EDF2]/10 bg-[#130b15] shadow-lg">
              <img
                src={smartCampusKiosk}
                alt="Campus Lost &amp; Found Recovery Helpdesk"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                <span className="text-[11px] font-medium text-[#E8EDF2] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#D9A441]" />
                  <span>Main Gate 1 Security Lost Property Desk</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#E8EDF2]">
            Transparent Recovery Workflow
          </h2>
          <p className="text-xs sm:text-sm text-[#BFC8D2]">
            Designed to protect student privacy and prevent fraudulent claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-card border border-[#E8EDF2]/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#30152F] border border-[#D9A441]/40 flex items-center justify-center text-[#D9A441] font-mono font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-semibold text-[#E8EDF2] font-display">1. File Report with Specifics</h3>
            <p className="text-xs text-[#BFC8D2] leading-relaxed">
              Submit your lost or found item with category, brand, color, approximate campus zone, and optional photo. Works offline with automatic draft preservation.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-[#E8EDF2]/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#30152F] border border-[#D9A441]/40 flex items-center justify-center text-[#D9A441] font-mono font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-semibold text-[#E8EDF2] font-display">2. Multi-Stage Heuristic Matching</h3>
            <p className="text-xs text-[#BFC8D2] leading-relaxed">
              Our transparent matcher scores category, keywords, brand, location, and date proximity, applying penalties for contradictions.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-[#E8EDF2]/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#30152F] border border-[#D9A441]/40 flex items-center justify-center text-[#D9A441] font-mono font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-semibold text-[#E8EDF2] font-display">3. Zero-Knowledge Claim Verification</h3>
            <p className="text-xs text-[#BFC8D2] leading-relaxed">
              Claimants submit non-public verification details. Authorized campus reviewers evaluate proof before custody handover.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Campus Reports */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display text-[#E8EDF2]">Recent Campus Reports</h2>
            <p className="text-xs text-[#BFC8D2] mt-0.5">Live records from the GNIOT database</p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="text-xs font-semibold text-[#D9A441] hover:underline flex items-center gap-1"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-64 rounded-xl glass-card animate-pulse border border-[#E8EDF2]/10 bg-[#30152F]/20"
              />
            ))}
          </div>
        ) : recentItems.length === 0 ? (
          <div className="p-10 rounded-2xl glass-card border border-[#E8EDF2]/10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#30152F] flex items-center justify-center text-[#BFC8D2]">
              <PackageOpen className="w-6 h-6 text-[#D9A441]" />
            </div>
            <p className="text-sm font-semibold text-[#E8EDF2]">Registry Database is Currently Clean</p>
            <p className="text-xs text-[#BFC8D2] max-w-sm mx-auto">
              No reports have been submitted yet. Log the first lost or found item on campus!
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => onNavigate('report_lost')}
                className="px-4 py-2 rounded-lg bg-[#D9A441] text-[#1D1020] text-xs font-semibold hover:bg-[#F3C35C]"
              >
                Report Lost Item
              </button>
              <button
                onClick={() => onNavigate('report_found')}
                className="px-4 py-2 rounded-lg border border-[#E8EDF2]/20 bg-[#30152F] text-xs text-[#E8EDF2]"
              >
                Report Found Item
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onSelect={(selected) => onNavigate('item_details', selected.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Offline & PWA Security Callout */}
      <section className="p-8 rounded-2xl glass-card border border-[#D9A441]/30 bg-gradient-to-r from-[#30152F]/70 via-[#1D1020] to-[#30152F]/70 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-[#D9A441]">
            <Shield className="w-4 h-4" />
            <span>Zero Data Loss · Offline Vault Architecture</span>
          </div>
          <h3 className="text-xl font-bold font-display text-[#E8EDF2]">
            Lost internet on campus? Your drafts are safe on your device.
          </h3>
          <p className="text-xs text-[#BFC8D2] leading-relaxed">
            The platform caches report forms and queues pending actions locally. Submit freely even in low-reception lab basements or library stacks; sync securely when reconnected.
          </p>
        </div>
        <button
          onClick={() => onNavigate('report_lost')}
          className="px-5 py-2.5 rounded-xl bg-[#D9A441] text-[#1D1020] text-xs font-semibold hover:bg-[#F3C35C] transition-colors whitespace-nowrap shrink-0 shadow-lg"
        >
          Start a Report Now
        </button>
      </section>
    </div>
  );
};
