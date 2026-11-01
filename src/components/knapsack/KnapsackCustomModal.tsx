import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { KNAPSACK_PRESETS, KnapsackPreset } from '../../algorithms/knapsack/presets';

interface KnapsackCustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: KnapsackPreset) => void;
  onApplyCustom: (items: { name: string; weight: number; value: number }[], capacity: number) => void;
  currentPresetId: string;
}

export const KnapsackCustomModal: React.FC<KnapsackCustomModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  onApplyCustom,
  currentPresetId,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [capacity, setCapacity] = useState<number>(15);
  const [itemsText, setItemsText] = useState<string>(
    'Item A, 4, 100\nItem B, 7, 140\nItem C, 5, 90\nItem D, 3, 50'
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyCustom = () => {
    setError(null);
    try {
      if (capacity <= 0) {
        throw new Error('Capacity must be a positive integer.');
      }

      const lines = itemsText.trim().split('\n');
      if (lines.length < 2 || lines.length > 7) {
        throw new Error('Please provide between 2 and 7 items.');
      }

      const parsedItems = lines.map((line, idx) => {
        const parts = line.split(/[,\t]+/).map((s) => s.trim());
        if (parts.length < 3) {
          throw new Error(`Line ${idx + 1} must be: Name, Weight, Value`);
        }
        const name = parts[0] || `Item ${idx + 1}`;
        const w = Number(parts[1]);
        const v = Number(parts[2]);
        if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(v) || v <= 0) {
          throw new Error(`Item ${name} has invalid positive weight or value.`);
        }
        return { name, weight: w, value: v };
      });

      onApplyCustom(parsedItems, capacity);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid item data');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">Select or Configure 0/1 Knapsack</h2>
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
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Curated Presets
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'custom'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Items &amp; Capacity
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'presets' ? (
            <div className="space-y-3">
              {KNAPSACK_PRESETS.map((preset) => {
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
                        ? 'border-purple-500 bg-purple-950/30'
                        : 'border-slate-800 bg-slate-850 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{preset.name}</span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-xs text-purple-400 font-semibold">
                          <Check className="w-4 h-4" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{preset.description}</p>
                    <div className="text-[11px] font-mono text-slate-400 mt-2">
                      Capacity: {preset.capacity} kg • Items: {preset.items.length} • Max Profit: ${preset.expectedOptimalValue}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Knapsack Weight Capacity:
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  min={1}
                  max={200}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Items List (Format: Name, Weight, Value per line):
                </label>
                <textarea
                  value={itemsText}
                  onChange={(e) => setItemsText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  placeholder="Diamond, 4, 100&#10;Ruby, 7, 140&#10;Emerald, 5, 90"
                />
              </div>

              {error && (
                <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleApplyCustom}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition-colors"
              >
                Apply Custom Knapsack &amp; Solve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
