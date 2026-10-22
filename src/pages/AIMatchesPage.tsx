import React, { useEffect, useState } from 'react';
import { PageId } from '../types/navigation';
import { ItemMatch } from '../types/database';
import { DataService } from '../services/dataService';
import { Sparkles, ArrowRight, Shield, RefreshCw, Info, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface AIMatchesPageProps {
  onNavigate: (page: PageId, itemId?: string) => void;
}

export const AIMatchesPage: React.FC<AIMatchesPageProps> = ({ onNavigate }) => {
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterScore, setFilterScore] = useState(40);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const all = await DataService.getAllMatches();
      setMatches(all);
    } catch (err) {
      console.warn('Error fetching all matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter((m) => m.score >= filterScore);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#D9A441] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HEURISTIC AI MATCHING PIPELINE</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-[#E8EDF2]">
            Suggested Item Pairings
          </h1>
          <p className="text-xs text-[#BFC8D2] mt-0.5">
            Automated correspondence evaluation across lost and found registry reports.
          </p>
        </div>

        <button
          onClick={loadMatches}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg border border-[#E8EDF2]/15 text-xs text-[#BFC8D2] hover:text-[#E8EDF2] hover:bg-[#30152F] flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recalculate Matches</span>
        </button>
      </div>

      {/* Transparency Note */}
      <div className="p-4 rounded-xl glass-card border border-[#E8EDF2]/10 bg-[#30152F]/30 flex items-start gap-3 text-xs text-[#BFC8D2]">
        <Info className="w-4 h-4 text-[#D9A441] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[#E8EDF2] font-semibold">
            Heuristic Compatibility Engine Note
          </p>
          <p className="leading-relaxed">
            The compatibility percentage is an algorithmic heuristic score derived from category concordance (+30), keyword overlap (+25), color alignment (+15), brand match (+10), location proximity (+15), and date proximity (+5). It is an indicator of similarity, not a verified ownership claim.
          </p>
        </div>
      </div>

      {/* Threshold Slider */}
      <div className="flex items-center justify-between p-4 rounded-xl glass-card border border-[#E8EDF2]/10 text-xs">
        <span className="text-[#BFC8D2]">
          Minimum Match Compatibility: <strong className="text-[#D9A441]">{filterScore}%</strong>
        </span>
        <input
          type="range"
          min="20"
          max="80"
          step="5"
          value={filterScore}
          onChange={(e) => setFilterScore(Number(e.target.value))}
          className="w-48 accent-[#D9A441]"
        />
      </div>

      {/* Match Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 rounded-xl glass-card animate-pulse border border-[#E8EDF2]/10 bg-[#30152F]/20"
            />
          ))}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="p-12 rounded-2xl glass-card border border-[#E8EDF2]/10 text-center space-y-3">
          <p className="text-sm font-semibold text-[#E8EDF2]">No matching pairs above {filterScore}% threshold</p>
          <p className="text-xs text-[#BFC8D2] max-w-sm mx-auto">
            Try adjusting the minimum compatibility slider or check back once new reports are logged.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className="p-6 rounded-2xl glass-card border border-[#E8EDF2]/10 hover:border-[#D9A441]/40 transition-colors bg-[#1D1020]/90 space-y-5"
            >
              {/* Header: Score and Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-lg bg-[#30152F] border border-[#D9A441]/40 text-[#D9A441] font-mono font-bold text-sm">
                    {match.score}% MATCH
                  </div>
                  <span className="text-xs text-[#BFC8D2]">
                    {match.score >= 70 ? 'High Compatibility' : 'Moderate Compatibility'}
                  </span>
                </div>

                <span className="text-[11px] font-mono uppercase text-[#BFC8D2]/70">
                  Detected {new Date(match.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Side by Side Item Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lost Item */}
                <div className="p-4 rounded-xl bg-[#130b15] border border-[#E8EDF2]/10 space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#D9A441]">
                    Lost Item Report
                  </span>
                  <h3 className="text-sm font-semibold text-[#E8EDF2] font-display">
                    {match.lost_item?.title || 'Unknown Lost Item'}
                  </h3>
                  <p className="text-xs text-[#BFC8D2] line-clamp-2">
                    {match.lost_item?.description}
                  </p>
                  <div className="text-[11px] text-[#BFC8D2]/80 pt-1">
                    Location: {match.lost_item?.campus_location}
                  </div>
                  <button
                    onClick={() => onNavigate('item_details', match.lost_item_id)}
                    className="text-xs text-[#D9A441] hover:underline pt-1 inline-block"
                  >
                    View Lost Report &rarr;
                  </button>
                </div>

                {/* Found Item */}
                <div className="p-4 rounded-xl bg-[#130b15] border border-emerald-500/20 space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">
                    Found Item Report
                  </span>
                  <h3 className="text-sm font-semibold text-[#E8EDF2] font-display">
                    {match.found_item?.title || 'Unknown Found Item'}
                  </h3>
                  <p className="text-xs text-[#BFC8D2] line-clamp-2">
                    {match.found_item?.description}
                  </p>
                  <div className="text-[11px] text-[#BFC8D2]/80 pt-1">
                    Location: {match.found_item?.campus_location}
                  </div>
                  <button
                    onClick={() => onNavigate('item_details', match.found_item_id)}
                    className="text-xs text-emerald-400 hover:underline pt-1 inline-block"
                  >
                    Inspect &amp; Claim Item &rarr;
                  </button>
                </div>
              </div>

              {/* Multi-Stage Matching Factors Breakdown */}
              <div className="p-4 rounded-xl bg-[#30152F]/40 border border-[#E8EDF2]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#D9A441] uppercase tracking-wider font-semibold block">
                    Transparent Match Analysis:
                  </span>
                  <span className="text-[10px] text-[#BFC8D2] font-mono">
                    Multi-Stage Candidate Evaluation
                  </span>
                </div>

                <p className="text-xs text-[#E8EDF2] leading-relaxed">
                  {match.explanation}
                </p>

                {/* Attribute Signals: Matching, Conflicting, Missing */}
                <div className="space-y-2 pt-1 border-t border-[#E8EDF2]/10">
                  {match.matching_attributes && match.matching_attributes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold mr-1">
                        Matching:
                      </span>
                      {match.matching_attributes.map((attr, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{attr}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {match.conflicting_attributes && match.conflicting_attributes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-rose-400 font-bold mr-1">
                        Contradictions:
                      </span>
                      {match.conflicting_attributes.map((attr, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>{attr}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {match.missing_information && match.missing_information.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#BFC8D2] font-bold mr-1">
                        Missing Data:
                      </span>
                      {match.missing_information.map((attr, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#130b15] border border-[#E8EDF2]/15 text-[#BFC8D2]"
                        >
                          <HelpCircle className="w-3 h-3 text-[#BFC8D2]/70" />
                          <span>{attr}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {match.factor_breakdown && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 text-[10px] font-mono text-[#BFC8D2]">
                    <div className="bg-[#130b15] p-1.5 rounded text-center">
                      Cat: {match.factor_breakdown.category_score} pts
                    </div>
                    <div className="bg-[#130b15] p-1.5 rounded text-center">
                      Keys: {match.factor_breakdown.keyword_score} pts
                    </div>
                    <div className="bg-[#130b15] p-1.5 rounded text-center">
                      Color: {match.factor_breakdown.color_score} pts
                    </div>
                    <div className="bg-[#130b15] p-1.5 rounded text-center">
                      Brand: {match.factor_breakdown.brand_score} pts
                    </div>
                    <div className="bg-[#130b15] p-1.5 rounded text-center">
                      Loc: {match.factor_breakdown.location_score} pts
                    </div>
                    <div className="bg-[#130b15] p-1.5 rounded text-center">
                      Date: {match.factor_breakdown.date_score} pts
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
