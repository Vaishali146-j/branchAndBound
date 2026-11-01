import React from 'react';
import { Scissors, CheckCircle2, GitFork, ShieldCheck } from 'lucide-react';

interface StatsBarProps {
  stats: {
    generated: number;
    expanded: number;
    pruned: number;
    completeTours?: number;
    solutionsFound?: number;
    overridden?: number;
  };
  frontierCount: number;
  bestCostOrValue: number | null;
  bestSolutionText: string;
  isMinimization: boolean; // TSP = true (minimizing), Knapsack = false (maximizing)
  totalTheoreticalSpace?: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  frontierCount,
  bestCostOrValue,
  bestSolutionText,
  isMinimization,
  totalTheoreticalSpace,
}) => {
  // Pruning efficiency calculation
  const totalConsidered = stats.expanded + stats.pruned;
  const pruneRate = totalConsidered > 0 ? ((stats.pruned / totalConsidered) * 100).toFixed(1) : '0.0';

  const hasSolution = bestCostOrValue !== null && Number.isFinite(bestCostOrValue);

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-center text-xs">
        {/* Incumbent Best Solution */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-2.5 shadow-sm col-span-2 sm:col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              {isMinimization ? 'Best Known Tour Cost (Incumbent)' : 'Best Knapsack Profit'}
            </span>
            <CheckCircle2 className={`w-3.5 h-3.5 ${hasSolution ? 'text-emerald-400' : 'text-slate-500'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-extrabold ${hasSolution ? 'text-emerald-400' : 'text-slate-500'}`}>
              {hasSolution ? bestCostOrValue : 'None yet'}
            </span>
            <span className="text-[11px] text-slate-300 truncate" title={bestSolutionText}>
              {bestSolutionText}
            </span>
          </div>
        </div>

        {/* Nodes Generated */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Nodes Generated</span>
            <GitFork className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white">{stats.generated}</span>
            <span className="text-[10px] text-slate-400">
              ({frontierCount} in live frontier)
            </span>
          </div>
        </div>

        {/* Nodes Expanded */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Nodes Expanded</span>
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-indigo-300">{stats.expanded}</span>
            <span className="text-[10px] text-slate-400">explored</span>
          </div>
        </div>

        {/* Nodes Pruned */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Branches Pruned</span>
            <Scissors className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-rose-400">{stats.pruned}</span>
            {stats.overridden ? (
              <span className="text-[10px] text-amber-400 font-medium">({stats.overridden} forced)</span>
            ) : (
              <span className="text-[10px] text-slate-400">cut off</span>
            )}
          </div>
        </div>

        {/* Search Space Elimination Bar */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Pruning Ratio</span>
            <span className="text-[11px] font-bold text-emerald-400">{pruneRate}%</span>
          </div>
          <div className="w-full bg-slate-700/80 rounded-full h-2 overflow-hidden mt-1.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, Number(pruneRate)))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
