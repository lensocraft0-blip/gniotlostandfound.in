import React, { useEffect, useState } from 'react';
import { PageId } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { AuditLogEntry } from '../types/database';
import { DataService } from '../services/dataService';
import { History, Shield, ArrowLeft, Download, Filter } from 'lucide-react';

interface AdminAuditPageProps {
  onNavigate: (page: PageId) => void;
}

export const AdminAuditPage: React.FC<AdminAuditPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    setLoading(true);
    try {
      const data = await DataService.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.warn('Failed loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Actor', 'Action', 'Entity Type', 'Entity ID', 'Timestamp'];
    const rows = logs.map((l) => [
      l.id,
      l.actor_name || l.actor_id || 'System',
      l.action,
      l.entity_type,
      l.entity_id,
      l.created_at,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gniot_security_audit_${Date.now()}.csv`);
    link.click();
  };

  if (!user?.is_admin) {
    return (
      <div className="py-16 text-center text-xs text-[#BFC8D2]">
        Audit log access restricted to authorized administrators.
      </div>
    );
  }

  const filteredLogs = logs.filter((l) => {
    if (filterAction === 'all') return true;
    return l.action === filterAction;
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
            Campus Security Audit Log
          </h1>
          <p className="text-xs text-[#BFC8D2]">
            Immutable chronological record of administrative actions, claim decisions, and report modifications.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg border border-[#E8EDF2]/15 text-xs text-[#E8EDF2] hover:bg-[#30152F] flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-[#D9A441]" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl glass-card border border-[#E8EDF2]/10 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#D9A441]" />
          <span className="text-[#BFC8D2]">Filter by Action:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
          >
            <option value="all">All Administrative Events ({logs.length})</option>
            <option value="CLAIM_VERIFIED_AND_APPROVED">CLAIM_VERIFIED_AND_APPROVED</option>
            <option value="CLAIM_APPROVED">CLAIM_APPROVED</option>
            <option value="CLAIM_REJECTED">CLAIM_REJECTED</option>
            <option value="CLAIM_SUBMITTED">CLAIM_SUBMITTED</option>
            <option value="ITEM_REPORTED">ITEM_REPORTED</option>
          </select>
        </div>

        <span className="text-[11px] font-mono text-[#BFC8D2]/70">
          Total Logs: {filteredLogs.length}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl glass-card border border-[#E8EDF2]/10 overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8EDF2]/10 bg-[#130b15]/80 text-[#BFC8D2] uppercase font-mono text-[10px]">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Metadata / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDF2]/10">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#30152F]/20 transition-colors">
                  <td className="p-3.5 font-mono text-[11px] text-[#BFC8D2]/70 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono text-[10px] font-bold text-[#D9A441] bg-[#30152F] px-2 py-0.5 rounded border border-[#D9A441]/30">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium text-[#E8EDF2]">
                    {log.actor_name || log.actor_id || 'Campus System'}
                  </td>
                  <td className="p-3.5 text-[#BFC8D2] font-mono text-[11px]">
                    {log.entity_type}:{log.entity_id.slice(0, 8)}
                  </td>
                  <td className="p-3.5 text-[#BFC8D2] font-mono text-[11px] max-w-xs truncate">
                    {JSON.stringify(log.safe_metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
