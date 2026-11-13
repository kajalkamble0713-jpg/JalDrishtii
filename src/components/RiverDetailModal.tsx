import React from 'react';
import { RiverData } from '../types';
import { Waves, X, Navigation, AlertTriangle, ShieldCheck, Activity, Droplets, ArrowRight, Thermometer, MapPin, Gauge, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

interface RiverDetailModalProps {
  river: RiverData | null;
  onClose: () => void;
  onSelectDistrictByName?: (districtName: string) => void;
}

export const RiverDetailModal: React.FC<RiverDetailModalProps> = ({
  river,
  onClose,
  onSelectDistrictByName,
}) => {
  if (!river) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Very High':
        return 'text-red-400 bg-red-950/80 border-red-500/50';
      case 'High':
        return 'text-amber-400 bg-amber-950/80 border-amber-500/50';
      case 'Moderate':
        return 'text-yellow-400 bg-yellow-950/80 border-yellow-500/50';
      case 'Low':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50';
      default:
        return 'text-cyan-400 bg-cyan-950/80 border-cyan-500/50';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0a0d1d] border border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.3)] text-slate-100 p-6 sm:p-8 space-y-6">
        {/* Top Close & Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 text-cyan-300 shadow-lg">
              <Waves className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  {river.type} • {river.lengthKm.toLocaleString()} KM BASIN
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border uppercase ${getRiskColor(river.outbreakRiskLevel)}`}>
                  {river.outbreakRiskLevel} Outbreak Risk
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                {river.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400 text-slate-400 hover:text-white transition cursor-pointer"
            title="Close Basin Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Origin & Outflow Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Glacial Origin / Source</span>
              <span className="text-slate-200 font-semibold">{river.origin}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Navigation className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Outflow Estuary / Delta</span>
              <span className="text-slate-200 font-semibold">{river.outflow}</span>
            </div>
          </div>
        </div>

        {/* Sentinel-2 Satellite Hydro-Telemetry Grid */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Sentinel-2 L2A Water Quality Telemetry
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold mb-1">Turbidity</div>
              <div className="text-xl font-black text-amber-400 font-mono">{river.turbidity}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Particulate suspended matter</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold mb-1">Chlorophyll NDCI</div>
              <div className="text-xl font-black text-emerald-400 font-mono">{river.ndciValue}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Algae bloom probability</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold mb-1">Organic CDOM</div>
              <div className="text-xl font-black text-purple-400 font-mono">{river.cdomValue}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Dissolved organic matter</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold mb-1">Dissolved O₂</div>
              <div className="text-xl font-black text-cyan-400 font-mono">{river.dissolvedOxygenMgL} <span className="text-xs font-normal">mg/L</span></div>
              <div className="text-[10px] text-slate-500 mt-0.5">Biochemical oxygen demand</div>
            </div>
          </div>
        </div>

        {/* River Course & Transited Districts Sequence Flow */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              River Flow Course & Transited Districts ({river.districtsTransited.length} Key Centers)
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Downstream Propagation Lag: <strong className="text-cyan-300">{river.downstreamPropagationHours} Hours</strong>
            </span>
          </div>

          <div className="relative p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
            <div className="text-xs text-slate-300 leading-relaxed font-sans">
              <strong className="text-white">States Transited:</strong> {river.statesTransited.join(', ')} • Serving <strong className="text-cyan-300">{river.basinPopulationMillions} Million</strong> basin residents.
            </div>

            {/* Sequence Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              {river.districtsTransited.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectDistrictByName && onSelectDistrictByName(item.name)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    item.riskLevel === 'Very High'
                      ? 'bg-red-950/40 border-red-500/40 hover:border-red-400'
                      : item.riskLevel === 'High'
                      ? 'bg-amber-950/40 border-amber-500/40 hover:border-amber-400'
                      : item.riskLevel === 'Moderate'
                      ? 'bg-yellow-950/40 border-yellow-500/40 hover:border-yellow-400'
                      : 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400">{item.role}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                      item.riskLevel === 'Very High' ? 'text-red-400 bg-red-900/50' :
                      item.riskLevel === 'High' ? 'text-amber-400 bg-amber-900/50' :
                      item.riskLevel === 'Moderate' ? 'text-yellow-400 bg-yellow-900/50' : 'text-emerald-400 bg-emerald-900/50'
                    }`}>
                      {item.riskLevel}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white flex items-center justify-between">
                    <span>{item.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                  </div>
                  <div className="text-[10px] text-slate-400">{item.state}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Threat Analysis & WASH Action Plan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Threat Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/50 to-slate-900 border border-red-500/30 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Basin Waterborne Threat
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {river.keyOutbreakThreat}
            </p>
          </div>

          {/* Action Plan Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Actionable WASH Response
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {river.recommendedWashAction}
            </p>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            Close Basin Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
