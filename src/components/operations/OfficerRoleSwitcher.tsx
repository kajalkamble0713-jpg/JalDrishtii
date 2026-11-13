import React, { useState, useEffect } from 'react';
import {
  Shield,
  UserCheck,
  ChevronDown,
  MapPin,
  Lock,
  Building,
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react';
import { GovernmentUser, DEMO_GOVERNMENT_OFFICERS, ROLE_PERMISSIONS } from '../../services/auth/rbacEngine';

interface OfficerRoleSwitcherProps {
  currentUser: GovernmentUser;
  onUserChanged: (user: GovernmentUser) => void;
}

export const OfficerRoleSwitcher: React.FC<OfficerRoleSwitcherProps> = ({
  currentUser,
  onUserChanged,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [officers, setOfficers] = useState<GovernmentUser[]>(DEMO_GOVERNMENT_OFFICERS);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    fetch('/api/v1/auth/officers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.officers) {
          setOfficers(data.officers);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectOfficer = async (user: GovernmentUser) => {
    setIsSwitching(true);
    try {
      const res = await fetch('/api/v1/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId }),
      });
      if (res.ok) {
        const data = await res.json();
        onUserChanged(data.user);
      } else {
        onUserChanged(user);
      }
    } catch {
      onUserChanged(user);
    } finally {
      setIsSwitching(false);
      setIsOpen(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'NATIONAL_ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'STATE_HEALTH_OFFICER':
      case 'STATE_ADMIN':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'DISTRICT_COLLECTOR':
      case 'DISTRICT_ADMIN':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'DISTRICT_HEALTH_OFFICER':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'WATER_DEPARTMENT_OFFICER':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'PHC_OFFICER':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'FIELD_WORKER':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'AUDITOR':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-xs font-semibold text-slate-200 transition shadow-sm cursor-pointer"
        title="Switch Government Officer Profile (RBAC & Geographic Jurisdiction)"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-bold text-white text-[11px] truncate max-w-[140px] sm:max-w-[200px]">
              {currentUser.fullName}
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${getRoleBadgeColor(currentUser.role)}`}>
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
            {currentUser.assignment.jurisdictionName}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-[#0a0d1d] border border-cyan-500/40 rounded-2xl shadow-2xl p-3 z-50 text-xs text-slate-200 animate-fadeIn space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Government Access & Jurisdiction Switcher</span>
            </div>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.2 rounded">
              DEMO PERSONAS
            </span>
          </div>

          <p className="text-[11px] text-slate-400 px-1 leading-relaxed">
            Switch officer profiles to evaluate role-based permissions and geographic access boundaries (National, State, District, PHC, Field, Auditor).
          </p>

          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {officers.map((officer) => {
              const isSelected = officer.userId === currentUser.userId;
              return (
                <div
                  key={officer.userId}
                  onClick={() => handleSelectOfficer(officer)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400/60 shadow-md'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{officer.fullName}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${getRoleBadgeColor(officer.role)}`}>
                      {officer.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">{officer.designation}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      {officer.assignment.jurisdictionName}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Geographic restrictions are enforced on the backend. Officers cannot access alerts outside assigned territory.</span>
          </div>
        </div>
      )}
    </div>
  );
};
