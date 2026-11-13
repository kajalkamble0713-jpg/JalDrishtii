import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  Search,
  RefreshCw,
  Droplets,
  Thermometer,
  Activity,
  Layers,
  MapPin,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  X,
} from 'lucide-react';
import { ComparisonEngine, DistrictDataComparison, ComparisonStatus } from '../../services/operations/comparisonEngine';
import { DiseaseType } from '../../types';
import { GovernmentUser } from '../../services/auth/rbacEngine';
import { downloadCsvFile } from '../../utils/csvDownloader';

interface DataComparisonViewProps {
  currentUser: GovernmentUser;
  initialDisease?: DiseaseType;
  onSelectDistrict?: (districtId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const DataComparisonView: React.FC<DataComparisonViewProps> = ({
  currentUser,
  initialDisease = 'ADD',
  onSelectDistrict,
  onNavigateTab,
}) => {
  const [selectedDisease, setSelectedDisease] = useState<DiseaseType>(initialDisease);
  const [comparisonMode, setComparisonMode] = useState<'HISTORICAL_BASELINE' | 'PRIOR_LAG'>('HISTORICAL_BASELINE');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ComparisonStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewLayout, setViewLayout] = useState<'cards' | 'table'>('cards');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [inspectingDistrict, setInspectingDistrict] = useState<DistrictDataComparison | null>(null);

  const engine = useMemo(() => ComparisonEngine.getInstance(), []);

  // Compute raw comparison data
  const comparisons = useMemo(() => {
    return engine.computeComparison({
      disease: selectedDisease,
      mode: comparisonMode,
      stateId: selectedState === 'ALL' ? undefined : selectedState,
      statusFilter: selectedStatus,
    });
  }, [engine, selectedDisease, comparisonMode, selectedState, selectedStatus]);

  // Available unique states
  const availableStates = useMemo(() => {
    const all = engine.computeComparison({ disease: selectedDisease, mode: comparisonMode });
    const set = new Set<string>();
    all.forEach((item) => set.add(item.state));
    return Array.from(set).sort();
  }, [engine, selectedDisease, comparisonMode]);

  // Filtered by search query
  const filteredComparisons = useMemo(() => {
    if (!searchQuery.trim()) return comparisons;
    const q = searchQuery.toLowerCase();
    return comparisons.filter(
      (c) =>
        c.districtName.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.primaryAnomalyDriver.toLowerCase().includes(q)
    );
  }, [comparisons, searchQuery]);

  // Overall summary metrics
  const summary = useMemo(() => {
    return engine.computeSummary(comparisons);
  }, [engine, comparisons]);

  // Handle Export CSV
  const handleExportComparisonCsv = async () => {
    setIsExporting(true);
    setExportNotice(null);

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_');
    const stateSuffix = selectedState === 'ALL' ? 'all_districts' : selectedState.toLowerCase().replace(/\s+/g, '_');
    const filename = `jaldrishti_data_comparison_diff_${stateSuffix}_${selectedDisease}_${timestamp}.csv`;

    try {
      const result = await downloadCsvFile({
        filename,
        endpoint: `/api/v1/comparison/export?stateId=${encodeURIComponent(selectedState)}&disease=${encodeURIComponent(selectedDisease)}&mode=${encodeURIComponent(comparisonMode)}`,
        fallbackGenerator: () => {
          return engine.exportCsv({
            stateId: selectedState === 'ALL' ? undefined : selectedState,
            disease: selectedDisease,
            mode: comparisonMode,
          });
        },
      });

      if (result.success) {
        setExportNotice(`Official Comparison Diff CSV downloaded (${(result.byteLength / 1024).toFixed(1)} KB, Source: ${result.source}). Ready for Excel/BI reporting.`);
      }
    } catch (err) {
      console.error('Failed to export comparison CSV:', err);
      setExportNotice('Failed to export CSV. Please retry or contact system administrator.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportNotice(null), 7000);
    }
  };

  const getStatusBadge = (status: ComparisonStatus) => {
    switch (status) {
      case 'SURGING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Surging Risk (+15%Δ)
          </span>
        );
      case 'MODERATE_INCREASE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Moderate Increase
          </span>
        );
      case 'IMPROVING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ArrowDownRight className="w-3.5 h-3.5" />
            Improving (-5%Δ)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-950/40 text-cyan-300 border border-cyan-500/30">
            <Minus className="w-3.5 h-3.5" />
            Nominal / Stable
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Official Export Notice Banner */}
      {exportNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between shadow-lg">
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

      {/* Main Feature Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-cyan-950/40 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold mb-2">
              <GitCompare className="w-3.5 h-3.5" />
              Comparative Epidemiological & Remote Sensing Variance Engine
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              Old vs New Data Comparison & Difference Engine
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Audits parametric variance between historical baseline surveillance records (NFHS-5, IDSP 2021-2023, and prior 2-week lag features)
              against live 2026 satellite observations (Sentinel-2 MSI turbidity, Sentinel-3 OLCI chlorophyll, Open-Meteo thermal telemetry).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportComparisonCsv}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-950/50 cursor-pointer border border-emerald-400/40"
              title="Download pure CSV table with baseline values, current observations, and computed variance deltas"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Generating CSV...' : 'Export Comparison Diff (CSV)'}</span>
              <span className="text-[10px] bg-emerald-950/80 px-1.5 py-0.2 rounded font-mono border border-emerald-400/30">
                Data
              </span>
            </button>

            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewLayout('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewLayout === 'cards' ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cards View
              </button>
              <button
                onClick={() => setViewLayout('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewLayout === 'table' ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ledger Table
              </button>
            </div>
          </div>
        </div>

        {/* KPI Difference Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Districts Evaluated</div>
            <div className="text-xl font-black text-white mt-0.5">{summary.totalDistricts}</div>
            <div className="text-[10px] text-cyan-400 flex items-center gap-1 mt-0.5">
              <span>Karnataka: {summary.karnatakaDistrictsCount}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-red-950/30 border border-red-500/30">
            <div className="text-[10px] font-mono text-red-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Surging Districts
            </div>
            <div className="text-xl font-black text-red-400 mt-0.5">{summary.surgingCount}</div>
            <div className="text-[10px] text-red-300/80 mt-0.5">Risk increased &gt; 15%</div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30">
            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Moderate Increases</div>
            <div className="text-xl font-black text-amber-300 mt-0.5">{summary.moderateIncreaseCount}</div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">Delta +5% to +15%</div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Improving / Safe
            </div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{summary.improvingCount}</div>
            <div className="text-[10px] text-emerald-300/80 mt-0.5">Risk reduction &gt; 5%</div>
          </div>

          <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Avg Risk Delta</div>
            <div className="text-xl font-black text-cyan-300 mt-0.5">
              {summary.averageRiskDeltaPercent > 0 ? `+${summary.averageRiskDeltaPercent}%` : `${summary.averageRiskDeltaPercent}%`}
            </div>
            <div className="text-[10px] text-cyan-300/80 mt-0.5">Across monitored basin</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Avg Turbidity Diff</div>
            <div className="text-xl font-black text-teal-300 mt-0.5">
              {summary.averageTurbidityDelta > 0 ? `+${summary.averageTurbidityDelta}` : summary.averageTurbidityDelta} FNU
            </div>
            <div className="text-[10px] text-teal-400/80 mt-0.5">Optical water clarity diff</div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Comparison Baseline Mode */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
            <span className="text-[10px] font-mono text-slate-400">Baseline Window:</span>
            <select
              value={comparisonMode}
              onChange={(e) => setComparisonMode(e.target.value as any)}
              className="bg-transparent text-xs text-cyan-300 font-semibold outline-none cursor-pointer"
            >
              <option value="HISTORICAL_BASELINE" className="bg-slate-900 text-white">
                Historical Baseline (3-Year Avg) vs Live 2026
              </option>
              <option value="PRIOR_LAG" className="bg-slate-900 text-white">
                Prior 2-Week Lag (Week -2) vs Current (Week 0)
              </option>
            </select>
          </div>

          {/* Disease Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
            <span className="text-[10px] font-mono text-slate-400">Disease:</span>
            <select
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value as DiseaseType)}
              className="bg-transparent text-xs text-white font-semibold outline-none cursor-pointer"
            >
              <option value="ADD" className="bg-slate-900 text-white">Acute Diarrheal Disease (ADD)</option>
              <option value="Cholera" className="bg-slate-900 text-white">Cholera (Vibrio cholerae)</option>
              <option value="Typhoid" className="bg-slate-900 text-white">Typhoid (Salmonella Typhi)</option>
            </select>
          </div>

          {/* State Filter (with Karnataka highlight) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedState(selectedState === 'Karnataka' ? 'ALL' : 'Karnataka')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                selectedState === 'Karnataka'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-1 ring-amber-300'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
              }`}
            >
              ⭐ Karnataka (31)
            </button>
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
              <span className="text-[10px] font-mono text-slate-400">State:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-xs text-amber-300 font-semibold outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-white">All India (119 Districts)</option>
                <option value="Karnataka" className="bg-slate-900 text-amber-300 font-bold">
                  ⭐ Karnataka (All 31 Districts Focus)
                </option>
                {availableStates
                  .filter((st) => st.toLowerCase() !== 'karnataka')
                  .map((state) => (
                    <option key={state} value={state} className="bg-slate-900 text-white">
                      {state}
                    </option>
                  ))}
              </select>
            </div>
          </div>


          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
            <span className="text-[10px] font-mono text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-transparent text-xs text-white font-semibold outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Trajectories</option>
              <option value="SURGING" className="bg-slate-900 text-red-400 font-bold">Surging Risk (▲ High Delta)</option>
              <option value="MODERATE_INCREASE" className="bg-slate-900 text-amber-300">Moderate Increase</option>
              <option value="STABLE" className="bg-slate-900 text-cyan-300">Stable / Nominal</option>
              <option value="IMPROVING" className="bg-slate-900 text-emerald-400">Improving (▼ Risk Reduction)</option>
            </select>
          </div>
        </div>

        {/* Search District */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search district name..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Content Layouts: Cards or Table */}
      {viewLayout === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComparisons.map((c) => {
            const isKarnataka = c.state.toLowerCase() === 'karnataka';
            const riskDeltaDirection = c.riskScoreDeltaPercent > 0 ? 'increase' : c.riskScoreDeltaPercent < 0 ? 'decrease' : 'none';

            return (
              <div
                key={c.districtId}
                className={`p-5 rounded-3xl bg-slate-900/80 border transition-all duration-300 hover:border-cyan-400/60 shadow-xl flex flex-col justify-between ${
                  isKarnataka
                    ? 'border-amber-500/50 bg-gradient-to-b from-slate-900 to-amber-950/20 shadow-amber-950/30'
                    : c.status === 'SURGING'
                    ? 'border-red-500/40'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-base">{c.districtName}</span>
                        {isKarnataka && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold font-mono">
                            Karnataka Focus
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{c.state}</span>
                        <span className="text-slate-600">•</span>
                        <span className="font-mono text-[10px]">
                          {c.lat.toFixed(2)}°N, {c.lng.toFixed(2)}°E
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(c.status)}
                  </div>

                  {/* Primary Outbreak Risk Difference Banner */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span className="font-mono flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        Outbreak Risk Trajectory
                      </span>
                      <span className="text-[11px] font-bold text-slate-300">
                        {c.oldRiskTier} <ArrowRight className="inline w-3 h-3 mx-0.5" /> {c.newRiskTier}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <div className="text-xs text-slate-400">
                          <span className="block text-[10px] uppercase font-mono text-slate-500">Old Baseline</span>
                          <span className="font-mono font-bold text-slate-300 text-sm">
                            {Math.round(c.baselineRiskScore * 100)}%
                          </span>
                        </div>

                        <ArrowRight className="w-4 h-4 text-cyan-400" />

                        <div className="text-xs text-white">
                          <span className="block text-[10px] uppercase font-mono text-slate-500">New Live</span>
                          <span className={`font-mono font-extrabold text-base ${
                            c.currentRiskScore >= 0.7 ? 'text-red-400' : c.currentRiskScore >= 0.5 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {Math.round(c.currentRiskScore * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className={`px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold flex items-center gap-1 ${
                        c.riskScoreDeltaPercent > 0
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : c.riskScoreDeltaPercent < 0
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {c.riskScoreDeltaPercent > 0 ? (
                          <>
                            <TrendingUp className="w-3.5 h-3.5" />
                            +Δ {c.riskScoreDeltaPercent}%
                          </>
                        ) : c.riskScoreDeltaPercent < 0 ? (
                          <>
                            <TrendingDown className="w-3.5 h-3.5" />
                            -Δ {Math.abs(c.riskScoreDeltaPercent)}%
                          </>
                        ) : (
                          <>0.0% Δ</>
                        )}
                      </div>
                    </div>

                    {/* Visual Comparison Delta Bar */}
                    <div className="mt-3 relative h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-slate-600 rounded-full"
                        style={{ width: `${Math.min(100, c.baselineRiskScore * 100)}%` }}
                        title={`Baseline: ${Math.round(c.baselineRiskScore * 100)}%`}
                      />
                      <div
                        className={`absolute left-0 top-0 bottom-0 rounded-full transition-all duration-500 opacity-80 ${
                          c.currentRiskScore >= 0.7
                            ? 'bg-red-500'
                            : c.currentRiskScore >= 0.5
                            ? 'bg-amber-400'
                            : 'bg-cyan-400'
                        }`}
                        style={{ width: `${Math.min(100, c.currentRiskScore * 100)}%` }}
                        title={`Current Live: ${Math.round(c.currentRiskScore * 100)}%`}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Parametric Environmental Differences */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                    {/* Turbidity Difference */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-cyan-400" />
                        Turbidity (FNU)
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-slate-400 text-xs">{c.baselineTurbidity}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span className="font-mono font-bold text-white text-xs">{c.currentTurbidity}</span>
                      </div>
                      <div className={`text-[10px] font-mono font-semibold mt-1 ${
                        c.turbidityDelta > 0 ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {c.turbidityDelta > 0 ? `+${c.turbidityDelta} FNU (+${c.turbidityDeltaPercent}%)` : `${c.turbidityDelta} FNU`}
                      </div>
                    </div>

                    {/* Temperature Difference */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-amber-400" />
                        Surface Temp (°C)
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-slate-400 text-xs">{c.baselineLstCelsius}°</span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span className="font-mono font-bold text-white text-xs">{c.currentLstCelsius}°</span>
                      </div>
                      <div className={`text-[10px] font-mono font-semibold mt-1 ${
                        c.lstDeltaCelsius > 0 ? 'text-amber-400' : 'text-cyan-400'
                      }`}>
                        {c.lstDeltaCelsius > 0 ? `+${c.lstDeltaCelsius}°C thermal anomaly` : `${c.lstDeltaCelsius}°C`}
                      </div>
                    </div>

                    {/* NDCI Chlorophyll */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        Chlorophyll (NDCI)
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-slate-400 text-xs">{c.baselineNdci}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span className="font-mono font-bold text-white text-xs">{c.currentNdci}</span>
                      </div>
                      <div className={`text-[10px] font-mono font-semibold mt-1 ${
                        c.ndciDelta > 0 ? 'text-teal-300' : 'text-slate-400'
                      }`}>
                        {c.ndciDelta > 0 ? `+${c.ndciDelta} bloom proxy` : `${c.ndciDelta}`}
                      </div>
                    </div>

                    {/* Caseload Variance */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Activity className="w-3 h-3 text-purple-400" />
                        Caseload / Month
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-slate-400 text-xs">{c.baselineCaseload}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span className="font-mono font-bold text-white text-xs">{c.projectedCaseload}</span>
                      </div>
                      <div className={`text-[10px] font-mono font-semibold mt-1 ${
                        c.caseloadDelta > 0 ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {c.caseloadDelta > 0 ? `+${c.caseloadDelta} excess cases` : `${c.caseloadDelta} cases`}
                      </div>
                    </div>
                  </div>

                  {/* Primary Variance Driver */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs">
                    <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                      Difference Cause & Scientific Driver
                    </div>
                    <div className="text-slate-300 text-[11px] mt-0.5 leading-snug">
                      {c.primaryAnomalyDriver}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setInspectingDistrict(c)}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-indigo-500/40"
                    title="Inspect deep side-by-side Old vs New differences"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>Inspect Diff</span>
                  </button>

                  {onSelectDistrict && (
                    <button
                      onClick={() => onSelectDistrict(c.districtId)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer border border-cyan-500/30 whitespace-nowrap"
                    >
                      <span>Deep Detail</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Ledger Table View */
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">District & State</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Old Risk</th>
                  <th className="p-3.5 text-right">New Risk</th>
                  <th className="p-3.5 text-right">Risk Delta (%)</th>
                  <th className="p-3.5 text-right">Old Turbidity</th>
                  <th className="p-3.5 text-right">New Turbidity</th>
                  <th className="p-3.5 text-right">Turb Delta</th>
                  <th className="p-3.5 text-right">Temp Diff</th>
                  <th className="p-3.5">Primary Anomaly Driver</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredComparisons.map((c) => {
                  const isKarnataka = c.state.toLowerCase() === 'karnataka';
                  return (
                    <tr
                      key={c.districtId}
                      className={`hover:bg-slate-800/60 transition ${
                        isKarnataka ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {c.districtName}
                          {isKarnataka && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                              KA
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{c.state}</div>
                      </td>
                      <td className="p-3.5">{getStatusBadge(c.status)}</td>
                      <td className="p-3.5 text-right font-mono text-slate-400">
                        {Math.round(c.baselineRiskScore * 100)}%
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-white">
                        {Math.round(c.currentRiskScore * 100)}%
                      </td>
                      <td className="p-3.5 text-right font-mono font-extrabold">
                        <span className={c.riskScoreDeltaPercent > 0 ? 'text-red-400' : 'text-emerald-400'}>
                          {c.riskScoreDeltaPercent > 0 ? `+${c.riskScoreDeltaPercent}%` : `${c.riskScoreDeltaPercent}%`}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-400">{c.baselineTurbidity}</td>
                      <td className="p-3.5 text-right font-mono text-white font-bold">{c.currentTurbidity}</td>
                      <td className="p-3.5 text-right font-mono font-semibold">
                        <span className={c.turbidityDelta > 0 ? 'text-red-400' : 'text-emerald-400'}>
                          {c.turbidityDelta > 0 ? `+${c.turbidityDelta}` : c.turbidityDelta}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-amber-400">
                        {c.lstDeltaCelsius > 0 ? `+${c.lstDeltaCelsius}°C` : `${c.lstDeltaCelsius}°C`}
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-300 max-w-xs truncate" title={c.primaryAnomalyDriver}>
                        {c.primaryAnomalyDriver}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingDistrict(c)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition cursor-pointer whitespace-nowrap"
                            title="Inspect deep side-by-side Old vs New differences"
                          >
                            Diffs
                          </button>
                          {onSelectDistrict && (
                            <button
                              onClick={() => onSelectDistrict(c.districtId)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                            >
                              Detail
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deep District Difference Inspector Modal */}
      {inspectingDistrict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950 border border-indigo-500/40 p-6 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold mb-1 border border-indigo-500/40">
                  <GitCompare className="w-3.5 h-3.5" />
                  Deep Difference & Variance Inspector
                </div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>{inspectingDistrict.districtName}</span>
                  <span className="text-sm font-normal text-slate-400">({inspectingDistrict.state})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Target Disease: <b className="text-white">{inspectingDistrict.disease}</b> • GPS: {inspectingDistrict.lat.toFixed(3)}°N, {inspectingDistrict.lng.toFixed(3)}°E
                </p>
              </div>

              <button
                onClick={() => setInspectingDistrict(null)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trajectory Banner */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              inspectingDistrict.status === 'SURGING'
                ? 'bg-red-950/40 border-red-500/40 text-red-200'
                : inspectingDistrict.status === 'MODERATE_INCREASE'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : inspectingDistrict.status === 'IMPROVING'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
            }`}>
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  Comparative Trajectory: {inspectingDistrict.status.replace(/_/g, ' ')}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  <b>Scientific Root-Cause Driver:</b> {inspectingDistrict.primaryAnomalyDriver}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-black font-mono">
                  {inspectingDistrict.riskScoreDeltaPercent > 0 ? `+${inspectingDistrict.riskScoreDeltaPercent}%` : `${inspectingDistrict.riskScoreDeltaPercent}%`} Δ
                </div>
                <div className="text-[10px] uppercase font-mono text-slate-400">Variance vs Baseline</div>
              </div>
            </div>

            {/* Side-by-Side 3-Column Variance Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: Old Data (Baseline) */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
                  🏛️ Old Data (Historical Baseline)
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Outbreak Risk Probability</span>
                    <span className="font-mono font-extrabold text-white text-base">
                      {Math.round(inspectingDistrict.baselineRiskScore * 100)}% ({inspectingDistrict.oldRiskTier})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Turbidity (Water Clarity)</span>
                    <span className="font-mono font-bold text-slate-300">{inspectingDistrict.baselineTurbidity} FNU</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Surface Temperature (LST)</span>
                    <span className="font-mono font-bold text-slate-300">{inspectingDistrict.baselineLstCelsius}°C</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Chlorophyll-a (NDCI)</span>
                    <span className="font-mono font-bold text-slate-300">{inspectingDistrict.baselineNdci}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Water Extent (NDWI)</span>
                    <span className="font-mono font-bold text-slate-300">{inspectingDistrict.baselineNdwi}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Historical Monthly Caseload</span>
                    <span className="font-mono font-bold text-slate-300">{inspectingDistrict.baselineCaseload} cases/mo</span>
                  </div>
                </div>
                <div className="pt-2 text-[10px] text-slate-500 italic border-t border-slate-800/80">
                  Source: 3-Year IDSP Surveillance & NFHS-5 SVI Baseline
                </div>
              </div>

              {/* Column 2: Parametric Difference (Delta) */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-3">
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono border-b border-indigo-500/30 pb-2 flex items-center justify-between">
                  <span>⚖️ Computed Difference (Δ)</span>
                  <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.2 rounded font-mono">Variance</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Risk Probability Delta</span>
                    <span className={`font-mono font-black text-base ${inspectingDistrict.riskScoreDeltaPercent > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {inspectingDistrict.riskScoreDeltaPercent > 0 ? `+${inspectingDistrict.riskScoreDeltaPercent}%` : `${inspectingDistrict.riskScoreDeltaPercent}%`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Turbidity Variance</span>
                    <span className={`font-mono font-bold ${inspectingDistrict.turbidityDelta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {inspectingDistrict.turbidityDelta > 0 ? `+${inspectingDistrict.turbidityDelta} FNU (+${inspectingDistrict.turbidityDeltaPercent}%)` : `${inspectingDistrict.turbidityDelta} FNU`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Thermal Anomaly</span>
                    <span className={`font-mono font-bold ${inspectingDistrict.lstDeltaCelsius > 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {inspectingDistrict.lstDeltaCelsius > 0 ? `+${inspectingDistrict.lstDeltaCelsius}°C warming` : `${inspectingDistrict.lstDeltaCelsius}°C`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Bloom Proxy Shift</span>
                    <span className={`font-mono font-bold ${inspectingDistrict.ndciDelta > 0 ? 'text-teal-300' : 'text-slate-400'}`}>
                      {inspectingDistrict.ndciDelta > 0 ? `+${inspectingDistrict.ndciDelta} NDCI` : `${inspectingDistrict.ndciDelta}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Water Inundation Shift</span>
                    <span className={`font-mono font-bold ${inspectingDistrict.ndwiDelta > 0 ? 'text-cyan-400' : 'text-slate-400'}`}>
                      {inspectingDistrict.ndwiDelta > 0 ? `+${inspectingDistrict.ndwiDelta} NDWI` : `${inspectingDistrict.ndwiDelta}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Caseload Variance</span>
                    <span className={`font-mono font-bold ${inspectingDistrict.caseloadDelta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {inspectingDistrict.caseloadDelta > 0 ? `+${inspectingDistrict.caseloadDelta} excess cases` : `${inspectingDistrict.caseloadDelta} cases`}
                    </span>
                  </div>
                </div>
                <div className="pt-2 text-[10px] text-indigo-300/80 italic border-t border-indigo-500/20">
                  Computed via Automated Spatial Inversion
                </div>
              </div>

              {/* Column 3: New Data (Live 2026) */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 space-y-3">
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono border-b border-cyan-500/30 pb-2">
                  🛰️ New Data (Live 2026 Telemetry)
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Live Predicted Outbreak Risk</span>
                    <span className={`font-mono font-extrabold text-base ${
                      inspectingDistrict.currentRiskScore >= 0.7 ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {Math.round(inspectingDistrict.currentRiskScore * 100)}% ({inspectingDistrict.newRiskTier})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Live Sentinel-2 Turbidity</span>
                    <span className="font-mono font-bold text-sky-400">{inspectingDistrict.currentTurbidity} FNU</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Live Open-Meteo Temperature</span>
                    <span className="font-mono font-bold text-amber-400">{inspectingDistrict.currentLstCelsius}°C</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Live Sentinel-3 Chlorophyll</span>
                    <span className="font-mono font-bold text-emerald-400">{inspectingDistrict.currentNdci}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Live Sentinel-2 NDWI</span>
                    <span className="font-mono font-bold text-cyan-400">{inspectingDistrict.currentNdwi}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Projected 2026 Caseload</span>
                    <span className="font-mono font-bold text-purple-400">{inspectingDistrict.projectedCaseload} cases/mo</span>
                  </div>
                </div>
                <div className="pt-2 text-[10px] text-cyan-400/80 italic border-t border-cyan-500/20">
                  Source: Real-time Multi-spectral Earth Observation (2026)
                </div>
              </div>
            </div>

            {/* Prescribed Government Action */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                Prescribed Response Directive for this Variance
              </div>
              <div className="text-slate-200 mt-1 leading-relaxed">
                {inspectingDistrict.mitigationRecommendation}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={async () => {
                  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_');
                  await downloadCsvFile({
                    filename: `jaldrishti_${inspectingDistrict.districtId}_diff_${timestamp}.csv`,
                    fallbackGenerator: () => {
                      return engine.exportCsv({ stateId: inspectingDistrict.state });
                    },
                  });
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Export District Diff (CSV)</span>
              </button>

              <div className="flex items-center gap-2">
                {onSelectDistrict && (
                  <button
                    onClick={() => {
                      onSelectDistrict(inspectingDistrict.districtId);
                      setInspectingDistrict(null);
                      if (onNavigateTab) onNavigateTab('detail');
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Open District Detail Analytics</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setInspectingDistrict(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
