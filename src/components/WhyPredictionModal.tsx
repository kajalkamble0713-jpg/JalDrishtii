import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  ShieldAlert,
  Database,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { DistrictData, DiseaseType } from '../types';
import { MLFeatureStore, PredictionProvenanceRecord } from '../services/data/ml/FeatureStore';

interface WhyPredictionModalProps {
  district: DistrictData | null;
  disease: DiseaseType;
  isOpen: boolean;
  onClose: () => void;
}

export const WhyPredictionModal: React.FC<WhyPredictionModalProps> = ({
  district,
  disease,
  isOpen,
  onClose,
}) => {
  const [provenance, setProvenance] = useState<PredictionProvenanceRecord | null>(null);

  useEffect(() => {
    if (!isOpen || !district) return;

    // Immediate initial fallback from FeatureStore
    const featureStore = MLFeatureStore.getInstance();
    const local = featureStore.generatePredictionProvenance(district, disease);
    setProvenance(local);

    // Synchronize with backend REST API service
    fetch(`/api/v1/predictions/provenance/${district.id}?disease=${disease}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.predictionId) {
          setProvenance(data);
        }
      })
      .catch(() => {});
  }, [isOpen, district, disease]);

  if (!isOpen || !district || !provenance) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0a0d1d] border border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.3)] text-slate-100 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-600/20 border border-cyan-400/40 text-cyan-300 shadow-lg">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  Prediction Audit & Explainability Lineage
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-400">
                  {provenance.predictionId}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Why This Prediction? — {district.name}, {district.state}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prediction Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Disease Target</div>
            <div className="text-base font-bold text-white mt-0.5">{disease}</div>
            <div className="text-[10px] text-cyan-400 font-mono">XGBoost Classifier</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Calculated Outbreak Risk</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">
              {Math.round(provenance.predictedRiskScore * 100)}%
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Tier: {provenance.riskCategory}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">95% Confidence Bounds</div>
            <div className="text-sm font-mono font-bold text-emerald-400 mt-1">
              [{Math.round(provenance.confidenceInterval[0] * 100)}% – {Math.round(provenance.confidenceInterval[1] * 100)}%]
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Bootstrap resamples</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Model Version</div>
            <div className="text-xs font-mono font-bold text-slate-200 mt-1 truncate">
              {provenance.modelVersion}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Stratified Split (70/15/15)</div>
          </div>
        </div>

        {/* Explainability Breakdown (SHAP-inspired drivers) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> Primary Environmental & Social Drivers (SHAP Attribution)
          </h3>

          <div className="space-y-2.5">
            {provenance.whyThisPrediction.map((item, idx) => {
              const borderClass =
                item.severity === 'critical'
                  ? 'border-red-500/40 bg-red-950/20'
                  : item.severity === 'elevated'
                  ? 'border-amber-500/40 bg-amber-950/20'
                  : 'border-emerald-500/40 bg-emerald-950/20';
              const textClass =
                item.severity === 'critical'
                  ? 'text-red-400'
                  : item.severity === 'elevated'
                  ? 'text-amber-400'
                  : 'text-emerald-400';

              return (
                <div key={idx} className={`p-3.5 rounded-2xl border ${borderClass} space-y-1`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{item.factor}</span>
                    <span className={`font-mono font-extrabold ${textClass}`}>{item.contribution}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{item.scientificRationale}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Provenance: Underlying Datasets */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" /> Source Data Lineage & Freshness Verification
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {provenance.sourceDatasets.map((ds, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">{ds.sourceName}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                      ds.status === 'LIVE'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : ds.status === 'STATIC'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {ds.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">{ds.provider}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 font-mono">
                  <span>Quality: {ds.qualityScore}/100</span>
                  <span>{new Date(ds.observedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <div className="text-slate-500 text-[10px] font-mono">
            Generated: {new Date(provenance.predictionGeneratedAt).toLocaleString()}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            Close Provenance
          </button>
        </div>
      </div>
    </div>
  );
};
