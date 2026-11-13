import React, { useState } from 'react';
import { DiseaseType, GlobeControlsState, OutbreakAlert } from '../types';
import { Bell, Globe, Activity, ShieldAlert, CheckCircle2, Sparkles, ShieldCheck, GitCompare } from 'lucide-react';
import { GovernmentUser } from '../services/auth/rbacEngine';
import { OfficerRoleSwitcher } from './operations/OfficerRoleSwitcher';

interface HeaderProps {
  currentDisease: DiseaseType;
  onSelectDisease: (disease: DiseaseType) => void;
  alerts: OutbreakAlert[];
  globeControls: GlobeControlsState;
  onUpdateGlobeControls: (updater: (prev: GlobeControlsState) => GlobeControlsState) => void;
  onOpenDeveloperPrompt: () => void;
  onOpenDataProvenance: () => void;
  onSelectAlertDistrict: (districtId: string) => void;
  onReplaySplash: () => void;
  onOpenComparison?: () => void;
  isLiveActive?: boolean;
  isLoadingLive?: boolean;
  currentUser?: GovernmentUser;
  onUserChanged?: (user: GovernmentUser) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDisease,
  onSelectDisease,
  alerts,
  globeControls,
  onUpdateGlobeControls,
  onOpenDeveloperPrompt,
  onOpenDataProvenance,
  onSelectAlertDistrict,
  onReplaySplash,
  onOpenComparison,
  isLiveActive = false,
  isLoadingLive = false,
  currentUser,
  onUserChanged,
}) => {
  const [showAlertsPopover, setShowAlertsPopover] = useState(false);

  const highAlertsCount = alerts.filter(a => a.riskTier === 'High' || a.riskTier === 'Very High').length;

  return (
    <header className="sticky top-0 z-40 bg-[#030712]/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-300/40 relative">
            <Globe className="w-6 h-6 animate-pulse" />
            {isLiveActive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white font-sans">
                JalDrishti <span className="text-cyan-400 font-bold">Space</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-400/40">
                v5.0 PRO
              </span>
              {isLoadingLive ? (
                <span className="text-[10px] text-slate-400 font-mono animate-pulse">CONNECTING API...</span>
              ) : isLiveActive ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  LIVE METEO
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                  STATIC FALLBACK
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">Spaceborne Waterborne Outbreak Observatory • Sentinel-2 ML</p>
          </div>
        </div>

        {/* Global Disease Selector */}
        <div className="flex items-center p-1 bg-slate-950/90 rounded-xl border border-slate-800 shadow-inner">
          {(['ADD', 'Cholera', 'Typhoid'] as DiseaseType[]).map((disease) => {
            const isActive = currentDisease === disease;
            return (
              <button
                key={disease}
                onClick={() => onSelectDisease(disease)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-cyan-500/30 border border-cyan-300/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                {disease}
                {disease === 'Typhoid' && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 ml-1">TS-Only</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls & Notification Bell */}
        <div className="flex items-center gap-2.5">
          {/* Replay Astro Intro Button */}
          <button
            onClick={onReplaySplash}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition flex items-center gap-1.5 shadow-md shadow-cyan-500/10 hover:scale-105"
            title="Replay Astro Title Intro Video Animation"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Astro Intro</span>
          </button>

          {/* Data Health & Provenance Modal Trigger */}
          <button
            onClick={onOpenDataProvenance}
            className="px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xs font-semibold border border-cyan-500/40 transition flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
            title="Inspect Data Health, Quality Scores, and Source Provenance"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Data Health & Provenance</span>
          </button>

          {/* Quick Old vs New Data Comparison Action */}
          {onOpenComparison && (
            <button
              onClick={onOpenComparison}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/30 to-cyan-500/30 hover:from-indigo-500/50 hover:to-cyan-500/50 text-cyan-200 text-xs font-bold border border-cyan-400/50 transition flex items-center gap-1.5 shadow-md shadow-indigo-950/40 hover:scale-105 cursor-pointer ring-1 ring-cyan-400/30"
              title="Compare Old Baseline Data with Live 2026 Observations (View Variance & Diffs)"
            >
              <GitCompare className="w-3.5 h-3.5 text-cyan-300" />
              <span>Old vs New Diff</span>
            </button>
          )}

          {/* Officer Persona Switcher (RBAC & Geographic Jurisdiction) */}
          {currentUser && onUserChanged && (
            <OfficerRoleSwitcher currentUser={currentUser} onUserChanged={onUserChanged} />
          )}

          {/* Functional Notification Bell (st.popover equivalent) */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsPopover(!showAlertsPopover)}
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Outbreak Notifications"
            >
              <Bell className="w-4 h-4" />
              {highAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {highAlertsCount}
                </span>
              )}
            </button>

            {/* Notification Popover Panel */}
            {showAlertsPopover && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 text-xs text-slate-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <span className="font-bold text-red-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    High Outbreak Alerts ({highAlertsCount})
                  </span>
                  <button onClick={() => setShowAlertsPopover(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        onSelectAlertDistrict(alert.districtId);
                        setShowAlertsPopover(false);
                      }}
                      className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sky-300">{alert.districtName}, {alert.state}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          {alert.riskTier} ({Math.round(alert.riskScore * 100)}%)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight mb-1">{alert.triggerFactor}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Target: {alert.disease}</span>
                        <span>{alert.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
