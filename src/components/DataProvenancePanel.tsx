import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Gauge,
  RefreshCw,
  X,
  Database,
  ExternalLink,
  Layers,
  Sparkles,
  Server
} from 'lucide-react';
import { DataProviderRegistry, SourceHealthStatus } from '../services/data/registry';
import { IngestionScheduler } from '../services/data/scheduler/IngestionScheduler';
import { IngestionJobRecord } from '../services/data/types';

interface DataProvenancePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataProvenancePanel: React.FC<DataProvenancePanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sources' | 'jobs' | 'lineage' | 'database'>('sources');
  const [sources, setSources] = useState<SourceHealthStatus[]>([]);
  const [platformStats, setPlatformStats] = useState({ score: 0, liveSourceCount: 0, totalSources: 0 });
  const [jobs, setJobs] = useState<IngestionJobRecord[]>([]);
  const [dbStatus, setDbStatus] = useState<{
    isConnected: boolean;
    poolSize: number;
    postgisInstalled: boolean;
    migrationsRun: string[];
    databaseName?: string;
  }>({
    isConnected: false,
    poolSize: 0,
    postgisInstalled: false,
    migrationsRun: ['001_production_postgis_schema.sql'],
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState<string | null>(null);

  const loadDataHealth = async () => {
    try {
      const res = await fetch('/api/v1/data-status');
      if (res.ok) {
        const json = await res.json();
        if (json && json.sources) {
          setSources(json.sources);
          setPlatformStats({
            score: json.platformScore,
            liveSourceCount: json.liveSourceCount,
            totalSources: json.totalSources,
          });
        }
      }
    } catch {
      const registry = DataProviderRegistry.getInstance();
      setSources(registry.getHealthSummary());
      setPlatformStats(registry.getOverallPlatformQuality());
    }

    try {
      const dbRes = await fetch('/api/v1/database/status');
      if (dbRes.ok) {
        const dbJson = await dbRes.json();
        setDbStatus(dbJson);
      }
    } catch {
      // Fallback
    }

    try {
      const jobRes = await fetch('/api/v1/ingestion/jobs');
      if (jobRes.ok) {
        const jobJson = await jobRes.json();
        if (jobJson && jobJson.jobs) {
          setJobs(jobJson.jobs);
          return;
        }
      }
    } catch {
      // Fallback
    }
    const scheduler = IngestionScheduler.getInstance();
    setJobs(scheduler.listJobs());
  };

  useEffect(() => {
    if (isOpen) {
      loadDataHealth();
    }
  }, [isOpen]);

  const handleRunJob = async (jobId: string) => {
    setIsRefreshing(true);
    setTriggerStatus(`Running ${jobId}...`);
    try {
      const scheduler = IngestionScheduler.getInstance();
      const res = await scheduler.runJob(jobId);
      setTriggerStatus(res.success ? `Job ${jobId} finished: ${res.recordsIngested} records` : `Job failed: ${res.message}`);
      loadDataHealth();
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setTriggerStatus(null), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0a0d1d] border border-cyan-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.25)] space-y-6 text-slate-100 animate-fadeIn">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 text-cyan-300 shadow-lg">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Data Integrity, Health & Provenance Panel</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">
                  ISO 19115 Schema
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-source telemetry health monitoring with real-time quality scoring, verified provenance, and fail-safe transparency.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Platform Quality Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Platform Data Quality</div>
              <div className="text-2xl font-black text-cyan-400 mt-0.5">{platformStats.score}/100</div>
              <div className="text-[10px] text-slate-500">Weighted cross-source composite</div>
            </div>
            <Gauge className="w-8 h-8 text-cyan-400/40" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Live Streaming Feeds</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">
                {platformStats.liveSourceCount} <span className="text-xs text-slate-400">/ {platformStats.totalSources}</span>
              </div>
              <div className="text-[10px] text-emerald-400/80">Active operational APIs</div>
            </div>
            <Radio className="w-8 h-8 text-emerald-400/40 animate-pulse" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Scientific Honesty Policy</div>
              <div className="text-sm font-bold text-indigo-300 mt-1">Zero Synthetic Hallucination</div>
              <div className="text-[10px] text-slate-400">Unconfigured feeds flagged strictly</div>
            </div>
            <Database className="w-8 h-8 text-indigo-400/40" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'sources'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> 7-Source Telemetry Grid
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'jobs'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Scheduled Ingestion Jobs
          </button>
          <button
            onClick={() => setActiveTab('lineage')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'lineage'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Research Lineage & Disclosure
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" /> PostgreSQL + PostGIS Layer
          </button>
        </div>

        {triggerStatus && (
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-300 flex items-center gap-2 animate-fadeIn">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            {triggerStatus}
          </div>
        )}

        {/* Tab 1: Sources Grid */}
        {activeTab === 'sources' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sources.map((src) => (
                <div
                  key={src.sourceType}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-white leading-snug">{src.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{src.provider}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold border shrink-0 ${src.badgeClass}`}
                    >
                      {src.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                    {src.notes}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-cyan-400" />
                      Quality: <strong className="text-white font-mono">{src.qualityScore}/100</strong>
                    </span>
                    <span>
                      Observed:{' '}
                      <strong className="text-slate-300 font-mono">
                        {src.lastObservedAt ? new Date(src.lastObservedAt).toLocaleDateString() : 'N/A'}
                      </strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Scheduler Jobs */}
        {activeTab === 'jobs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Automated background pipelines with exponential backoff & failure logging</span>
              <button
                onClick={loadDataHealth}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Refresh Table
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {jobs.map((job) => (
                <div
                  key={job.jobId}
                  className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-[200px] flex-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      {job.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Schedule: {job.scheduleDescription}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-[10px] font-mono text-slate-400">
                      <div>Status: <span className="text-cyan-300 font-bold">{job.status}</span></div>
                      <div>Ingested: <span className="text-white">{job.recordsIngested}</span></div>
                    </div>

                    <button
                      disabled={isRefreshing}
                      onClick={() => handleRunJob(job.jobId)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" /> Run Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Lineage & Academic Disclosure */}
        {activeTab === 'lineage' && (
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Verified Real Integrated Components
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pl-1">
                <li><strong>Live Meteorological API:</strong> High-resolution weather observations dynamically fetched on demand via Open-Meteo.</li>
                <li><strong>EpiClim Outbreak Records:</strong> Ground truth labels for ADD & Cholera across 223 districts (2019–2022).</li>
                <li><strong>HMIS Telangana Inpatient Dataset:</strong> Real Typhoid case records for 4 districts in Telangana (2019).</li>
                <li><strong>NFHS-5 (2019–2021) & Census 2011:</strong> Real socioeconomic indicators used for PCA Social Vulnerability Index (SVI).</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <div className="font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Provider Interfaces Ready (Awaiting Credentials)
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pl-1">
                <li><strong>Copernicus Sentinel-2 L2A STAC:</strong> Production provider implemented; marked <code>NOT_CONFIGURED</code> pending <code>SENTINEL_API_KEY</code>.</li>
                <li><strong>NASA MODIS Land Surface Temp:</strong> Production provider implemented; marked <code>NOT_CONFIGURED</code> pending <code>NASA_EARTHDATA_USERNAME</code>.</li>
                <li><strong>IoT In-Situ Sensors:</strong> MQTT gateway architecture implemented; marked <code>NO LIVE SENSOR CONNECTION</code> until physical hardware nodes connect.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <Database className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="text-[11px] text-slate-400 leading-normal">
                <strong className="text-slate-200">Research & Operational Notice:</strong> JalDrishti strictly discloses the source and vintage of every variable. No simulated numbers are ever passed off as verified laboratory or government observations.
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: PostgreSQL + PostGIS Layer */}
        {activeTab === 'database' && (
          <div className="space-y-4 text-xs">
            {/* Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-400">Database Engine</div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  PostgreSQL 16
                </div>
                <div className="text-[11px] font-mono">
                  {dbStatus.isConnected ? (
                    <span className="text-emerald-400 font-bold">● CONNECTED (Pool: {dbStatus.poolSize})</span>
                  ) : (
                    <span className="text-amber-400 font-bold">● STANDALONE IN-MEMORY REPOSITORIES</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-400">Spatial Extension</div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  PostGIS 3.4
                </div>
                <div className="text-[11px] font-mono">
                  {dbStatus.postgisInstalled ? (
                    <span className="text-emerald-400 font-bold">● ACTIVE (SRID: 4326 WGS84)</span>
                  ) : (
                    <span className="text-cyan-400 font-bold">● SCHEMA PREPARED (GiST Ready)</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-400">Schema Migrations</div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  001_production_postgis
                </div>
                <div className="text-[11px] font-mono text-slate-300">
                  24 Tables • 11 GiST Indexes
                </div>
              </div>
            </div>

            {/* Normalized Tables Architecture Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="font-bold text-white flex items-center justify-between">
                <span>Normalized PostGIS Relational Schema (24 Tables)</span>
                <span className="text-[10px] font-mono text-cyan-400">ISO 19115 & PostGIS Compliant</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-cyan-300">1. Geographic</div>
                  <div className="text-slate-400 font-mono text-[10px] space-y-0.5">
                    <div>• states (MultiPolygon)</div>
                    <div>• districts (Centroid, SVI)</div>
                    <div>• villages (Point)</div>
                    <div>• river_basins (Polygon)</div>
                    <div>• rivers (LineString)</div>
                    <div>• river_gauges (Point)</div>
                    <div>• phcs & hospitals (Point)</div>
                    <div>• water_sources (Point)</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-emerald-300">2. Environmental</div>
                  <div className="text-slate-400 font-mono text-[10px] space-y-0.5">
                    <div>• weather_observations</div>
                    <div>• satellite_observations</div>
                    <div>• land_surface_temp (LST)</div>
                    <div>• hydrological_observations</div>
                    <div>• water_quality_observations</div>
                    <div>• unique constraint guards</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-purple-300">3. Health, IoT & ML</div>
                  <div className="text-slate-400 font-mono text-[10px] space-y-0.5">
                    <div>• disease_types (ADD, etc)</div>
                    <div>• epidemiological_obs</div>
                    <div>• disease_events</div>
                    <div>• sensors & readings</div>
                    <div>• sensor_health (LoRa)</div>
                    <div>• model_versions (XGB)</div>
                    <div>• predictions & factors</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-amber-300">4. Ops & Governance</div>
                  <div className="text-slate-400 font-mono text-[10px] space-y-0.5">
                    <div>• alerts & alert_events</div>
                    <div>• interventions (WASH)</div>
                    <div>• resources & allocations</div>
                    <div>• data_sources registry</div>
                    <div>• data_ingestion_jobs</div>
                    <div>• data_provenance</div>
                    <div>• users, roles & audit_logs</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Interactive Docs */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-300">
                Explore versioned interactive documentation and OpenAPI 3.0 schema:
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/api/v1/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> API Documentation
                </a>
                <a
                  href="/api/v1/openapi.json"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition"
                >
                  openapi.json
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <div className="text-slate-500 text-[10px]">
            API Endpoint: <span className="text-cyan-400 font-mono">/api/v1/data-status</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            Close Provenance Panel
          </button>
        </div>
      </div>
    </div>
  );
};
