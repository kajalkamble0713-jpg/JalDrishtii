import React, { useState } from 'react';
import {
  ShieldAlert,
  Wrench,
  Layers,
  ShieldCheck,
  Building,
  Activity,
  Droplets,
  TestTube2,
  TrendingUp,
  Smartphone,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  GitCompare,
} from 'lucide-react';
import { GovernmentUser, RbacEngine } from '../../services/auth/rbacEngine';
import { CommandCenterView } from './CommandCenterView';
import { AlertOperationsView } from './AlertOperationsView';
import { InterventionTrackerView } from './InterventionTrackerView';
import { ResourceLogisticsView } from './ResourceLogisticsView';
import { AuditTrailView } from './AuditTrailView';
import { FieldOperationsView } from './FieldOperationsView';
import { LaboratoryPortalView } from './LaboratoryPortalView';
import { PredictionFeedbackView } from './PredictionFeedbackView';
import { DataComparisonView } from './DataComparisonView';
import { downloadCsvFile } from '../../utils/csvDownloader';
import { AlertEngine } from '../../services/operations/alertEngine';
import { TriageEngine } from '../../services/operations/triageEngine';
import { AuditEngine } from '../../services/operations/auditEngine';
import { ComparisonEngine } from '../../services/operations/comparisonEngine';

interface GovernmentOperationsHubProps {
  currentUser: GovernmentUser;
  onNavigateTab: (tab: string) => void;
  onSelectDistrict?: (districtId: string) => void;
  initialSubTab?: 'triage' | 'alerts' | 'comparison' | 'field' | 'lab' | 'feedback' | 'interventions' | 'resources' | 'audit';
}

export const GovernmentOperationsHub: React.FC<GovernmentOperationsHubProps> = ({
  currentUser,
  onNavigateTab,
  onSelectDistrict,
  initialSubTab = 'triage',
}) => {
  const [subTab, setSubTab] = useState<'triage' | 'alerts' | 'comparison' | 'field' | 'lab' | 'feedback' | 'interventions' | 'resources' | 'audit'>(initialSubTab);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const rbac = RbacEngine.getInstance();
  const canExport = rbac.hasPermission('EXPORT_REPORTS', currentUser);

  const handleExportCsv = async (type: 'alerts' | 'metrics' | 'audit' | 'comparison') => {
    setIsExporting(true);
    setExportNotice(null);

    const endpoints = {
      alerts: '/api/v1/alerts/export',
      metrics: '/api/v1/triage/export',
      audit: '/api/v1/audit/export',
      comparison: '/api/v1/comparison/export',
    };

    const endpoint = endpoints[type];
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_');
    const label =
      type === 'alerts'
        ? 'Active Alert Register'
        : type === 'metrics'
        ? 'District Metrics & Triage Matrix'
        : type === 'comparison'
        ? 'Old vs New Comparison Diffs'
        : 'Audit Ledger';

    try {
      const result = await downloadCsvFile({
        filename: `jaldrishti_${type}_report_${timestamp}.csv`,
        endpoint,
        fallbackGenerator: () => {
          if (type === 'alerts') return AlertEngine.getInstance().exportCsv();
          if (type === 'metrics') return TriageEngine.getInstance().exportCsv();
          if (type === 'comparison') return ComparisonEngine.getInstance().exportCsv();
          return AuditEngine.getInstance().exportCsv();
        },
      });

      setIsExportMenuOpen(false);
      setExportNotice(`Official CSV generated & downloaded: ${label} (${(result.byteLength / 1024).toFixed(1)} KB, Source: ${result.source}). Jurisdiction: ${currentUser.assignment.jurisdictionName}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setExportNotice(`Export failed: ${msg}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportNotice(null), 7000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Official Export Notification Banner */}
      {exportNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-mono">{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-emerald-400 hover:text-white px-2 py-0.5 rounded text-xs ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub-navigation Tabs & Quick Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1">
        <button
          onClick={() => setSubTab('triage')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            subTab === 'triage'
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          Multi-Criteria Triage & Command
        </button>

        <button
          onClick={() => setSubTab('alerts')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            subTab === 'alerts'
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Alert Response & Escalation
        </button>

        <button
          onClick={() => setSubTab('comparison')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            subTab === 'comparison'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-cyan-300'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <GitCompare className="w-4 h-4 text-cyan-300" />
          Old vs New Comparison & Diffs
        </button>

        <button
          onClick={() => setSubTab('field')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            subTab === 'field'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4 text-cyan-300" />
          Field Worker Ops & Samples
        </button>

        <button
          onClick={() => setSubTab('lab')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            subTab === 'lab'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TestTube2 className="w-4 h-4 text-purple-300" />
          Laboratory Verification
        </button>

        <button
          onClick={() => setSubTab('feedback')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            subTab === 'feedback'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-300" />
          Prediction Feedback & Outcomes
        </button>

        <button
          onClick={() => setSubTab('interventions')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            subTab === 'interventions'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Field Tasks & Directives
        </button>

        <button
          onClick={() => setSubTab('resources')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            subTab === 'resources'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Logistics & Stockpiles
        </button>

        <button
          onClick={() => setSubTab('audit')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            subTab === 'audit'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Compliance & Audit
        </button>
      </div>

      {/* Official Government CSV Export Menu */}
      <div className="relative">
        <button
          onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
          disabled={!canExport || isExporting}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border shadow-lg cursor-pointer ${
            canExport
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white border-emerald-400/40 shadow-emerald-950/40'
              : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed opacity-60'
          }`}
          title={canExport ? 'Export official government CSV data files' : 'Export restricted to authorized officers'}
        >
          <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
          <span>Export Official CSV</span>
          <span className="text-[10px] bg-emerald-950/80 px-1.5 py-0.5 rounded text-emerald-300 font-mono border border-emerald-500/30">
            Gov
          </span>
        </button>

        {isExportMenuOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-950/95 border border-emerald-500/30 shadow-2xl backdrop-blur-xl p-2 z-50 divide-y divide-slate-800 text-xs">
            <div className="p-2">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Official Reporting Data Exports
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Jurisdiction: <span className="text-slate-200">{currentUser.assignment.jurisdictionName}</span>
              </div>
            </div>

            <div className="py-1 space-y-1">
              <button
                onClick={() => handleExportCsv('alerts')}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900 transition flex items-start gap-2.5 text-slate-200 hover:text-white cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1">
                    Current Alerts Register (CSV)
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    Alert IDs, severity, disease, risk score %, trigger factors, and acknowledgment history.
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExportCsv('metrics')}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900 transition flex items-start gap-2.5 text-slate-200 hover:text-white cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0 mt-0.5">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1">
                    District Metrics & Triage (CSV)
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    MCDA composite scores, population at risk, turbidity, SVI, and actionable directives.
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExportCsv('comparison')}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900 transition flex items-start gap-2.5 text-slate-200 hover:text-white cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
                  <GitCompare className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1">
                    Old vs New Comparison Diffs (CSV)
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    Baseline vs live satellite turbidity, thermal anomalies, risk deltas, and drivers.
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExportCsv('audit')}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900 transition flex items-start gap-2.5 text-slate-200 hover:text-white cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30 shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1">
                    Operations Audit Ledger (CSV)
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    Cryptographic audit trail of officer sign-offs, sample custody, and alert actions.
                  </div>
                </div>
              </button>
            </div>

            <div className="p-2 text-[10px] text-slate-500 italic">
              All exports are recorded in the immutable compliance audit ledger.
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Sub-view Content */}
      {subTab === 'triage' && (
        <CommandCenterView
          currentUser={currentUser}
          onNavigateTab={(t) => {
            if (t === 'alerts' || t === 'comparison' || t === 'field' || t === 'lab' || t === 'feedback' || t === 'interventions' || t === 'resources' || t === 'audit') {
              setSubTab(t as any);
            } else {
              onNavigateTab(t);
            }
          }}
          onSelectDistrict={onSelectDistrict}
        />
      )}

      {subTab === 'alerts' && (
        <AlertOperationsView
          currentUser={currentUser}
          onNavigateTab={onNavigateTab}
          onSelectDistrict={onSelectDistrict}
        />
      )}

      {subTab === 'comparison' && (
        <DataComparisonView
          currentUser={currentUser}
          onSelectDistrict={onSelectDistrict}
          onNavigateTab={onNavigateTab}
        />
      )}

      {subTab === 'field' && (
        <FieldOperationsView
          currentUser={currentUser}
          onNavigateTab={onNavigateTab}
        />
      )}

      {subTab === 'lab' && (
        <LaboratoryPortalView
          currentUser={currentUser}
        />
      )}

      {subTab === 'feedback' && (
        <PredictionFeedbackView
          currentUser={currentUser}
        />
      )}

      {subTab === 'interventions' && (
        <InterventionTrackerView
          currentUser={currentUser}
          onNavigateTab={onNavigateTab}
          onSelectDistrict={onSelectDistrict}
        />
      )}

      {subTab === 'resources' && (
        <ResourceLogisticsView
          currentUser={currentUser}
          onNavigateTab={onNavigateTab}
          onSelectDistrict={onSelectDistrict}
        />
      )}

      {subTab === 'audit' && (
        <AuditTrailView currentUser={currentUser} />
      )}
    </div>
  );
};
