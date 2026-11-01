import React from 'react';
import { Package, Scale, TrendingUp, Check } from 'lucide-react';
import { KnapsackItem, KnapsackTreeNode } from '../../algorithms/types';

interface KnapsackItemsTableProps {
  items: KnapsackItem[];
  capacity: number;
  currentWeight: number;
  currentValue: number;
  takenItemIds: number[];
  currentItemLevel?: number;
  boundBreakdown?: KnapsackTreeNode['boundBreakdown'];
  upperBound?: number;
}

export const KnapsackItemsTable: React.FC<KnapsackItemsTableProps> = ({
  items,
  capacity,
  currentWeight,
  currentValue,
  takenItemIds,
  currentItemLevel = -1,
  boundBreakdown,
  upperBound,
}) => {
  const weightPercentage = Math.min(100, (currentWeight / capacity) * 100);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">
            0/1 Knapsack Items &amp; Profit Density
          </h2>
          <p className="text-[11px] text-slate-400">
            Items pre-sorted descending by Value / Weight ratio (greedy ordering).
          </p>
        </div>
      </div>

      {/* Knapsack Capacity Meter */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-indigo-400" />
            Knapsack Capacity Load:
          </span>
          <span className="font-mono font-bold text-indigo-300">
            {currentWeight} / {capacity} kg ({weightPercentage.toFixed(0)}%)
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              currentWeight > capacity
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
            }`}
            style={{ width: `${weightPercentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
          <span>Current Integer Profit: <strong className="text-emerald-400 font-mono">${currentValue}</strong></span>
          <span>Remaining Space: <strong className="text-slate-200 font-mono">{Math.max(0, capacity - currentWeight)} kg</strong></span>
        </div>
      </div>

      {/* Items Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-800/60 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-700/80">
            <tr>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Weight</th>
              <th className="px-3 py-2">Profit ($)</th>
              <th className="px-3 py-2 text-indigo-300">Ratio ($/kg)</th>
              <th className="px-3 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {items.map((item, idx) => {
              const isTaken = takenItemIds.includes(idx);
              const isCurrent = currentItemLevel === idx;

              return (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-l-2 border-indigo-400'
                      : isTaken
                      ? 'bg-emerald-950/20'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="px-3 py-2 font-medium text-slate-200 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.name}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-300">{item.weight} kg</td>
                  <td className="px-3 py-2 font-mono text-emerald-400 font-semibold">${item.value}</td>
                  <td className="px-3 py-2 font-mono font-bold text-indigo-300">
                    {item.ratio}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {isTaken ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Check className="w-2.5 h-2.5" /> In Pack
                      </span>
                    ) : isCurrent ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse">
                        Evaluating
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Excluded / Pending</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Fractional Relaxation Upper Bound Breakdown */}
      {boundBreakdown && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Fractional Knapsack Relaxation Upper Bound
            </span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              Bound = {upperBound}
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            Base Profit: <strong>${boundBreakdown.baseValue}</strong>
            {boundBreakdown.fractionalItems.length > 0 && (
              <>
                {' + '}
                {boundBreakdown.fractionalItems
                  .map(
                    (fi) =>
                      `${fi.item.name} (${fi.fraction === 1 ? '100%' : `${(fi.fraction * 100).toFixed(0)}%`} ➔ +$${fi.valueGain})`
                  )
                  .join(' + ')}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
