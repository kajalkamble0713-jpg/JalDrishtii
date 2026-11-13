import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Download,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Activity,
  FileSpreadsheet,
  Lock,
  ExternalLink
} from 'lucide-react';
import { GovernmentUser } from '../../services/auth/rbacEngine';
import { AuditRecord, AuditEngine } from '../../services/operations/auditEngine';
import { downloadCsvFile } from '../../utils/csvDownloader';

interface AuditTrailViewProps {
  currentUser: GovernmentUser;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ currentUser }) => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/audit/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      // Fallback
      setLogs(AuditEngine.getInstance().getLogs());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentUser]);

  const handleExportCsv = async () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_');
    await downloadCsvFile({
      filename: `jaldrishti_audit_ledger_${timestamp}.csv`,
      endpoint: '/api/v1/audit/export',
      fallbackGenerator: () => {
        return AuditEngine.getInstance().exportCsv();
      },
    });
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedAction !== 'ALL' && log.action !== selectedAction) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return (
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entityType.toLowerCase().includes(q) ||
        (log.entityId && log.entityId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('ALERT')) return 'bg-red-500/20 text-red-300 border-red-500/40';
    if (action.includes('INTERVENTION')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    if (action.includes('RESOURCE')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (action.includes('EVIDENCE')) return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
              Immutable Forensic Audit Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Auditor: <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.role})
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Government Decision Trail & Regulatory Compliance Log
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Append-only, tamper-evident audit ledger compliant with National Informatics Centre (NIC) and Comptroller & Auditor General (CAG) digital public health guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:scale-105 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Forensic CSV
          </button>
          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search officer, action, entity ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400 w-full sm:w-64"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Action Category:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none"
          >
            <option value="ALL">All Recorded Actions</option>
            <option value="ALERT_ACKNOWLEDGED">Alert Acknowledged</option>
            <option value="ALERT_ASSIGNED">Alert Assigned</option>
            <option value="ALERT_ESCALATED">Alert Escalated</option>
            <option value="ALERT_CLOSED">Alert Closed</option>
            <option value="INTERVENTION_CREATED">Intervention Created</option>
            <option value="EVIDENCE_VERIFIED_APPROVED">Evidence Verified</option>
            <option value="RESOURCE_ALLOCATION_APPROVED">Resource Approved</option>
            <option value="DEMO_OFFICER_SWITCH">Officer Profile Switch</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Immutable Audit Ledger Entries</h3>
            <span className="text-xs text-slate-400 font-mono">({filteredLogs.length} events logged)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-3">Audit ID & Timestamp</th>
                <th className="py-3 px-3">Government Officer</th>
                <th className="py-3 px-3">Action Recorded</th>
                <th className="py-3 px-3">Target Entity</th>
                <th className="py-3 px-3">Forensic Context & Payload</th>
                <th className="py-3 px-3">Gateway IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredLogs.map((log) => (
                <tr key={log.auditId} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div className="text-cyan-400 font-bold">{log.auditId}</div>
                    <div className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{log.userName}</div>
                    <div className="text-[10px] text-slate-400">{log.designation}</div>
                    <div className="text-[9px] font-mono text-cyan-300">{log.userRole}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div className="text-slate-300">{log.entityType}</div>
                    {log.entityId && (
                      <div className="text-slate-500 text-[10px]">{log.entityId}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="text-[11px] text-slate-300 line-clamp-2">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                    {log.ipAddress}
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
