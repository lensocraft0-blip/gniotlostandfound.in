import React from 'react';
import { ItemReport } from '../../types/database';
import { MapPin, Calendar, Tag, ShieldCheck, ArrowRight, ImageOff } from 'lucide-react';

interface ItemCardProps {
  item: ItemReport;
  onSelect: (item: ItemReport) => void;
  onClaim?: (item: ItemReport) => void;
  matchScore?: number;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onSelect, onClaim, matchScore }) => {
  const isFound = item.report_type === 'found';
  const hasImage = item.image_paths && item.image_paths.length > 0;
  const primaryImage = hasImage ? item.image_paths[0] : null;

  return (
    <article
      onClick={() => onSelect(item)}
      className="group relative rounded-xl glass-card glass-card-hover p-4 cursor-pointer flex flex-col justify-between h-full border border-[#E8EDF2]/10"
    >
      <div>
        {/* Photo Container */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3 bg-[#130b15] border border-[#E8EDF2]/10">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Safe zero-broken-image fallback
                (e.currentTarget as HTMLElement).style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.img-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
          ) : null}

          {/* Styled fallback container */}
          <div
            className={`img-fallback w-full h-full flex flex-col items-center justify-center p-3 text-[#BFC8D2]/60 bg-gradient-to-br from-[#30152F]/40 to-[#130b15] ${
              hasImage ? 'hidden' : 'flex'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-[#30152F]/70 border border-[#E8EDF2]/10 flex items-center justify-center text-[#D9A441] mb-1">
              <Tag className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-[#BFC8D2]/80">{item.category}</span>
          </div>

          {/* Type Indicator: Subtle text label */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide backdrop-blur-md bg-[#1D1020]/80 text-[#E8EDF2] border border-[#E8EDF2]/10">
            {isFound ? (
              <span className="text-emerald-400">FOUND ITEM</span>
            ) : (
              <span className="text-[#D9A441]">LOST ITEM</span>
            )}
          </div>

          {/* Match Score Badge (if in match context) */}
          {typeof matchScore === 'number' && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-tight backdrop-blur-md bg-[#30152F]/90 text-[#D9A441] border border-[#D9A441]/40">
              {matchScore}% MATCH
            </div>
          )}
        </div>

        {/* Clean unboxed metadata (Zero-Pill discipline) */}
        <div className="flex items-center gap-2 text-xs text-[#BFC8D2] mb-1.5 flex-wrap">
          <span>{item.category}</span>
          {item.color && (
            <>
              <span aria-hidden="true">·</span>
              <span>{item.color}</span>
            </>
          )}
          {item.brand && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-[120px]">{item.brand}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-[#E8EDF2] font-display group-hover:text-[#D9A441] transition-colors line-clamp-1 mb-1.5">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#BFC8D2]/90 line-clamp-2 leading-relaxed mb-3">
          {item.description}
        </p>
      </div>

      {/* Bottom Information Row */}
      <div className="border-t border-[#E8EDF2]/10 pt-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[#BFC8D2]/70">
          <div className="flex items-center gap-1.5 truncate max-w-[200px]" title={item.campus_location}>
            <MapPin className="w-3.5 h-3.5 text-[#D9A441] shrink-0" />
            <span className="truncate">{item.campus_location}</span>
          </div>

          {item.event_date && (
            <div className="flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#BFC8D2]" />
              <span>{new Date(item.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Status & Actions */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] uppercase tracking-wider font-mono text-[#BFC8D2]/80">
            {item.status === 'open' && 'Status: Open'}
            {item.status === 'potential_match' && 'Status: Potential Match'}
            {item.status === 'claimed' && 'Status: Claimed'}
            {item.status === 'resolved' && 'Status: Resolved'}
          </span>

          <span className="text-xs font-medium text-[#D9A441] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
};
