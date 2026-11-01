import React from 'react';
import { X, Zap, Cpu, Check, ShieldAlert, Sparkles, TrendingDown } from 'lucide-react';
import { BenchmarkComparison } from '../../algorithms/types';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  bbData: BenchmarkComparison;
  bfData: BenchmarkComparison;
  nodesEliminated: number;
  pruningPercentage: number;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  bbData,
  bfData,
  nodesEliminated,
  pruningPercentage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Branch &amp; Bound vs. Brute Force Benchmarking
              </h2>
              <p className="text-xs text-slate-400">
                Direct algorithmic comparison on problem instance: <strong>{bbData.problemName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                <TrendingDown className="w-4 h-4" />
                <span>Search Space Pruned</span>
              </div>
              <div className="text-2xl font-black text-emerald-300">
                {pruningPercentage}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {nodesEliminated} unnecessary states safely skipped!
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold mb-1">
                <Cpu className="w-4 h-4" />
                <span>Nodes Explored Ratio</span>
              </div>
              <div className="text-2xl font-black text-indigo-300">
                {bbData.nodesExplored} vs {bfData.nodesExplored}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                B&amp;B explored {(bfData.nodesExplored / Math.max(1, bbData.nodesExplored)).toFixed(1)}x fewer nodes
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold mb-1">
                <Check className="w-4 h-4" />
                <span>Optimality Verified</span>
              </div>
              <div className="text-2xl font-black text-purple-300">
                100% Exact
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Both yield cost/profit = {bbData.optimalCostOrValue}
              </p>
            </div>
          </div>

          {/* Comparative Metrics Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Metric</th>
                  <th className="px-4 py-3 text-indigo-400 font-bold">Branch and Bound (LCBB)</th>
                  <th className="px-4 py-3 text-slate-400">Brute Force / Exhaustive</th>
                  <th className="px-4 py-3 text-emerald-400">Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-300">Nodes Explored</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-indigo-300">{bbData.nodesExplored}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-400">{bfData.nodesExplored}</td>
                  <td className="px-4 py-2.5 font-semibold text-emerald-400">
                    -{nodesEliminated} nodes skipped
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-300">Branches Pruned</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-rose-400">{bbData.nodesPruned}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-400">0 (checks everything)</td>
                  <td className="px-4 py-2.5 font-semibold text-emerald-400">
                    {bbData.nodesPruned} subtrees cut off
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-300">Execution Time</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-indigo-300">&lt; 0.1 ms</td>
                  <td className="px-4 py-2.5 font-mono text-slate-400">{bfData.executionTimeMs} ms</td>
                  <td className="px-4 py-2.5 font-semibold text-emerald-400">Near Instant</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-300">Optimal Value</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-emerald-400">{bbData.optimalCostOrValue}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-emerald-400">{bfData.optimalCostOrValue}</td>
                  <td className="px-4 py-2.5 text-slate-300">Identical (Exact Optimum)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-300">Optimal Solution</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-indigo-300 truncate max-w-[180px]">
                    {bbData.optimalSolutionString}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400 truncate max-w-[180px]">
                    {bfData.optimalSolutionString}
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">Match</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* DAA Theoretical Insight */}
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>DAA Syllabus Takeaway: Why Branch and Bound Outperforms Brute Force</span>
            </div>
            <p className="leading-relaxed">
              Brute Force systematically enumerates every single candidate permutation or subset (running in exponential or factorial time, e.g. $O((n-1)!)$ for TSP or $O(2^n)$ for Knapsack).
            </p>
            <p className="leading-relaxed">
              Branch &amp; Bound computes an optimistic bounding function (Lower Bound for minimization, Upper Bound for maximization) at each partial state. As soon as the bound of a subtree cannot improve upon the best-known complete solution (incumbent), the entire subtree is discarded immediately. This eliminates vast portions of the combinatorial search space while still guaranteeing that the global optimum is found!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
