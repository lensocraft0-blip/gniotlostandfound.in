import React, { useEffect, useState } from 'react';
import { PageId } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { ItemReport } from '../types/database';
import { DataService } from '../services/dataService';
import { PlusCircle, Trash2, CheckCircle2, MapPin, Calendar, ArrowRight } from 'lucide-react';

interface MyReportsPageProps {
  onNavigate: (page: PageId, itemId?: string) => void;
}

export const MyReportsPage: React.FC<MyReportsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<ItemReport | null>(null);

  useEffect(() => {
    loadUserReports();
  }, [user]);

  const loadUserReports = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const all = await DataService.getItems({ owner_id: user.id });
      setReports(all);
    } catch (err) {
      console.warn('Error loading user reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolved = async (report: ItemReport) => {
    const newStatus = report.status === 'resolved' ? 'open' : 'resolved';
    await DataService.updateItem(report.id, { status: newStatus });
    loadUserReports();
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    await DataService.deleteItem(itemToDelete.id);
    setItemToDelete(null);
    loadUserReports();
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[#E8EDF2]">My Campus Reports</h1>
          <p className="text-xs text-[#BFC8D2] mt-0.5">
            Manage your reported lost and found items, update statuses, or mark as recovered.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('report_lost')}
            className="px-3.5 py-2 rounded-lg bg-[#D9A441] text-[#1D1020] text-xs font-semibold hover:bg-[#F3C35C] transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Lost</span>
          </button>
          <button
            onClick={() => onNavigate('report_found')}
            className="px-3.5 py-2 rounded-lg border border-[#E8EDF2]/15 bg-[#30152F]/70 text-[#E8EDF2] text-xs font-semibold hover:border-[#D9A441]/40"
          >
            <span>Report Found</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 rounded-xl glass-card animate-pulse border border-[#E8EDF2]/10 bg-[#30152F]/20"
            />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 rounded-2xl glass-card border border-[#E8EDF2]/10 text-center space-y-3">
          <p className="text-sm font-semibold text-[#E8EDF2]">No reports filed yet</p>
          <p className="text-xs text-[#BFC8D2] max-w-sm mx-auto">
            If you have lost or found an item on the GNIOT campus, file a report to enable automatic matching.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-5 rounded-xl glass-card border border-[#E8EDF2]/10 bg-[#1D1020]/90 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold text-[10px] uppercase px-2 py-0.5 rounded ${
                      report.report_type === 'found'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#D9A441]/10 text-[#D9A441] border border-[#D9A441]/30'
                    }`}
                  >
                    {report.report_type}
                  </span>
                  <span className="text-[#BFC8D2]">{report.category}</span>
                  <span className="text-[#BFC8D2]">·</span>
                  <span className="font-mono text-[#BFC8D2]/80 uppercase">
                    Status: {report.status}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[#E8EDF2] font-display">
                  {report.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#BFC8D2]/80">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#D9A441]" />
                    {report.campus_location}
                  </span>
                  {report.event_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#BFC8D2]" />
                      {new Date(report.event_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E8EDF2]/10">
                <button
                  onClick={() => onNavigate('item_details', report.id)}
                  className="px-3 py-1.5 rounded-lg border border-[#E8EDF2]/15 text-[#E8EDF2] hover:bg-[#30152F] flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleToggleResolved(report)}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    report.status === 'resolved'
                      ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                      : 'border-[#E8EDF2]/15 text-[#BFC8D2] hover:text-[#E8EDF2]'
                  }`}
                >
                  {report.status === 'resolved' ? 'Mark Active' : 'Mark Recovered'}
                </button>

                <button
                  onClick={() => setItemToDelete(report)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete Report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl glass-card border border-red-500/30 bg-[#1D1020] text-[#E8EDF2] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold font-display text-red-400">
              Confirm Report Deletion
            </h3>
            <p className="text-xs text-[#BFC8D2] leading-relaxed">
              Are you sure you want to permanently delete the report for{' '}
              <strong className="text-[#E8EDF2]">"{itemToDelete.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[#E8EDF2]/15 text-xs text-[#BFC8D2]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs text-white font-semibold"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
