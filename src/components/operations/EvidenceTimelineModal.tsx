import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
  FileText,
  MapPin,
  TestTube2,
  Wrench,
  Activity,
  ArrowDown
} from 'lucide-react';
import { EvidenceTimelineStep } from '../../services/operations/predictionOutcomeEngine';

interface EvidenceTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string; // alertId or predictionId
}

export const EvidenceTimelineModal: React.FC<EvidenceTimelineModalProps> = ({
  isOpen,
  onClose,
  targetId,
}) => {
  const [steps, setSteps] = useState<EvidenceTimelineStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !targetId) return;
    setIsLoading(true);
    fetch(`/api/v1/response-timeline/${targetId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.steps) {
          setSteps(data.steps);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isOpen, targetId]);

  if (!isOpen) return null;

  const getStageIcon = (stage: string) => {
    if (stage.includes('Prediction')) return <Activity className="w-4 h-4 text-cyan-400" />;
    if (stage.includes('Alert')) return <AlertTriangle className="w-4 h-4 text-red-400" />;
    if (stage.includes('Field') || stage.includes('Task')) return <MapPin className="w-4 h-4 text-amber-400" />;
    if (stage.includes('Sample') || stage.includes('Lab') || stage.includes('Microbiological')) return <TestTube2 className="w-4 h-4 text-purple-400" />;
    if (stage.includes('Intervention')) return <Wrench className="w-4 h-4 text-emerald-400" />;
    return <ShieldCheck className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                End-to-End Forensic Trace
              </span>
              <span className="text-xs text-slate-400 font-mono">Reference: {targetId}</span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              Response Lifecycle & Verification Timeline
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto pr-2 space-y-4 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs animate-pulse">
              Loading verified timeline sequence...
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {steps.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4 text-xs">
                  {/* Pin Dot */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center flex-shrink-0 z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  </div>

                  {/* Card */}
                  <div className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/30 transition space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        {getStageIcon(step.stageName)}
                        <span className="font-bold text-white text-sm">{step.stageName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        {new Date(step.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">{step.description}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                      <div>
                        Actor: <strong className="text-slate-200">{step.actor}</strong> ({step.role})
                      </div>
                      {step.durationFromPreviousHours > 0 && (
                        <span className="text-slate-500">
                          + {step.durationFromPreviousHours.toFixed(1)}h from previous action
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs flex-shrink-0">
          <span className="text-[11px] text-slate-500">
            Immutable chain: Prediction $\to$ Alert $\to$ Investigation $\to$ Sample $\to$ Lab $\to$ Intervention $\to$ Health Outcome
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
