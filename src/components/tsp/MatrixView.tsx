import React from 'react';
import { ReductionOperation } from '../../algorithms/types';

interface MatrixViewProps {
  matrix?: number[][];
  originalMatrix: number[][];
  cityNames: string[];
  reductionOps?: ReductionOperation[];
  title?: string;
  boundArithmetic?: {
    parentBound: number;
    edgeCost: number;
    edgeName: string;
    newReduction: number;
    childBound: number;
  };
}

export const MatrixView: React.FC<MatrixViewProps> = ({
  matrix,
  originalMatrix,
  cityNames,
  reductionOps = [],
  title = 'Reduced Cost Matrix & Bounding Arithmetic',
  boundArithmetic,
}) => {
  const currentMatrix = matrix || originalMatrix;
  const n = currentMatrix.length;

  // Build lookup of row reductions and column reductions
  const rowReductions: Record<number, number> = {};
  const colReductions: Record<number, number> = {};

  reductionOps.forEach((op) => {
    if (op.type === 'row') {
      rowReductions[op.index] = op.minimum;
    } else {
      colReductions[op.index] = op.minimum;
    }
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-full">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">{title}</h2>
          <p className="text-[11px] text-slate-400">
            Rows and columns are reduced by subtracting their minimum finite value.
          </p>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="flex-1 overflow-x-auto flex flex-col justify-center items-center py-2">
        <table className="border-collapse text-center text-xs font-mono select-none">
          <thead>
            <tr>
              <th className="p-2 text-slate-500 font-bold text-[10px]">From \ To</th>
              {cityNames.map((name, j) => (
                <th key={j} className="p-2 text-indigo-400 font-bold text-sm">
                  {name}
                </th>
              ))}
              <th className="p-2 text-amber-400 font-bold text-[11px] uppercase tracking-wider pl-4">
                Row Min (-rᵢ)
              </th>
            </tr>
          </thead>
          <tbody>
            {currentMatrix.map((row, i) => {
              const rowMin = rowReductions[i];
              return (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-2 font-bold text-indigo-400 text-sm">{cityNames[i]}</td>
                  {row.map((val, j) => {
                    const isInf = !Number.isFinite(val);
                    const isZero = val === 0;

                    return (
                      <td
                        key={j}
                        className={`p-2 border border-slate-800/80 min-w-[44px] transition-colors ${
                          isInf
                            ? 'text-slate-600 bg-slate-950/40'
                            : isZero
                            ? 'text-emerald-400 font-bold bg-emerald-950/20'
                            : 'text-slate-200'
                        }`}
                      >
                        {isInf ? '∞' : val}
                      </td>
                    );
                  })}
                  {/* Row reduction min */}
                  <td className="p-2 pl-4 text-left font-sans text-xs">
                    {rowMin !== undefined && rowMin > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                        -{rowMin}
                      </span>
                    ) : (
                      <span className="text-slate-600">0</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Column Reductions Row */}
            <tr className="border-t-2 border-slate-700/80">
              <td className="p-2 text-amber-400 font-bold text-[10px] uppercase">Col Min (-cⱼ)</td>
              {Array.from({ length: n }).map((_, j) => {
                const colMin = colReductions[j];
                return (
                  <td key={j} className="p-2 font-sans text-xs">
                    {colMin !== undefined && colMin > 0 ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                        -{colMin}
                      </span>
                    ) : (
                      <span className="text-slate-600">0</span>
                    )}
                  </td>
                );
              })}
              <td className="p-2 pl-4 text-xs font-semibold text-slate-500">
                Total Reductions
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Arithmetic Box */}
      {boundArithmetic && (
        <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
            Child Lower Bound Derivation (Horowitz &amp; Sahni LCBB)
          </div>
          <div className="font-mono text-indigo-300 flex flex-wrap items-center gap-1.5">
            <span>Parent Bound ({boundArithmetic.parentBound})</span>
            <span>+</span>
            <span>Edge {boundArithmetic.edgeName} ({boundArithmetic.edgeCost})</span>
            <span>+</span>
            <span>Matrix Reductions ({boundArithmetic.newReduction})</span>
            <span>=</span>
            <span className="font-bold text-white bg-indigo-600 px-2 py-0.5 rounded">
              {boundArithmetic.childBound}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
