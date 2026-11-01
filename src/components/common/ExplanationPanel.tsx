import React from 'react';
import { HelpCircle, AlertOctagon, CheckCircle2, Calculator, Info } from 'lucide-react';

interface ExplanationPanelProps {
  title: string;
  description: string;
  formula?: string;
  pruneReason?: string | null;
  nodeStatus?: string;
  activeNodeId?: number;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  title,
  description,
  formula,
  pruneReason,
  nodeStatus,
  activeNodeId,
}) => {
  const isPruned = nodeStatus === 'pruned' || !!pruneReason;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Step Title Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            Algorithmic Reasoning &amp; Execution Step
          </h2>
        </div>
        {activeNodeId !== undefined && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
            Node #{activeNodeId}
          </span>
        )}
      </div>

      {/* Main Step Description */}
      <div>
        <h3 className="text-sm font-semibold text-indigo-300 mb-1">{title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
      </div>

      {/* Mathematical Formula & Arithmetic Breakdown */}
      {formula && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1.5">
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Mathematical Bounding Formula &amp; Arithmetic</span>
          </div>
          <div className="font-mono text-xs text-slate-200 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 overflow-x-auto">
            {formula}
          </div>
        </div>
      )}

      {/* "Why Was This Branch Pruned?" Dedicated Card */}
      {isPruned && pruneReason && (
        <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3 shadow-lg shadow-rose-950/20">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-xs mb-1.5">
            <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>Why was this branch pruned? (DAA Pruning Rule)</span>
          </div>
          <p className="text-xs text-rose-200/90 leading-relaxed">
            {pruneReason}
          </p>
          <div className="mt-2 text-[11px] text-rose-300/80 bg-rose-900/30 rounded px-2 py-1 border border-rose-800/40">
            <strong>Theoretical Guarantee:</strong> Because the lower bound represents the optimistic mathematical minimum of all extensions of this path, exploring it further would consume CPU cycles without ever improving our solution.
          </div>
        </div>
      )}

      {/* When complete tour is found */}
      {nodeStatus === 'complete' && (
        <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Optimal Tour / Feasible Solution Verified</span>
          </div>
          <p className="text-xs text-emerald-200/90">
            A valid Hamiltonian tour visiting all cities was formed. All subsequent branches with lower bounds greater than or equal to this cost will now be eliminated.
          </p>
        </div>
      )}
    </div>
  );
};
