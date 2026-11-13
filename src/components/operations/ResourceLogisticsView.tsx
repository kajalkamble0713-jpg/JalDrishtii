import React, { useState, useEffect } from 'react';
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  Package,
  TrendingDown,
  RefreshCw,
  Search,
  Check,
  Building,
  ShieldCheck,
  Send
} from 'lucide-react';
import { GovernmentUser } from '../../services/auth/rbacEngine';
import { DistrictResourceStock, ResourceShortageAlert, ResourceAllocationRecord } from '../../services/operations/resourceEngine';

interface ResourceLogisticsViewProps {
  currentUser: GovernmentUser;
  onNavigateTab?: (tab: string) => void;
  onSelectDistrict?: (districtId: string) => void;
}

export const ResourceLogisticsView: React.FC<ResourceLogisticsViewProps> = ({
  currentUser,
}) => {
  const [inventory, setInventory] = useState<DistrictResourceStock[]>([]);
  const [shortages, setShortages] = useState<ResourceShortageAlert[]>([]);
  const [allocations, setAllocations] = useState<ResourceAllocationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resInv, resShort, resAlloc] = await Promise.all([
        fetch('/api/v1/resources'),
        fetch('/api/v1/resources/shortages'),
        fetch('/api/v1/resources/allocations'),
      ]);

      if (resInv.ok) {
        const d = await resInv.json();
        setInventory(d.resources || []);
      }
      if (resShort.ok) {
        const d = await resShort.json();
        setShortages(d.shortages || []);
      }
      if (resAlloc.ok) {
        const d = await resAlloc.json();
        setAllocations(d.allocations || []);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleApproveAllocation = async (allocationId: string) => {
    setIsApproving(allocationId);
    try {
      const res = await fetch(`/api/v1/resources/allocations/${allocationId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback(`Allocation ${allocationId} approved by ${currentUser.fullName}. Inventory reserved and dispatch triggered.`);
        fetchData();
      } else {
        setFeedback(`Error: ${data.error || 'Failed to approve allocation'}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsApproving(null);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return (
        item.districtName.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
              Supply Chain & Logistics Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Authorized Officer: <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.role})
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            District Resource Stockpiles & Predictive Supply Allocation
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time emergency inventory audit: chlorine tablets, ORS stockpiles, field water-testing kits, and mobile purification units. Proactive replenishment prevents stockouts during outbreak surges.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Critical Shortage Alerts */}
      {shortages.length > 0 && (
        <div className="p-5 rounded-3xl bg-red-950/40 border border-red-500/40 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            Active Stockout Warnings ({shortages.length} Depleted Districts)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shortages.map((s) => (
              <div key={s.shortageId} className="p-3 rounded-2xl bg-slate-900/90 border border-red-500/30 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{s.districtName}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-red-500/20 text-red-300 border border-red-500/40">
                    {s.severity.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-slate-300 font-semibold">{s.resourceName}</div>
                <div className="text-[11px] text-slate-400">{s.message}</div>
                <div className="text-[10px] text-red-400 font-mono">
                  Deficit: -{s.deficitQuantity.toLocaleString()} units
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proactive Predictive Allocations Queue */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              Predictive Allocation Directives (Surge Readiness)
            </h3>
            <p className="text-xs text-slate-400">
              Formulated by AI early warning model based on 14-day rainfall and microbial vulnerability
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Pending Approval: <strong className="text-cyan-300">{allocations.filter((a) => a.status === 'RECOMMENDATION').length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allocations.map((alloc) => (
            <div
              key={alloc.allocationId}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/30 transition text-xs space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className="text-cyan-400 font-bold">{alloc.allocationId}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      Priority {alloc.priorityScore}/100
                    </span>
                    <span className={`px-1.5 py-0.2 rounded font-mono font-bold ${
                      alloc.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {alloc.status}
                    </span>
                  </div>
                  <div className="font-bold text-white text-sm mt-1">{alloc.districtName}</div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-cyan-300 text-base">
                    +{alloc.allocatedQuantity.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">{alloc.unitOfMeasure}</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                {alloc.rationale}
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span>By: {alloc.recommendedBy}</span>
                {alloc.status === 'RECOMMENDATION' ? (
                  <button
                    onClick={() => handleApproveAllocation(alloc.allocationId)}
                    disabled={isApproving === alloc.allocationId}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isApproving === alloc.allocationId ? 'Approving...' : 'Approve & Dispatch'}
                  </button>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approved by {alloc.approvedBy}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* District Inventory Table */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">
              District Medical & WASH Stockpiles Ledger
            </h3>
            <p className="text-xs text-slate-400">Current available vs reserved balance per warehouse depot</p>
          </div>

          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search district, item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-3">District & Depot</th>
                <th className="py-3 px-3">Resource Item</th>
                <th className="py-3 px-3 text-right">Available Qty</th>
                <th className="py-3 px-3 text-right">Reserved Qty</th>
                <th className="py-3 px-3 text-right">Min Threshold</th>
                <th className="py-3 px-3 text-center">Stock Status</th>
                <th className="py-3 px-3 text-right">Unit Value (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredInventory.map((item) => {
                const isLow = item.availableQuantity < item.minimumStock;
                return (
                  <tr key={item.resourceId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{item.districtName}</div>
                      <div className="text-[10px] text-slate-400">{item.location}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.resourceType}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">
                      {item.availableQuantity.toLocaleString()} {item.unitOfMeasure}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      {item.reservedQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      {item.minimumStock.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                          DEFICIT
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ADEQUATE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      ₹{item.unitCostInr.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
