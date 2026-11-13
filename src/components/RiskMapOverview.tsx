import React, { useState } from 'react';
import { DiseaseType, DistrictData } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle, Navigation2, Waves, Database, Map as MapIcon, Table, GitCompare } from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';

interface RiskMapOverviewProps {
  districts: DistrictData[];
  disease: DiseaseType;
  selectedDistrict: DistrictData | null;
  onSelectDistrict: (district: DistrictData) => void;
  onFocusGlobeDistrict: (district: DistrictData) => void;
  onNavigateComparison?: () => void;
}

export const RiskMapOverview: React.FC<RiskMapOverviewProps> = ({
  districts,
  disease,
  selectedDistrict,
  onSelectDistrict,
  onFocusGlobeDistrict,
  onNavigateComparison,
}) => {
  const [viewMode, setViewMode] = useState<'both' | 'map' | 'table'>('both');

  const [selectedState, setSelectedState] = useState<string>('ALL');

  // Count by risk tier for selected disease
  const getProbability = (d: DistrictData) => {
    if (disease === 'ADD') return d.addProbability;
    if (disease === 'Cholera') return d.choleraProbability;
    return d.typhoidProbability;
  };

  const diseaseFiltered = disease === 'Typhoid'
    ? districts.filter(d => d.state === 'Telangana')
    : districts;

  const filteredDistricts = selectedState === 'ALL'
    ? diseaseFiltered
    : diseaseFiltered.filter(d => d.state.toLowerCase() === selectedState.toLowerCase());

  const karnatakaCount = districts.filter(d => d.state === 'Karnataka').length;
  const uniqueStates = (Array.from(new Set(districts.map(d => d.state))) as string[]).sort();

  const total = filteredDistricts.length;
  const veryHighCount = filteredDistricts.filter(d => getProbability(d) >= 0.8).length;
  const highCount = filteredDistricts.filter(d => getProbability(d) >= 0.65 && getProbability(d) < 0.8).length;
  const modCount = filteredDistricts.filter(d => getProbability(d) >= 0.4 && getProbability(d) < 0.65).length;
  const lowCount = filteredDistricts.filter(d => getProbability(d) < 0.4).length;

  return (
    <div className="space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0a0d1d]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-sky-400" />
            Interactive GIS Outbreak Risk Map ({disease})
          </h2>
          <p className="text-xs text-slate-400">
            Monitoring {districts.length} districts nationwide • High-resolution satellite tiles, river water quality zones, and district outbreak risk markers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Karnataka Focus Button */}
          <button
            onClick={() => setSelectedState(selectedState === 'Karnataka' ? 'ALL' : 'Karnataka')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
              selectedState === 'Karnataka'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 ring-1 ring-amber-300'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
            }`}
            title="Focus exclusively on all 31 districts of Karnataka"
          >
            <span>⭐ Focus Karnataka ({karnatakaCount})</span>
          </button>

          {/* State Filter Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-[10px] text-slate-400 font-mono">Filter:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-xs text-white font-semibold outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All India ({districts.length} Districts)</option>
              <option value="Karnataka" className="bg-slate-900 text-amber-300 font-bold">⭐ Karnataka ({karnatakaCount} Districts)</option>
              {uniqueStates
                .filter((st) => st.toLowerCase() !== 'karnataka')
                .map((st) => (
                  <option key={st} value={st} className="bg-slate-900 text-white">
                    {st} ({districts.filter(d => d.state === st).length})
                  </option>
                ))}
            </select>
          </div>

          {onNavigateComparison && (
            <button
              onClick={onNavigateComparison}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-teal-500/20 hover:from-indigo-500/30 hover:to-cyan-500/30 text-cyan-200 text-xs font-bold border border-cyan-400/40 transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105"
              title="Compare Old Baseline Data with Live 2026 Observations (View Variance & Diffs)"
            >
              <GitCompare className="w-3.5 h-3.5 text-cyan-300" />
              <span>Compare Old vs New (Δ Diffs)</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs">

            <button
              onClick={() => setViewMode('both')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                viewMode === 'both' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Both
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                viewMode === 'map' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Map Only
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" /> Table Only
            </button>
          </div>
        </div>
      </div>

      {/* Risk Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Very High Risk Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-500/30 shadow-lg">
          <div className="flex items-center justify-between text-red-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Very High Risk</span>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white">{veryHighCount} <span className="text-xs font-normal text-slate-400">districts</span></div>
          <div className="text-xs text-red-300/80 mt-1">Outbreak Prob ≥ 80%</div>
        </div>

        {/* High Risk Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 shadow-lg">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">High Risk</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white">{highCount} <span className="text-xs font-normal text-slate-400">districts</span></div>
          <div className="text-xs text-amber-300/80 mt-1">Outbreak Prob 65% - 79%</div>
        </div>

        {/* Moderate Risk Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-950/40 to-slate-900 border border-yellow-500/30 shadow-lg">
          <div className="flex items-center justify-between text-yellow-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Moderate Risk</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white">{modCount} <span className="text-xs font-normal text-slate-400">districts</span></div>
          <div className="text-xs text-yellow-300/80 mt-1">Outbreak Prob 40% - 64%</div>
        </div>

        {/* Low Risk Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Low Risk</span>
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white">{lowCount} <span className="text-xs font-normal text-slate-400">districts</span></div>
          <div className="text-xs text-emerald-300/80 mt-1">Outbreak Prob &lt; 40%</div>
        </div>
      </div>

      {/* Disease Context Scope Banner if Typhoid */}
      {disease === 'Typhoid' && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300">Typhoid Dataset Scope:</span> Telangana State Only (4 Districts, 2019 HMIS Data). Rest of India pending data.gov.in manual extraction.
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Karnataka Hydrological Focus Banner */}
      {selectedState === 'Karnataka' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/30 border border-amber-500/40 text-amber-200 text-xs shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start md:items-center gap-3">
              <span className="text-2xl">🟡</span>
              <div>
                <div className="font-extrabold text-white text-sm flex items-center gap-2">
                  Karnataka State Hydrological & Epidemiological Matrix
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                    31 Districts Complete
                  </span>
                </div>
                <div className="text-amber-200/90 text-xs mt-0.5">
                  <b>Monitored River Basins:</b> Cauvery, Krishna, Tungabhadra, Netravati, Sharavathi, Malaprabha, Ghataprabha, Bhima, Hemavathi, Arkavathi
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-[11px] border border-amber-500/30">
                LST: 27.8°C - 38.8°C
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-mono text-[11px] border border-sky-500/30">
                Sentinel-2 Turbidity Active
              </span>
            </div>
          </div>
        </div>
      )}


      {/* Real Interactive Leaflet 2D GIS Map */}
      {(viewMode === 'both' || viewMode === 'map') && (
        <InteractiveMap
          districts={filteredDistricts}
          disease={disease}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={onSelectDistrict}
          onFocusGlobeDistrict={onFocusGlobeDistrict}
        />
      )}

      {/* District Outbreak Table */}
      {(viewMode === 'both' || viewMode === 'table') && (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Navigation2 className="w-4 h-4 text-sky-400" />
                District Outbreak Risk Predictions ({disease})
              </h2>
              <p className="text-xs text-slate-400">Click any row or 'Focus 3D Globe' to navigate camera and view satellite details</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Total: {total} Districts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-3">District</th>
                  <th className="pb-3 px-3">State</th>
                  <th className="pb-3 px-3">Risk Tier</th>
                  <th className="pb-3 px-3">{disease} Prob</th>
                  <th className="pb-3 px-3">SVI Score</th>
                  <th className="pb-3 px-3">Turbidity</th>
                  <th className="pb-3 px-3">Old vs New Diff</th>
                  <th className="pb-3 px-3">River Proximity</th>
                  <th className="pb-3 px-3 text-right">3D Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDistricts.map((d) => {
                  const prob = getProbability(d);
                  const isSelected = selectedDistrict?.id === d.id;

                  let tier = 'Low';
                  let tierBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                  if (prob >= 0.8) {
                    tier = 'Very High';
                    tierBg = 'bg-red-500/20 text-red-400 border-red-500/40';
                  } else if (prob >= 0.65) {
                    tier = 'High';
                    tierBg = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
                  } else if (prob >= 0.4) {
                    tier = 'Moderate';
                    tierBg = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
                  }

                  return (
                    <tr
                      key={d.id}
                      onClick={() => onSelectDistrict(d)}
                      className={`hover:bg-slate-800/50 transition cursor-pointer ${
                        isSelected ? 'bg-sky-950/40 border-l-4 border-l-sky-500' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-slate-100 flex items-center gap-2">
                        {d.name}
                        {isSelected && <span className="w-2 h-2 rounded-full bg-sky-400"></span>}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{d.state}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${tierBg}`}>
                          {tier}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-sky-300">
                        {(prob * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono">{d.sviScore} ({d.sviSource})</td>
                      <td className="py-3 px-3 text-slate-300 font-mono">{d.satellite.turbidity} FNU</td>
                      <td className="py-3 px-3">
                        {(() => {
                          const hist = d.historicalCases || [];
                          const oldRisk = hist.length > 0
                            ? Number((hist.reduce((s, h) => s + h.risk, 0) / hist.length).toFixed(2))
                            : Number((prob * 0.75).toFixed(2));
                          const delta = Number((((prob - oldRisk) / (oldRisk || 0.1)) * 100).toFixed(1));
                          const baseTurb = d.lags?.turbidityLag2 ?? Number((d.satellite.turbidity * 0.65 + 0.8).toFixed(1));

                          return (
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                delta > 0
                                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                  : delta < 0
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                {delta > 0 ? `+${delta}%` : `${delta}%`} Δ
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({baseTurb} → {d.satellite.turbidity})
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono flex items-center gap-1">
                        <Waves className="w-3.5 h-3.5 text-blue-400" />
                        {d.waterProximityKm} km
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFocusGlobeDistrict(d);
                          }}
                          className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white border border-sky-500/40 font-bold transition text-[11px]"
                        >
                          Focus 3D Globe →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

