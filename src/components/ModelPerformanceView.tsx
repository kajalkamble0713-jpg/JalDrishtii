import React from 'react';
import { DiseaseType } from '../types';
import { MODEL_PERFORMANCE_METRICS } from '../data/jaldrishtiData';
import { Cpu, Target, Layers, CheckCircle2, BarChart3 } from 'lucide-react';

interface ModelPerformanceViewProps {
  currentDisease: DiseaseType;
}

export const ModelPerformanceView: React.FC<ModelPerformanceViewProps> = ({ currentDisease }) => {
  const metrics = MODEL_PERFORMANCE_METRICS[currentDisease] || MODEL_PERFORMANCE_METRICS['ADD'];
  const allDiseases: DiseaseType[] = ['ADD', 'Cholera', 'Typhoid'];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 rounded-2xl border border-sky-500/30 p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-sky-400 mb-1">
            <Cpu className="w-6 h-6" />
            <h2 className="text-xl font-bold text-white">XGBoost ML Model Architecture & Validation Metrics</h2>
          </div>
          <p className="text-xs text-slate-400">
            Evaluated via District-Grouped Stratified Split (70/15/15) with 1,000 Bootstrap Confidence Resamples & SMOTE Class Rebalancing.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-sky-500/15 border border-sky-400/40 text-sky-300 text-xs font-bold font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Active Model: {currentDisease} Classifier
        </div>
      </div>

      {/* Model Performance Cards Grid (All Core Classification & Calibration Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center shadow-lg hover:border-sky-500/40 transition">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">ROC-AUC</div>
          <div className="text-3xl font-black text-sky-400 font-mono">{metrics.aucRoc.toFixed(2)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Discriminative Power</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center shadow-lg hover:border-emerald-500/40 transition">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">PR-AUC</div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{metrics.prAuc.toFixed(2)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Precision-Recall Area</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center shadow-lg hover:border-cyan-500/40 transition">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Precision</div>
          <div className="text-3xl font-black text-cyan-400 font-mono">{metrics.precision.toFixed(2)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Positive Predictive Val</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center shadow-lg hover:border-teal-500/40 transition">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Recall</div>
          <div className="text-3xl font-black text-teal-400 font-mono">{metrics.recall.toFixed(2)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Outbreak Sensitivity</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center shadow-lg hover:border-amber-500/40 transition">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">F1 Score</div>
          <div className="text-3xl font-black text-amber-400 font-mono">{metrics.f1Score.toFixed(2)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Harmonic Mean</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center shadow-lg hover:border-indigo-500/40 transition">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Brier Calibration</div>
          <div className="text-3xl font-black text-indigo-400 font-mono">{metrics.brierScore.toFixed(4)}</div>
          <div className="text-[10px] text-slate-500 mt-1">ECE: {metrics.ece}</div>
        </div>
      </div>

      {/* Cross-Disease XGBoost Benchmark Comparison Table */}
      <div className="bg-slate-900/85 rounded-2xl border border-slate-800 p-5 shadow-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              Cross-Disease XGBoost Validation Benchmark (ADD • Cholera • Typhoid)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Complete test-set classification scores across all 3 waterborne disease models
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            Validated Benchmark
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 border-y border-slate-800 text-slate-300 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Disease</th>
                <th className="py-3 px-4 text-center">ROC-AUC</th>
                <th className="py-3 px-4 text-center">PR-AUC</th>
                <th className="py-3 px-4 text-center">Prec.</th>
                <th className="py-3 px-4 text-center">Rec.</th>
                <th className="py-3 px-4 text-center">F1</th>
                <th className="py-3 px-4 text-right">Brier / ECE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {allDiseases.map((diseaseKey) => {
                const row = MODEL_PERFORMANCE_METRICS[diseaseKey];
                const isActive = diseaseKey === currentDisease;
                return (
                  <tr
                    key={diseaseKey}
                    className={`transition ${
                      isActive
                        ? 'bg-sky-950/40 border-l-4 border-l-sky-400'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span>{row.disease}</span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/40">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sky-300">
                      {row.aucRoc.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-300">
                      {row.prAuc.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-cyan-300">
                      {row.precision.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-teal-300">
                      {row.recall.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-black text-amber-300">
                      {row.f1Score.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400">
                      {row.brierScore.toFixed(4)} / {row.ece.toFixed(4)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Specs & Hyperparameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-sky-400" />
            Tuned Best Hyperparameters (GridSearchCV)
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Learning Rate</span>
              <span className="font-mono font-bold text-sky-300">{metrics.bestParams.learning_rate}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Max Depth</span>
              <span className="font-mono font-bold text-sky-300">{metrics.bestParams.max_depth}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">N Estimators (Trees)</span>
              <span className="font-mono font-bold text-sky-300">{metrics.bestParams.n_estimators}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Training Dataset Size</span>
              <span className="font-mono font-bold text-emerald-300">{metrics.datasize}</span>
            </div>
          </div>
        </div>

        {/* Multi-Threshold Confusion Matrix */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Multi-Threshold Decision Matrix
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-300">Threshold 0.3 (Early Warning)</span>
                <span className="text-emerald-400">High Recall (92%)</span>
              </div>
              <p className="text-[11px] text-slate-400">Prioritizes catching all potential outbreaks even with minor false alarms.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-300">Threshold 0.5 (Balanced Standard)</span>
                <span className="text-sky-400">Balanced F1 ({metrics.f1Score.toFixed(2)})</span>
              </div>
              <p className="text-[11px] text-slate-400">Standard operational baseline for district health officer notifications.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-300">Threshold 0.7 (Emergency Action)</span>
                <span className="text-amber-400">High Precision (88%)</span>
              </div>
              <p className="text-[11px] text-slate-400">Triggers immediate deployment of medical water purification supplies.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
