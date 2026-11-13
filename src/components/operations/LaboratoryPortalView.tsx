import React, { useState, useEffect } from 'react';
import {
  TestTube2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FlaskConical,
  ShieldCheck,
  RefreshCw,
  Plus,
  FileCheck,
  Edit3,
  Layers,
  Search,
  Building,
  Info
} from 'lucide-react';
import { GovernmentUser } from '../../services/auth/rbacEngine';
import { WaterSample } from '../../services/operations/waterSampleEngine';
import { LabTestResult, WATER_QUALITY_TEST_SPECS, LaboratoryRecord } from '../../services/operations/labVerificationEngine';

interface LaboratoryPortalViewProps {
  currentUser: GovernmentUser;
}

export const LaboratoryPortalView: React.FC<LaboratoryPortalViewProps> = ({ currentUser }) => {
  const [samples, setSamples] = useState<WaterSample[]>([]);
  const [results, setResults] = useState<LabTestResult[]>([]);
  const [laboratories, setLaboratories] = useState<LaboratoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Result entry form modal
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState('');
  const [selectedParamCode, setSelectedParamCode] = useState('E_COLI');
  const [numericValue, setNumericValue] = useState('0');
  const [testNotes, setTestNotes] = useState('');

  // Result verification / amendment modals
  const [verifyTarget, setVerifyTarget] = useState<LabTestResult | null>(null);
  const [verifyApproved, setVerifyApproved] = useState(true);
  const [verifyNotes, setVerifyNotes] = useState('');

  const [amendTarget, setAmendTarget] = useState<LabTestResult | null>(null);
  const [amendNewValue, setAmendNewValue] = useState('');
  const [amendJustification, setAmendJustification] = useState('');

  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadLabData = async () => {
    setIsLoading(true);
    try {
      const [resLabs, resSamples, resResults] = await Promise.all([
        fetch('/api/v1/labs'),
        fetch('/api/v1/labs/samples'),
        fetch('/api/v1/lab-results'),
      ]);

      if (resLabs.ok) {
        const d = await resLabs.json();
        setLaboratories(d.laboratories || []);
      }
      if (resSamples.ok) {
        const d = await resSamples.json();
        setSamples(d.samples || []);
        if (d.samples?.length > 0 && !selectedSampleId) {
          setSelectedSampleId(d.samples[0].sampleId);
        }
      }
      if (resResults.ok) {
        const d = await resResults.json();
        setResults(d.results || []);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLabData();
  }, [currentUser]);

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSampleId || numericValue === '') return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/lab-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleId: selectedSampleId,
          parameterCode: selectedParamCode,
          numericValue: parseFloat(numericValue),
          notes: testNotes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(`Test result logged for sample ${selectedSampleId}. Status: SUBMITTED (Pending Verification).`);
        setIsEntryOpen(false);
        setTestNotes('');
        loadLabData();
      } else {
        setFeedback(`Error: ${data.error || 'Failed to submit test result'}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyResult = async () => {
    if (!verifyTarget) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/lab-results/${verifyTarget.resultId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isApproved: verifyApproved,
          verificationNotes: verifyNotes || (verifyApproved ? 'Microbiologist verified against BIS 10500 standards.' : 'Rejected result.'),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback(verifyApproved ? `Result ${verifyTarget.resultId} officially verified.` : `Result rejected.`);
        setVerifyTarget(null);
        setVerifyNotes('');
        loadLabData();
      } else {
        setFeedback(`Error: ${data.error || 'Failed to verify result'}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmendResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amendTarget || !amendJustification.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/lab-results/${amendTarget.resultId}/amend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newValue: parseFloat(amendNewValue),
          justification: amendJustification,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback(`Result ${amendTarget.resultId} amended. Immutable change history recorded in audit ledger.`);
        setAmendTarget(null);
        setAmendJustification('');
        loadLabData();
      } else {
        setFeedback(`Error: ${data.error || 'Failed to amend result'}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Clear Integration Boundary Notice */}
      <div className="p-6 rounded-3xl bg-slate-900 border-2 border-purple-500/40 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/40 uppercase">
              Laboratory Diagnostics & Quality Control
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Microbiologist: <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.role})
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <TestTube2 className="w-5 h-5 text-purple-400" />
            District Public Health Water Laboratory Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Multi-parameter water testing benches, bacteriological culture screening, supervisory result verification, and immutable amendment audits compliant with BIS 10500:2012.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEntryOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-500/20 hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Enter Test Bench Result
          </button>
          <button
            onClick={loadLabData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Honest Integration Status Card */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-0.5">
          <div className="font-bold flex items-center gap-2">
            <span>LAB INTEGRATION: NOT CONFIGURED</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-mono">
              STANDALONE VERIFIED MODE
            </span>
          </div>
          <p className="text-[11px] text-amber-300/80 leading-relaxed">
            External Laboratory Information Management System (LIMS) APIs are not yet connected. All tests are entered and verified through this authorized government portal following strict chain-of-custody protocols.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Main Grid: Incoming Samples & Lab Results Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Samples Accession Queue */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <FlaskConical className="w-4 h-4 text-purple-400" />
            Accessioned Samples ({samples.length})
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {samples.map((s) => (
              <div
                key={s.sampleId}
                onClick={() => {
                  setSelectedSampleId(s.sampleId);
                  setIsEntryOpen(true);
                }}
                className={`p-3 rounded-2xl border transition cursor-pointer text-xs space-y-1 ${
                  selectedSampleId === s.sampleId
                    ? 'bg-purple-950/40 border-purple-500 text-white'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-400">{s.sampleId}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                    {s.status}
                  </span>
                </div>
                <div className="font-semibold text-slate-200">{s.waterSourceName}</div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
                  <span>{s.sampleType}</span>
                  <span className={s.qcStatus === 'VALID' ? 'text-emerald-400' : 'text-red-400'}>QC: {s.qcStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Columns: Verified Results Ledger */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Laboratory Test Bench Results Ledger
              </h3>
              <p className="text-xs text-slate-400">Formal water quality measurements evaluated against BIS standards</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">({results.length} total results logged)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Sample ID</th>
                  <th className="py-2.5 px-3">Parameter & Method</th>
                  <th className="py-2.5 px-3 text-right">Value</th>
                  <th className="py-2.5 px-3">Benchmark Standard</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {results.map((res) => (
                  <tr key={res.resultId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400 text-[11px]">
                      {res.sampleId}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{res.parameterName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{res.parameterCode}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-sm">
                      <span className={res.isExceeded ? 'text-red-400' : 'text-emerald-400'}>
                        {res.numericValue} {res.unit}
                      </span>
                      {res.isExceeded && (
                        <div className="text-[9px] text-red-400 uppercase font-mono font-bold">Standard Exceeded</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[10px] text-slate-400 max-w-xs">
                      {res.benchmarkStandard}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        res.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        res.verificationStatus === 'SUBMITTED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        res.verificationStatus === 'AMENDED' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                        'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {res.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {res.verificationStatus === 'SUBMITTED' && (
                          <button
                            onClick={() => setVerifyTarget(res)}
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <FileCheck className="w-3 h-3" />
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setAmendTarget(res);
                            setAmendNewValue(String(res.numericValue));
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Amend Result with Audited Justification"
                        >
                          <Edit3 className="w-3 h-3" />
                          Amend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal - Enter Test Bench Result */}
      {isEntryOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmitResult} className="w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TestTube2 className="w-4 h-4 text-purple-400" />
                  Enter Laboratory Test Bench Finding
                </h3>
                <p className="text-xs text-slate-400">Formal testing record under BIS 10500:2012 protocol</p>
              </div>
              <button type="button" onClick={() => setIsEntryOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Water Sample:</label>
                <select
                  value={selectedSampleId}
                  onChange={(e) => setSelectedSampleId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none font-mono"
                >
                  {samples.map((s) => (
                    <option key={s.sampleId} value={s.sampleId}>
                      {s.sampleId} — {s.waterSourceName} ({s.sampleType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Testing Parameter Bench:</label>
                <select
                  value={selectedParamCode}
                  onChange={(e) => setSelectedParamCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                >
                  {Object.values(WATER_QUALITY_TEST_SPECS).map((spec) => (
                    <option key={spec.code} value={spec.code}>
                      {spec.name} ({spec.unit}) — {spec.standard}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Measured Quantitative Value:</label>
                <input
                  type="number"
                  step="any"
                  value={numericValue}
                  onChange={(e) => setNumericValue(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Microbiologist / Chemist Analytical Notes:</label>
                <textarea
                  rows={2}
                  value={testNotes}
                  onChange={(e) => setTestNotes(e.target.value)}
                  placeholder="e.g. Triplicate membrane filtration confirmed coliform colonies after 24h incubation at 44.5°C."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setIsEntryOpen(false)} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isSubmitting ? 'Logging...' : 'Submit for Supervisory Verification'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal - Supervisory Result Verification */}
      {verifyTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Supervisory Lab Verification Sign-Off
                </h3>
                <p className="text-slate-400">{verifyTarget.sampleId} • {verifyTarget.parameterName}</p>
              </div>
              <button onClick={() => setVerifyTarget(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Tested Value:</span>
                <span className="font-mono font-bold text-white text-sm">{verifyTarget.numericValue} {verifyTarget.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tested By:</span>
                <span className="text-slate-300">{verifyTarget.testedBy}</span>
              </div>
              <div className="text-[11px] text-slate-500">{verifyTarget.benchmarkStandard}</div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 block">Verification Decision:</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-emerald-300 font-bold">
                  <input
                    type="radio"
                    name="decision"
                    checked={verifyApproved}
                    onChange={() => setVerifyApproved(true)}
                  />
                  Verify & Approve Result
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-red-300 font-bold">
                  <input
                    type="radio"
                    name="decision"
                    checked={!verifyApproved}
                    onChange={() => setVerifyApproved(false)}
                  />
                  Reject Result (Retest Required)
                </label>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Supervisor Notes:</label>
              <textarea
                rows={2}
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder="Confirmed against quality controls."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setVerifyTarget(null)} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs">
                Cancel
              </button>
              <button
                onClick={handleVerifyResult}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Authorize Sign-Off'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Amend Result */}
      {amendTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAmendResult} className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  Amend Laboratory Result (Audited)
                </h3>
                <p className="text-slate-400">{amendTarget.sampleId} • {amendTarget.parameterName}</p>
              </div>
              <button type="button" onClick={() => setAmendTarget(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
              Forensic Policy: Laboratory results can never be silently overwritten. The previous value ({amendTarget.numericValue} {amendTarget.unit}) will remain immutably preserved in the audit log.
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Corrected Value ({amendTarget.unit}) *:</label>
              <input
                type="number"
                step="any"
                value={amendNewValue}
                onChange={(e) => setAmendNewValue(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Mandatory Justification for Amendment *:</label>
              <textarea
                rows={3}
                value={amendJustification}
                onChange={(e) => setAmendJustification(e.target.value)}
                placeholder="e.g. Dilution factor calculation error in initial manual log sheet. Re-verified against spectrophotometer printout."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setAmendTarget(null)} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !amendJustification.trim()}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition disabled:opacity-50"
              >
                {isSubmitting ? 'Amending...' : 'Record Amendment in Forensic Audit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
