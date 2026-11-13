import React from 'react';
import { DiseaseType, DistrictData } from '../types';
import { TrendingUp, CloudRain, Sun, Calendar } from 'lucide-react';

interface TrendsViewProps {
  districts: DistrictData[];
  disease: DiseaseType;
}

export const TrendsView: React.FC<TrendsViewProps> = ({ districts, disease }) => {
  // Monthly monsoon multiplier curve data
  const monsoonCurve = [
    { month: 'Jan', multiplier: 0.15, riskAvg: 0.18 },
    { month: 'Feb', multiplier: 0.18, riskAvg: 0.20 },
    { month: 'Mar', multiplier: 0.25, riskAvg: 0.26 },
    { month: 'Apr', multiplier: 0.38, riskAvg: 0.35 },
    { month: 'May', multiplier: 0.55, riskAvg: 0.52 },
    { month: 'Jun', multiplier: 0.88, riskAvg: 0.82 }, // Monsoon start
    { month: 'Jul', multiplier: 1.00, riskAvg: 0.94 }, // Peak Monsoon
    { month: 'Aug', multiplier: 0.92, riskAvg: 0.88 }, // Peak Monsoon
    { month: 'Sep', multiplier: 0.72, riskAvg: 0.68 },
    { month: 'Oct', multiplier: 0.45, riskAvg: 0.42 },
    { month: 'Nov', multiplier: 0.28, riskAvg: 0.25 },
    { month: 'Dec', multiplier: 0.18, riskAvg: 0.19 },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 rounded-2xl border border-indigo-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-3 text-indigo-400 mb-1">
          <TrendingUp className="w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Temporal Trend Analysis & Monsoon Seasonality</h2>
        </div>
        <p className="text-xs text-slate-400">
          Waterborne pathogen risks peak dramatically during the Indian Southwest Monsoon (June - September) due to surface runoff, river overflow, and drainage contamination.
        </p>
      </div>

      {/* Seasonal Monsoon Curve Chart */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Monsoon Multiplier & Outbreak Risk Index (12-Month Cycle)</h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Monsoon Multiplier
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Outbreak Risk
            </span>
          </div>
        </div>

        {/* CSS Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-12 gap-2 h-48 items-end border-b border-slate-800 pb-2">
            {monsoonCurve.map((m) => (
              <div key={m.month} className="flex flex-col items-center gap-1 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  {/* Multiplier Bar */}
                  <div
                    className="w-1/2 bg-sky-500/80 group-hover:bg-sky-400 transition rounded-t-sm"
                    style={{ height: `${m.multiplier * 100}%` }}
                    title={`Monsoon Multiplier: ${m.multiplier}`}
                  ></div>
                  {/* Risk Bar */}
                  <div
                    className="w-1/2 bg-red-500/80 group-hover:bg-red-400 transition rounded-t-sm"
                    style={{ height: `${m.riskAvg * 100}%` }}
                    title={`Outbreak Risk: ${(m.riskAvg * 100).toFixed(0)}%`}
                  ></div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 mt-2">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Yearly Historical Multi-Year Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-4 h-4" /> 2019 Base Year
            </span>
            <span className="text-xs font-mono font-bold text-slate-200">1,240 cases</span>
          </div>
          <p className="text-[11px] text-slate-400">Includes HMIS Telangana Typhoid benchmark (342 Khammam, 298 Nizamabad).</p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-4 h-4" /> 2021 Post-Lockdown
            </span>
            <span className="text-xs font-mono font-bold text-slate-200">2,850 cases</span>
          </div>
          <p className="text-[11px] text-slate-400">Resurgence in Gangetic plains (Patna, Varanasi, Prayagraj).</p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Sun className="w-4 h-4" /> 2022 Record Heatwave
            </span>
            <span className="text-xs font-mono font-bold text-slate-200">3,410 cases</span>
          </div>
          <p className="text-[11px] text-slate-400">High Land Surface Temperatures (38°C+) accelerated bacterial growth.</p>
        </div>
      </div>
    </div>
  );
};
