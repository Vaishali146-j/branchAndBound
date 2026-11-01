import React, { useState } from 'react';
import { X, Check, RefreshCw } from 'lucide-react';
import { TSP_PRESETS, TspPreset } from '../../algorithms/tsp/presets';

interface TspCustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: TspPreset) => void;
  onApplyCustomMatrix: (matrix: number[][], names: string[]) => void;
  currentPresetId: string;
}

export const TspCustomModal: React.FC<TspCustomModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  onApplyCustomMatrix,
  currentPresetId,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [cityCount, setCityCount] = useState<number>(4);
  const [customText, setCustomText] = useState<string>(
    '0, 10, 15, 20\n10, 0, 35, 25\n15, 35, 0, 30\n20, 25, 30, 0'
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyCustom = () => {
    setError(null);
    try {
      const rows = customText
        .trim()
        .split('\n')
        .map((line) =>
          line
            .split(/[,\s]+/)
            .map((v) => (v.trim() === '∞' || v.trim().toLowerCase() === 'inf' ? Infinity : Number(v.trim())))
        );

      const n = rows.length;
      if (n < 3 || n > 6) {
        throw new Error('Please provide between 3 and 6 cities for visual clarity.');
      }

      for (let i = 0; i < n; i++) {
        if (rows[i].length !== n) {
          throw new Error(`Row ${i + 1} has ${rows[i].length} entries, but expected ${n}. Matrix must be square.`);
        }
      }

      const names = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, n);
      onApplyCustomMatrix(rows, names);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid matrix format');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">Select or Configure TSP Problem</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'presets'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Curated Presets
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'custom'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Distance Matrix
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'presets' ? (
            <div className="space-y-3">
              {TSP_PRESETS.map((preset) => {
                const isSelected = preset.id === currentPresetId;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/30'
                        : 'border-slate-800 bg-slate-850 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{preset.name}</span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-xs text-indigo-400 font-semibold">
                          <Check className="w-4 h-4" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{preset.description}</p>
                    <div className="text-[11px] font-mono text-slate-400 mt-2">
                      Cities: {preset.cityNames.join(', ')} • Optimal Cost: {preset.expectedCost}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter Distance Matrix (Comma or Space separated, 3-6 cities):
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Diagonal entries should be 0. Use 'inf' or '∞' for unreachable paths.
                </p>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  placeholder="0, 10, 15, 20&#10;10, 0, 35, 25&#10;15, 35, 0, 30&#10;20, 25, 30, 0"
                />
              </div>

              {error && (
                <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleApplyCustom}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-colors"
              >
                Apply Custom Matrix &amp; Solve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
