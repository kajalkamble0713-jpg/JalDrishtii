import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  UserCheck,
  ArrowUpRight,
  XCircle,
  Clock,
  History,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  FileText,
  Building,
  User,
  Download
} from 'lucide-react';
import { GovernmentUser, RbacEngine } from '../../services/auth/rbacEngine';
import { GovernmentAlert, AlertSeverity, AlertStatus, AlertEngine } from '../../services/operations/alertEngine';
import { downloadCsvFile } from '../../utils/csvDownloader';

interface AlertOperationsViewProps {
  currentUser: GovernmentUser;
  onNavigateTab?: (tab: string) => void;
  onSelectDistrict?: (districtId: string) => void;
}

export const AlertOperationsView: React.FC<AlertOperationsViewProps> = ({
  currentUser,
  onNavigateTab,
  onSelectDistrict,
}) => {
  const [alerts, setAlerts] = useState<GovernmentAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active Actions
  const [actionAlert, setActionAlert] = useState<GovernmentAlert | null>(null);
  const [actionType, setActionType] = useState<'ACKNOWLEDGE' | 'ASSIGN' | 'ESCALATE' | 'CLOSE' | 'HISTORY' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [closureReason, setClosureReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [currentUser]);

  // Filtering
  const filteredAlerts = alerts.filter((alert) => {
    if (selectedSeverity !== 'ALL' && alert.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'ALL' && alert.status !== selectedStatus) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return (
        alert.districtName.toLowerCase().includes(q) ||
        alert.state.toLowerCase().includes(q) ||
        alert.disease.toLowerCase().includes(q) ||
        alert.triggerFactor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAcknowledge = async () => {
    if (!actionAlert) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/alerts/${actionAlert.alertId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: actionNotes }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionFeedback(`Alert ${actionAlert.alertId} acknowledged successfully by ${currentUser.fullName}.`);
        fetchAlerts();
        closeModal();
      } else {
        setActionFeedback(`Error: ${data.error || 'Failed to acknowledge alert'}`);
      }
    } catch (err: any) {
      setActionFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!actionAlert || !assigneeName.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/alerts/${actionAlert.alertId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigneeName,
          assigneeId: `OFFICER_${Date.now()}`,
          notes: actionNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionFeedback(`Intervention task assigned to ${assigneeName}.`);
        fetchAlerts();
        closeModal();
      } else {
        setActionFeedback(`Error: ${data.error || 'Failed to assign alert'}`);
      }
    } catch (err: any) {
      setActionFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalate = async () => {
    if (!actionAlert) return;
    setIsSubmitting(true);
    try {
      const nextLevel = Math.min(actionAlert.escalationLevel + 1, 3);
      const res = await fetch(`/api/v1/alerts/${actionAlert.alertId}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escalateToTier: nextLevel,
          reason: actionNotes || 'Elevated risk parameters detected in environmental surveillance',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionFeedback(`Alert escalated to Level ${nextLevel} jurisdiction.`);
        fetchAlerts();
        closeModal();
      } else {
        setActionFeedback(`Error: ${data.error || 'Failed to escalate alert'}`);
      }
    } catch (err: any) {
      setActionFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (!actionAlert || !closureReason.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/alerts/${actionAlert.alertId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: closureReason,
          status: 'RESOLVED',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionFeedback(`Alert resolved and closed with audit note.`);
        fetchAlerts();
        closeModal();
      } else {
        setActionFeedback(`Error: ${data.error || 'Failed to close alert'}`);
      }
    } catch (err: any) {
      setActionFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setActionAlert(null);
    setActionType(null);
    setActionNotes('');
    setAssigneeName('');
    setClosureReason('');
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse';
      case 'VERY_HIGH':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'MODERATE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold';
      case 'ACKNOWLEDGED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'ESCALATED':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner & Feedback */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-red-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-400/40">
              Government Protocol Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Role: <strong className="text-white">{currentUser.role}</strong> ({currentUser.assignment.jurisdictionName})
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Active Public Health Alerts & Command Actions
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Human-in-the-loop early-warning operations. Automated predictive alerts require formal acknowledgement, multi-department response tasking, or audited closure justification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {RbacEngine.getInstance().hasPermission('EXPORT_REPORTS', currentUser) && (
            <button
              onClick={async () => {
                const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_');
                try {
                  const res = await downloadCsvFile({
                    filename: `jaldrishti_alerts_report_${timestamp}.csv`,
                    endpoint: `/api/v1/alerts/export`,
                    fallbackGenerator: () => {
                      return AlertEngine.getInstance().exportCsv({
                        status: selectedStatus !== 'ALL' ? (selectedStatus as any) : undefined,
                        severity: selectedSeverity !== 'ALL' ? (selectedSeverity as any) : undefined,
                      });
                    },
                  });
                  setActionFeedback(`Official Alert CSV downloaded (${(res.byteLength / 1024).toFixed(1)} KB, Source: ${res.source}) for ${currentUser.assignment.jurisdictionName}.`);
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : String(err);
                  setActionFeedback(`Alert CSV export failed: ${msg}`);
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-950/40 cursor-pointer"
              title="Download current alert register as official government CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Export Alerts CSV
            </button>
          )}

          <button
            onClick={fetchAlerts}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Alerts
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search district, disease, trigger..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400 w-full sm:w-64"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="VERY_HIGH">Very High</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ESCALATED">Escalated</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            No alerts match current geographic jurisdiction or filter criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.alertId}
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-cyan-400 font-bold">{alert.alertId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${getStatusBadge(alert.status)}`}>
                      {alert.status}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                      Tier L{alert.escalationLevel}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {alert.districtName}, {alert.state} — {alert.disease}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-red-400 font-mono">
                    {Math.round(alert.riskScore * 100)}%
                  </div>
                  <div className="text-[10px] text-slate-400">Confidence: {Math.round(alert.confidence * 100)}%</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <strong className="text-amber-300">Trigger:</strong> {alert.triggerFactor}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {alert.scientificRationale}
                </p>
              </div>

              {/* Status Meta */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                <div>
                  Created: <span className="text-slate-300">{new Date(alert.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  Assigned: <span className="text-cyan-300">{alert.assignedOfficerName || 'Unassigned'}</span>
                </div>
                {alert.acknowledgedAt && (
                  <div>
                    Ack by: <span className="text-emerald-300">{alert.acknowledgedBy}</span>
                  </div>
                )}
                {alert.closureReason && (
                  <div className="col-span-2 text-slate-400">
                    Resolution: <span className="text-slate-300">{alert.closureReason}</span>
                  </div>
                )}
              </div>

              {/* Operational Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setActionAlert(alert);
                    setActionType('HISTORY');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
                >
                  <History className="w-3 h-3" />
                  Audit Trail ({alert.history.length})
                </button>

                <div className="flex items-center gap-1.5">
                  {alert.status === 'NEW' && (
                    <button
                      onClick={() => {
                        setActionAlert(alert);
                        setActionType('ACKNOWLEDGE');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-bold transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Acknowledge
                    </button>
                  )}

                  {alert.status !== 'CLOSED' && alert.status !== 'RESOLVED' && (
                    <>
                      <button
                        onClick={() => {
                          setActionAlert(alert);
                          setActionType('ASSIGN');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/40 text-xs font-bold transition flex items-center gap-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        Assign Task
                      </button>

                      <button
                        onClick={() => {
                          setActionAlert(alert);
                          setActionType('ESCALATE');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition flex items-center gap-1"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        Escalate
                      </button>

                      <button
                        onClick={() => {
                          setActionAlert(alert);
                          setActionType('CLOSE');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/40 hover:text-red-300 text-slate-400 border border-slate-700 text-xs font-bold transition flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Resolve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Dialog / Modal */}
      {actionAlert && actionType && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {actionType === 'ACKNOWLEDGE' && 'Formal Alert Acknowledgement'}
                  {actionType === 'ASSIGN' && 'Assign Operational Task & Field Tasking'}
                  {actionType === 'ESCALATE' && 'Escalate Jurisdiction Level'}
                  {actionType === 'CLOSE' && 'Resolve / Close Public Health Alert'}
                  {actionType === 'HISTORY' && `Forensic Audit Trail — ${actionAlert.alertId}`}
                </h3>
                <p className="text-xs text-slate-400">
                  {actionAlert.districtName}, {actionAlert.state} • Officer: {currentUser.fullName}
                </p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Modal Body */}
            {actionType === 'ACKNOWLEDGE' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Acknowledging this alert confirms that public health authorities are actively reviewing predictive indicators for {actionAlert.disease}.
                </p>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Officer Assessment Notes (Optional):</label>
                  <textarea
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Enter observation notes, e.g., 'Notified local PHC Danapur and dispatched water sampling team.'"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={closeModal} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                  <button
                    onClick={handleAcknowledge}
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold transition"
                  >
                    {isSubmitting ? 'Recording...' : 'Confirm Acknowledgement'}
                  </button>
                </div>
              </div>
            )}

            {actionType === 'ASSIGN' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Assignee Officer or Department:</label>
                  <input
                    type="text"
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    placeholder="e.g. Er. S. Verma (PHED Executive Engineer)"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Operational Directive / Instructions:</label>
                  <textarea
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="e.g. Conduct urgent residual chlorine checks in ward 12 and inspect community tube wells."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={closeModal} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                  <button
                    onClick={handleAssign}
                    disabled={isSubmitting || !assigneeName.trim()}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Dispatching...' : 'Dispatch Assignment'}
                  </button>
                </div>
              </div>
            )}

            {actionType === 'ESCALATE' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Current Level: <strong className="text-white">L{actionAlert.escalationLevel}</strong>. Escalating will alert higher-tier State / National crisis command cells.
                </p>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Escalation Justification:</label>
                  <textarea
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="e.g. Local PHC medicine stock depleted and river stage crossed warning marker."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={closeModal} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                  <button
                    onClick={handleEscalate}
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition"
                  >
                    {isSubmitting ? 'Escalating...' : 'Confirm Escalation'}
                  </button>
                </div>
              </div>
            )}

            {actionType === 'CLOSE' && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                  Mandatory Governance Policy: Public health alerts cannot be dismissed without an audited closure justification.
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Reason for Resolution / Closure *:</label>
                  <textarea
                    rows={3}
                    value={closureReason}
                    onChange={(e) => setClosureReason(e.target.value)}
                    placeholder="e.g. Pipeline repaired by PHED team; secondary water quality test confirmed 0.3 mg/L free chlorine and zero coliform."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={closeModal} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting || !closureReason.trim()}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Closing...' : 'Close & Record in Audit Trail'}
                  </button>
                </div>
              </div>
            )}

            {actionType === 'HISTORY' && (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {actionAlert.history.map((h, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">{h.fromStatus} → {h.toStatus}</span>
                      <span className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-300">
                      Actor: <strong className="text-white">{h.actorName}</strong>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">"{h.notes}"</p>
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <button onClick={closeModal} className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
