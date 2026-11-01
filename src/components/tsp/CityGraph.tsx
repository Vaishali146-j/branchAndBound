import React from 'react';
import { INF } from '../../algorithms/types';

interface CityGraphProps {
  cityNames: string[];
  cityPositions: { x: number; y: number }[];
  distanceMatrix: number[][];
  currentPath?: number[];
  candidateEdge?: [number, number] | null;
  bestTour?: number[] | null;
}

export const CityGraph: React.FC<CityGraphProps> = ({
  cityNames,
  cityPositions,
  distanceMatrix,
  currentPath = [],
  candidateEdge = null,
  bestTour = null,
}) => {
  const n = cityNames.length;

  // Helper to check if edge (i, j) is in the current partial tour
  const isEdgeInPath = (u: number, v: number): boolean => {
    if (!currentPath || currentPath.length < 2) return false;
    for (let i = 0; i < currentPath.length - 1; i++) {
      if (
        (currentPath[i] === u && currentPath[i + 1] === v) ||
        (currentPath[i] === v && currentPath[i + 1] === u)
      ) {
        return true;
      }
    }
    return false;
  };

  // Helper to check if edge (i, j) is in the best complete tour
  const isEdgeInBestTour = (u: number, v: number): boolean => {
    if (!bestTour || bestTour.length < 2) return false;
    for (let i = 0; i < bestTour.length - 1; i++) {
      if (
        (bestTour[i] === u && bestTour[i + 1] === v) ||
        (bestTour[i] === v && bestTour[i + 1] === u)
      ) {
        return true;
      }
    }
    return false;
  };

  const isCandidateEdge = (u: number, v: number): boolean => {
    if (!candidateEdge) return false;
    return (
      (candidateEdge[0] === u && candidateEdge[1] === v) ||
      (candidateEdge[0] === v && candidateEdge[1] === u)
    );
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-full">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <h2 className="text-sm font-bold text-white tracking-wide">
          City Network &amp; Active Tour
        </h2>
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-indigo-400 inline-block" /> Active Path
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-amber-400 border-dashed inline-block" /> Candidate
          </span>
          {bestTour && (
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block" /> Best Tour
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 flex items-center justify-center min-h-[260px] relative">
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full max-h-[320px] select-none"
        >
          {/* Defs for arrowheads and glow */}
          <defs>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#818cf8" />
            </marker>
            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Edges */}
          {Array.from({ length: n }).map((_, i) =>
            Array.from({ length: n }).map((__, j) => {
              if (j <= i) return null; // Avoid drawing duplicate undirected lines
              const dist = distanceMatrix[i][j];
              if (!Number.isFinite(dist) || dist <= 0) return null;

              const p1 = cityPositions[i];
              const p2 = cityPositions[j];
              if (!p1 || !p2) return null;

              const inPath = isEdgeInPath(i, j);
              const inBest = isEdgeInBestTour(i, j);
              const isCand = isCandidateEdge(i, j);

              let stroke = '#334155'; // default slate-700
              let strokeWidth = 1.5;
              let strokeDasharray = 'none';

              if (inPath) {
                stroke = '#6366f1'; // indigo-500
                strokeWidth = 3.5;
              } else if (isCand) {
                stroke = '#f59e0b'; // amber-500
                strokeWidth = 2.5;
                strokeDasharray = '4 4';
              } else if (inBest && (!currentPath || currentPath.length === 1)) {
                stroke = '#10b981'; // emerald-500
                strokeWidth = 3;
              }

              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;

              return (
                <g key={`edge-${i}-${j}`}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  {/* Distance weight badge */}
                  <rect
                    x={midX - 11}
                    y={midY - 8}
                    width={22}
                    height={16}
                    rx={4}
                    fill="#0f172a"
                    stroke={inPath ? '#6366f1' : '#334155'}
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 3.5}
                    textAnchor="middle"
                    fill={inPath ? '#a5b4fc' : '#94a3b8'}
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {dist}
                  </text>
                </g>
              );
            })
          )}

          {/* City Nodes */}
          {cityPositions.map((pos, idx) => {
            const isStart = idx === 0;
            const isInPath = currentPath.includes(idx);
            const isCurrentTip = currentPath.length > 0 && currentPath[currentPath.length - 1] === idx;

            let fill = '#1e293b';
            let stroke = '#475569';
            let r = 18;

            if (isCurrentTip) {
              fill = '#4f46e5';
              stroke = '#818cf8';
              r = 21;
            } else if (isInPath) {
              fill = '#312e81';
              stroke = '#6366f1';
            } else if (isStart) {
              stroke = '#a855f7';
            }

            return (
              <g key={`city-${idx}`} className="cursor-pointer">
                {isCurrentTip && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={28}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth={1.5}
                    opacity={0.4}
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={2.5}
                  className="transition-all duration-200"
                />
                <text
                  x={pos.x}
                  y={pos.y + 4.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {cityNames[idx]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Path status footer */}
      <div className="pt-2 border-t border-slate-800 text-xs flex items-center justify-between text-slate-300">
        <div>
          <span className="text-slate-400">Current Path:</span>{' '}
          <span className="font-mono font-bold text-indigo-300">
            {currentPath.length > 0 ? currentPath.map((c) => cityNames[c]).join(' → ') : 'Start'}
          </span>
        </div>
        {bestTour && (
          <div className="text-right">
            <span className="text-slate-400">Best Complete Tour:</span>{' '}
            <span className="font-mono font-bold text-emerald-400">
              {bestTour.map((c) => cityNames[c]).join(' → ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
