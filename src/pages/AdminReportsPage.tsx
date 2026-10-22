import React, { useEffect, useState } from 'react';
import { PageId } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { ItemReport, ItemStatus } from '../types/database';
import { DataService } from '../services/dataService';
import { Shield, Search, Trash2, ArrowLeft, Check, AlertCircle } from 'lucide-react';

interface AdminReportsPageProps {
  onNavigate: (page: PageId, itemId?: string) => void;
}

export const AdminReportsPage: React.FC<AdminReportsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ItemReport[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<ItemReport | null>(null);

  useEffect(() => {
    loadReports();
  }, [search, statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const all = await DataService.getItems({
        search: search.trim() || undefined,
      });
      setItems(all);
    } catch (err) {
      console.warn('Error loading admin reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (itemId: string, newStatus: ItemStatus) => {
    await DataService.updateItem(itemId, { status: newStatus });
    loadReports();
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    await DataService.deleteItem(itemToDelete.id);
    setItemToDelete(null);
    loadReports();
  };

  if (!user?.is_admin) {
    return (
      <div className="py-16 text-center text-xs text-[#BFC8D2]">
        Restricted to authorized campus administrators.
      </div>
    );
  }

  const filteredItems = items.filter((i) => {
    if (statusFilter === 'all') return true;
    return i.status === statusFilter;
  });

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('admin_dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-[#BFC8D2] hover:text-[#E8EDF2] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Portal</span>
          </button>
          <h1 className="text-3xl font-bold font-display text-[#E8EDF2]">
            Report Moderation &amp; Management
          </h1>
          <p className="text-xs text-[#BFC8D2]">
            Review, archive, update statuses, or purge spam reports from the database.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl glass-card border border-[#E8EDF2]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#BFC8D2]" />
          <input
            type="text"
            placeholder="Search report title, ID, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[#BFC8D2]">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
          >
            <option value="all">All ({items.length})</option>
            <option value="open">Open</option>
            <option value="potential_match">Potential Match</option>
            <option value="claimed">Claimed</option>
            <option value="resolved">Resolved</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl glass-card border border-[#E8EDF2]/10 overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8EDF2]/10 bg-[#130b15]/80 text-[#BFC8D2] uppercase font-mono text-[10px]">
                <th className="p-3.5">Report / Title</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDF2]/10">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#30152F]/30 transition-colors">
                  <td className="p-3.5 space-y-0.5">
                    <p className="font-semibold text-[#E8EDF2]">{item.title}</p>
                    <span className="text-[11px] text-[#BFC8D2] block">
                      Cat: {item.category} · Owner: {item.owner_name || item.owner_id.slice(0, 10)}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        item.report_type === 'found'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#D9A441]/10 text-[#D9A441] border border-[#D9A441]/30'
                      }`}
                    >
                      {item.report_type}
                    </span>
                  </td>
                  <td className="p-3.5 text-[#BFC8D2]">
                    {item.campus_location}
                  </td>
                  <td className="p-3.5">
                    <select
                      value={item.status}
                      onChange={(e) => handleUpdateStatus(item.id, e.target.value as ItemStatus)}
                      className="px-2 py-1 rounded bg-[#130b15] border border-[#E8EDF2]/15 text-[11px] text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
                    >
                      <option value="open">open</option>
                      <option value="potential_match">potential_match</option>
                      <option value="claimed">claimed</option>
                      <option value="resolved">resolved</option>
                      <option value="archived">archived</option>
                    </select>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => onNavigate('item_details', item.id)}
                      className="px-2.5 py-1 rounded border border-[#E8EDF2]/15 hover:bg-[#30152F] text-[#E8EDF2]"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-1 rounded text-red-400 hover:bg-red-500/10"
                      title="Purge"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl glass-card border border-red-500/30 bg-[#1D1020] text-[#E8EDF2] p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-semibold font-display text-red-400">
              Admin Purge Confirmation
            </h3>
            <p className="text-[#BFC8D2] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#E8EDF2]">"{itemToDelete.title}"</strong> from the campus registry?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-3 py-1.5 rounded-lg border border-[#E8EDF2]/15 text-[#BFC8D2]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
