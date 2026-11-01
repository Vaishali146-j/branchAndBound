import React from 'react';
import { Scissors, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { NodeStatus } from '../../algorithms/types';

export interface GenericDisplayNode {
  id: number;
  parentId: number | null;
  label: string;
  boundDisplay: string;
  boundLabel: string;
  status: NodeStatus;
  reason?: string;
  depth: number;
  isOverridden?: boolean;
}

interface SearchTreeProps {
  nodes: GenericDisplayNode[];
  activeNodeId?: number;
  onSelectNode: (nodeId: number) => void;
  onExploreAnyway?: (nodeId: number) => void;
  title?: string;
}

export const SearchTree: React.FC<SearchTreeProps> = ({
  nodes,
  activeNodeId,
  onSelectNode,
  onExploreAnyway,
  title = 'State-Space Search Tree',
}) => {
  // Group nodes by depth for layered tree rendering
  const nodesByDepth: Record<number, GenericDisplayNode[]> = {};
  nodes.forEach((node) => {
    if (!nodesByDepth[node.depth]) {
      nodesByDepth[node.depth] = [];
    }
    nodesByDepth[node.depth].push(node);
  });

  const depths = Object.keys(nodesByDepth)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-full">
      {/* Header and Legend */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white tracking-wide">{title}</h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {nodes.length} nodes
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Active
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Frontier
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" /> Expanded
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Pruned
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Complete
          </span>
        </div>
      </div>

      {/* Interactive Tree View with horizontal scroll */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-[300px] p-2 custom-scrollbar">
        {depths.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-500 text-xs">
            Search tree will appear when the algorithm begins.
          </div>
        ) : (
          <div className="flex flex-col gap-6 items-center min-w-max pb-4">
            {depths.map((depth) => {
              const layerNodes = nodesByDepth[depth];
              return (
                <div key={depth} className="flex flex-col items-center w-full">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">
                    Level {depth} {depth === 0 ? '(Root)' : ''}
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {layerNodes.map((node) => {
                      const isActive = node.id === activeNodeId;
                      const isPruned = node.status === 'pruned';
                      const isComplete = node.status === 'complete';
                      const isFrontier = node.status === 'frontier';
                      const isOverridden = node.status === 'overridden' || node.isOverridden;

                      // Theme colors based on status
                      let borderClass = 'border-slate-700 bg-slate-800/80 hover:border-slate-500';
                      let statusBadge = (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-700 text-slate-300">
                          Expanded
                        </span>
                      );

                      if (isActive) {
                        borderClass = 'border-indigo-400 bg-indigo-950/40 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20';
                      }

                      if (node.status === 'root') {
                        borderClass = 'border-indigo-500 bg-indigo-950/30';
                        statusBadge = (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                            Root
                          </span>
                        );
                      } else if (isComplete) {
                        borderClass = 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/40 shadow-emerald-500/10';
                        statusBadge = (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
                            <Check className="w-2.5 h-2.5" /> Optimal
                          </span>
                        );
                      } else if (isPruned) {
                        borderClass = 'border-rose-500/70 bg-rose-950/20 shadow-rose-500/5 opacity-85';
                        statusBadge = (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                            <Scissors className="w-2.5 h-2.5" /> Pruned
                          </span>
                        );
                      } else if (isOverridden) {
                        borderClass = 'border-purple-500/80 bg-purple-950/30 ring-1 ring-purple-500/40';
                        statusBadge = (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                            <AlertTriangle className="w-2.5 h-2.5" /> Overridden
                          </span>
                        );
                      } else if (isFrontier) {
                        borderClass = 'border-amber-500/70 bg-amber-950/20 shadow-amber-500/5';
                        statusBadge = (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 animate-pulse">
                            Frontier
                          </span>
                        );
                      }

                      return (
                        <div
                          key={node.id}
                          onClick={() => onSelectNode(node.id)}
                          className={`relative group rounded-xl p-3 border cursor-pointer transition-all w-48 text-left ${borderClass}`}
                        >
                          {/* Node Header */}
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-xs font-bold text-slate-200">
                              Node #{node.id}
                            </span>
                            {statusBadge}
                          </div>

                          {/* Path / Decision Label */}
                          <div className="text-xs font-semibold text-white truncate mb-1" title={node.label}>
                            {node.label}
                          </div>

                          {/* Bound Value */}
                          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-700/60">
                            <span className="text-slate-400">{node.boundLabel}:</span>
                            <span className="font-mono font-bold text-indigo-300">
                              {node.boundDisplay}
                            </span>
                          </div>

                          {/* "Explore Anyway" button for pruned nodes */}
                          {isPruned && onExploreAnyway && (
                            <div className="mt-2 pt-1.5 border-t border-rose-500/30 flex justify-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onExploreAnyway(node.id);
                                }}
                                className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 text-[10px] font-bold border border-rose-500/40 transition-colors shadow-sm"
                                title="Expand this branch to verify mathematically that it cannot beat the incumbent"
                              >
                                <Sparkles className="w-3 h-3 text-rose-300" />
                                <span>Explore Anyway</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
