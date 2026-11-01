import React from 'react';
import { Network, Package, BrainCircuit, BarChart3, HelpCircle } from 'lucide-react';
import { ProblemType } from '../../algorithms/types';

interface HeaderProps {
  activeProblem: ProblemType;
  onSelectProblem: (problem: ProblemType) => void;
  isChallengeMode: boolean;
  onToggleChallengeMode: () => void;
  onOpenComparison: () => void;
  onOpenCustomModal: () => void;
  presetName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeProblem,
  onSelectProblem,
  isChallengeMode,
  onToggleChallengeMode,
  onOpenComparison,
  onOpenCustomModal,
  presetName,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Title and Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                Branch &amp; Bound Visualizer
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                DAA Interactive
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Instance: <span className="text-slate-200 font-medium">{presetName}</span>
            </p>
          </div>
        </div>

        {/* Problem Switcher Tabs */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => onSelectProblem('tsp')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeProblem === 'tsp'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Traveling Salesperson (TSP)</span>
          </button>
          <button
            onClick={() => onSelectProblem('knapsack')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeProblem === 'knapsack'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>0/1 Knapsack Problem</span>
          </button>
        </div>

        {/* Feature Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Challenge Mode Toggle */}
          <button
            onClick={onToggleChallengeMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isChallengeMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
            }`}
            title="Test your ability to predict whether branches should be explored or pruned"
          >
            <HelpCircle className={`w-3.5 h-3.5 ${isChallengeMode ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span>{isChallengeMode ? 'Challenge Mode ON' : 'Student Quiz'}</span>
          </button>

          {/* Brute Force Comparison Button */}
          <button
            onClick={onOpenComparison}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all"
            title="Compare Branch & Bound search space against Brute Force"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compare vs Brute Force</span>
          </button>

          {/* Edit / Presets Button */}
          <button
            onClick={onOpenCustomModal}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            Change Problem / Preset
          </button>
        </div>
      </div>
    </header>
  );
};
