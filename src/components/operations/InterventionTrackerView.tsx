import React, { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Camera,
  FileCheck,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  MapPin,
  Calendar,
  Building,
  UserCheck
} from 'lucide-react';
import { GovernmentUser } from '../../services/auth/rbacEngine';
import { GovernmentIntervention, InterventionStatus, InterventionType } from '../../services/operations/interventionEngine';

interface InterventionTrackerViewProps {
  currentUser: GovernmentUser;
  onNavigateTab?: (tab: string) => void;
  onSelectDistrict?: (districtId: string) => void;
}

const INTERVENTION_TYPES: InterventionType[] = [
  'Targeted Hyper-Chlorination',
  'Water Testing & Source Inspection',
  'Community Borewell Shock Treatment',
  'Overhead Tank Desilting & Flushing',
  'Pipeline Leakage & Backflow Repair',
  'Sanitation & Sludge Inundation Clearance',
  'Bilingual Community Risk Awareness Campaign',
  'PHC ORS & Zinc Stockpile Audit',
  'Microbiological Lab Sample Collection',
  'LoRaWAN Edge Water Sensor Diagnostic',
  'Water Treatment Plant Clarifier Inspection',
];

export const InterventionTrackerView: React.FC<InterventionTrackerViewProps> = ({
  currentUser,
}) => {
  const [interventions, setInterventions] = useState<GovernmentIntervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [evidenceTarget, setEvidenceTarget] = useState<GovernmentIntervention | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<GovernmentIntervention | null>(null);

  // Form states - Create
  const [newDistrict, setNewDistrict] = useState('patna_bihar');
  const [newDistrictName, setNewDistrictName] = useState('Patna');
  const [newType, setNewType] = useState<InterventionType>('Targeted Hyper-Chlorination');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [newDept, setNewDept] = useState('Public Health Engineering Department (PHED)');
  const [newLocation, setNewLocation] = useState('Ward 14 Community Tube-well Cluster');
  const [newDeadline, setNewDeadline] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);

  // Form states - Evidence (Field Worker)
  const [evDesc, setEvDesc] = useState('');
  const [evFileType, setEvFileType] = useState<'PHOTOGRAPH' | 'LAB_REPORT' | 'GPS_LOG' | 'FIELD_INSPECTION_NOTE'>('PHOTOGRAPH');
  const [evLocation, setEvLocation] = useState('25.5941°N, 85.1376°E (Danapur)');
  const [evRef, setEvRef] = useState('CHLORINATION_GEO_LOG_PATNA.jpg');

  // Form states - Supervisor Verification
  const [verifyApproved, setVerifyApproved] = useState(true);
  const [verifyNotes, setVerifyNotes] = useState('');

  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInterventions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/interventions');
      if (res.ok) {
        const data = await res.json();
        setInterventions(data.interventions || []);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, [currentUser]);

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          districtId: newDistrict,
          districtName: newDistrictName,
          type: newType,
          description: newDesc,
          priority: newPriority,
          assignedDepartment: newDept,
          location: newLocation,
          deadline: newDeadline,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(`Intervention ${data.interventionId} scheduled and recorded in audit trail.`);
        setIsCreateOpen(false);
        setNewDesc('');
        fetchInterventions();
      } else {
        setFeedback(`Error: ${data.error || 'Failed to create intervention'}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceTarget || !evDesc.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/interventions/${evidenceTarget.interventionId}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: evLocation,
          fileType: evFileType,
          fileReference: evRef,
          description: evDesc,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback(`Field verification evidence uploaded. Task moved to VERIFICATION_PENDING.`);
        setEvidenceTarget(null);
        setEvDesc('');
        fetchInterventions();
      } else {
        setFeedback(`Error: ${data.error || 'Failed to upload evidence'}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEvidence = async (evidenceId: string) => {
    if (!verifyTarget) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/interventions/${verifyTarget.interventionId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidenceId,
          isApproved: verifyApproved,
          notes: verifyNotes || (verifyApproved ? 'Field evidence inspected and approved.' : 'Rejected due to insufficient proof.'),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback(verifyApproved ? `Intervention verified and officially approved.` : `Evidence rejected; sent back for re-execution.`);
        setVerifyTarget(null);
        setVerifyNotes('');
        fetchInterventions();
      } else {
        setFeedback(`Error: ${data.error || 'Failed to verify evidence'}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = interventions.filter((item) => {
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return (
        item.districtName.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.assignedDepartment.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: InterventionStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'VERIFICATION_PENDING':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse';
      case 'VERIFIED':
      case 'CLOSED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              Field Action & Interventions
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Active Officer: <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.role})
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-cyan-400" />
            Field Interventions & Verification Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Track multi-agency WASH actions: chlorination drives, tanker dispatches, pipeline repairs, and lab sampling. Field workers submit GPS-stamped verification photos for supervisory audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 hover:scale-105 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Dispatch New Intervention
          </button>
          <button
            onClick={fetchInterventions}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search task, district, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400 w-full sm:w-64"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Status Filter:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="VERIFICATION_PENDING">Verification Pending</option>
            <option value="VERIFIED">Verified / Complete</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Interventions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            No field tasks match current filters.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.interventionId}
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-cyan-400 font-bold">{item.interventionId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${getStatusBadge(item.status)}`}>
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      {item.priority}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {item.type}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{item.districtName} • {item.location}</span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 font-mono">
                  <div>Deadline: <strong className="text-slate-200">{item.deadline}</strong></div>
                  <div>Dept: <strong className="text-cyan-300">{item.assignedDepartment.slice(0, 24)}...</strong></div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                {item.description}
              </p>

              {/* Attached Evidence List */}
              {item.evidence && item.evidence.length > 0 && (
                <div className="space-y-2 border-t border-slate-800/80 pt-3">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-cyan-400" />
                    Field Verification Evidence ({item.evidence.length})
                  </div>
                  {item.evidence.map((ev) => (
                    <div key={ev.evidenceId} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{ev.fileType}</span>
                          {ev.isVerified ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              Verified
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40">
                              Awaiting Verification
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{ev.description}</div>
                        <div className="text-[10px] text-slate-500 font-mono">GPS: {ev.location} • By {ev.uploadedBy}</div>
                      </div>

                      {!ev.isVerified && (
                        <button
                          onClick={() => setVerifyTarget(item)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <FileCheck className="w-3 h-3" />
                          Sign Off
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                <div className="text-[10px] text-slate-500 font-mono">
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEvidenceTarget(item)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 text-xs font-bold transition flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Submit Evidence
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal - Dispatch New Intervention */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateIntervention} className="w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  Dispatch Government Public Health Intervention
                </h3>
                <p className="text-xs text-slate-400">Formal operational task assignment under NDMA / State SOP</p>
              </div>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Intervention Protocol Type:</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as InterventionType)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  {INTERVENTION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Target District:</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => {
                      setNewDistrict(e.target.value);
                      setNewDistrictName(e.target.options[e.target.selectedIndex].text);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                  >
                    <option value="patna_bihar">Patna (Bihar)</option>
                    <option value="khordha_odisha">Khordha (Odisha)</option>
                    <option value="varanasi_up">Varanasi (UP)</option>
                    <option value="south24pgs_wb">South 24 Parganas (WB)</option>
                    <option value="kamrup_assam">Kamrup Metro (Assam)</option>
                    <option value="alappuzha_kerala">Alappuzha (Kerala)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Priority Tier:</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                  >
                    <option value="URGENT">Urgent (24h Action)</option>
                    <option value="HIGH">High (48h Action)</option>
                    <option value="MEDIUM">Medium (72h Action)</option>
                    <option value="LOW">Low (Routine)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Location / Village / Water Source:</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Danapur Cantonment Ward 4 community reservoir"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Assigned Department:</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder="e.g. Public Health Engineering Department (PHED)"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Operational Directives & Scope *:</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detailed instructions for field personnel, e.g. 'Deploy mobile chlorination unit. Check residual free chlorine and provide ORS packets to households within 200m radius.'"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newDesc.trim()}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Issue Operational Directive'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal - Submit Field Evidence */}
      {evidenceTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUploadEvidence} className="w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  Submit Field Verification Evidence
                </h3>
                <p className="text-xs text-slate-400">
                  {evidenceTarget.type} — {evidenceTarget.districtName}
                </p>
              </div>
              <button type="button" onClick={() => setEvidenceTarget(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Evidence Type:</label>
                  <select
                    value={evFileType}
                    onChange={(e) => setEvFileType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                  >
                    <option value="PHOTOGRAPH">Geotagged Photograph</option>
                    <option value="LAB_REPORT">Bacteriological Lab Report</option>
                    <option value="GPS_LOG">Field GPS Inspection Track</option>
                    <option value="FIELD_INSPECTION_NOTE">Sanitary Survey Note</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">GPS Coordinates / Location:</label>
                  <input
                    type="text"
                    value={evLocation}
                    onChange={(e) => setEvLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">File Identifier / Photo Tag:</label>
                <input
                  type="text"
                  value={evRef}
                  onChange={(e) => setEvRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Field Observations / Test Results *:</label>
                <textarea
                  rows={3}
                  value={evDesc}
                  onChange={(e) => setEvDesc(e.target.value)}
                  placeholder="e.g. Free chlorine tested at 0.5 mg/L via DPD-1 colorimeter. Turbidity down to 1.8 NTU. Borewell shock chlorination completed at 11:30 AM."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setEvidenceTarget(null)} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !evDesc.trim()}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isSubmitting ? 'Uploading...' : 'Submit Evidence'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal - Supervisor Sign-Off */}
      {verifyTarget && verifyTarget.evidence.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Supervisor Verification Sign-Off
                </h3>
                <p className="text-xs text-slate-400">
                  {verifyTarget.interventionId} • {verifyTarget.districtName}
                </p>
              </div>
              <button onClick={() => setVerifyTarget(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                You are reviewing field evidence submitted by <strong>{verifyTarget.evidence[0].uploadedBy}</strong>. Confirm compliance with government water safety standards.
              </p>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-cyan-300">{verifyTarget.evidence[0].fileReference}</div>
                <div className="text-slate-300">{verifyTarget.evidence[0].description}</div>
                <div className="text-[10px] text-slate-500 font-mono">Location: {verifyTarget.evidence[0].location}</div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Supervisor Decision:</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-emerald-300 font-bold">
                    <input
                      type="radio"
                      name="decision"
                      checked={verifyApproved}
                      onChange={() => setVerifyApproved(true)}
                    />
                    Approve & Verify
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-red-300 font-bold">
                    <input
                      type="radio"
                      name="decision"
                      checked={!verifyApproved}
                      onChange={() => setVerifyApproved(false)}
                    />
                    Reject Evidence
                  </label>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Supervisor Audit Notes:</label>
                <textarea
                  rows={2}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="e.g. Photographic evidence corroborates hyper-chlorination protocol; coliform count within permissible BIS 10500 limits."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setVerifyTarget(null)} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs">
                Cancel
              </button>
              <button
                onClick={() => handleVerifyEvidence(verifyTarget.evidence[0].evidenceId)}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Record Supervisor Sign-Off'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
