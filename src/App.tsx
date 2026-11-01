import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ProblemType } from './algorithms/types';
import { TSP_PRESETS, TspPreset } from './algorithms/tsp/presets';
import { KNAPSACK_PRESETS, KnapsackPreset } from './algorithms/knapsack/presets';
import { solveTspBranchAndBound, TspSolverInstance } from './algorithms/tsp/tspSolver';
import { compareTspSolvers } from './algorithms/tsp/tspBruteForce';
import { solveKnapsackBranchAndBound, KnapsackSolverInstance } from './algorithms/knapsack/knapsackSolver';
import { compareKnapsackSolvers } from './algorithms/knapsack/knapsackBruteForce';

// Common Components
import { Header } from './components/common/Header';
import { ControlBar } from './components/common/ControlBar';
import { StatsBar } from './components/common/StatsBar';
import { SearchTree, GenericDisplayNode } from './components/common/SearchTree';
import { ExplanationPanel } from './components/common/ExplanationPanel';
import { ChallengeBanner } from './components/common/ChallengeBanner';
import { ComparisonModal } from './components/common/ComparisonModal';

// TSP Components
import { CityGraph } from './components/tsp/CityGraph';
import { MatrixView } from './components/tsp/MatrixView';
import { TspCustomModal } from './components/tsp/TspCustomModal';

// Knapsack Components
import { KnapsackItemsTable } from './components/knapsack/KnapsackItemsTable';
import { KnapsackCustomModal } from './components/knapsack/KnapsackCustomModal';

export default function App() {
  // Problem Selection ('tsp' | 'knapsack')
  const [activeProblem, setActiveProblem] = useState<ProblemType>('tsp');

  // Interactive Modes
  const [isChallengeMode, setIsChallengeMode] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);

  // Playback State
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Selected Tree Node Inspector (if user clicks a specific node in search tree)
  const [userSelectedNodeId, setUserSelectedNodeId] = useState<number | null>(null);

  // -------------------------------------------------------------
  // TSP State & Solver
  // -------------------------------------------------------------
  const [tspPreset, setTspPreset] = useState<TspPreset>(TSP_PRESETS[0]);
  const [tspMatrix, setTspMatrix] = useState<number[][]>(TSP_PRESETS[0].matrix);
  const [tspCityNames, setTspCityNames] = useState<string[]>(TSP_PRESETS[0].cityNames);
  const [tspCityPositions, setTspCityPositions] = useState<{ x: number; y: number }[]>(
    TSP_PRESETS[0].cityPositions
  );

  const tspSolverRef = useRef<TspSolverInstance | null>(null);
  const [tspSteps, setTspSteps] = useState(
    () => solveTspBranchAndBound(TSP_PRESETS[0].matrix, TSP_PRESETS[0].cityNames, 0).steps
  );

  // Re-initialize TSP solver when matrix changes
  const initTspSolver = (matrix: number[][], names: string[]) => {
    const instance = solveTspBranchAndBound(matrix, names, 0);
    tspSolverRef.current = instance;
    setTspSteps(instance.steps);
    setCurrentStep(0);
    setIsPlaying(false);
    setUserSelectedNodeId(null);
  };

  // -------------------------------------------------------------
  // Knapsack State & Solver
  // -------------------------------------------------------------
  const [knapsackPreset, setKnapsackPreset] = useState<KnapsackPreset>(KNAPSACK_PRESETS[0]);
  const [knapsackCapacity, setKnapsackCapacity] = useState<number>(KNAPSACK_PRESETS[0].capacity);
  const [knapsackRawItems, setKnapsackRawItems] = useState(KNAPSACK_PRESETS[0].items);

  const knapsackSolverRef = useRef<KnapsackSolverInstance | null>(null);
  const [knapsackSteps, setKnapsackSteps] = useState(
    () => solveKnapsackBranchAndBound(KNAPSACK_PRESETS[0].items, KNAPSACK_PRESETS[0].capacity).steps
  );

  const initKnapsackSolver = (
    items: { name: string; weight: number; value: number }[],
    capacity: number
  ) => {
    const instance = solveKnapsackBranchAndBound(items, capacity);
    knapsackSolverRef.current = instance;
    setKnapsackSteps(instance.steps);
    setCurrentStep(0);
    setIsPlaying(false);
    setUserSelectedNodeId(null);
  };

  // Switch problem tabs
  const handleSelectProblem = (problem: ProblemType) => {
    setActiveProblem(problem);
    setCurrentStep(0);
    setIsPlaying(false);
    setUserSelectedNodeId(null);
  };

  // Active step record depending on current problem
  const totalSteps = activeProblem === 'tsp' ? tspSteps.length : knapsackSteps.length;
  const currentTspRecord = tspSteps[Math.min(currentStep, tspSteps.length - 1)];
  const currentKnapsackRecord = knapsackSteps[Math.min(currentStep, knapsackSteps.length - 1)];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(250, 1500 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, totalSteps]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (currentStep < totalSteps - 1) {
          setCurrentStep((prev) => prev + 1);
        } else {
          setIsPlaying((prev) => !prev);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentStep < totalSteps - 1) {
          setCurrentStep((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentStep > 0) {
          setCurrentStep((prev) => prev - 1);
        }
      } else if (e.key.toLowerCase() === 'r') {
        setCurrentStep(0);
        setIsPlaying(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, totalSteps]);

  // Handle "Explore Anyway" pedagogical override
  const handleExploreAnyway = (nodeId: number) => {
    if (activeProblem === 'tsp') {
      const instance = tspSolverRef.current || solveTspBranchAndBound(tspMatrix, tspCityNames, 0);
      tspSolverRef.current = instance;
      const updatedSteps = instance.exploreNodeAnyway(nodeId, currentStep);
      setTspSteps(updatedSteps);
      setCurrentStep(updatedSteps.length - 1);
    } else {
      const instance =
        knapsackSolverRef.current || solveKnapsackBranchAndBound(knapsackRawItems, knapsackCapacity);
      knapsackSolverRef.current = instance;
      const updatedSteps = instance.exploreNodeAnyway(nodeId, currentStep);
      setKnapsackSteps(updatedSteps);
      setCurrentStep(updatedSteps.length - 1);
    }
  };

  // Convert TSP or Knapsack nodes to generic nodes for SearchTree
  const searchTreeDisplayNodes: GenericDisplayNode[] = useMemo(() => {
    if (activeProblem === 'tsp') {
      if (!currentTspRecord) return [];
      return currentTspRecord.nodes.map((node) => ({
        id: node.id,
        parentId: node.parentId,
        label: node.path.map((c) => tspCityNames[c]).join(' → '),
        boundDisplay: Number.isFinite(node.bound) ? `${node.bound}` : '∞',
        boundLabel: 'Lower Bound',
        status: node.status,
        reason: node.reason,
        depth: node.depth,
        isOverridden: node.isOverridden,
      }));
    } else {
      if (!currentKnapsackRecord) return [];
      const items = knapsackSolverRef.current?.items || [];
      return currentKnapsackRecord.nodes.map((node) => {
        let label = 'Root';
        if (node.decision === 'take' && node.level >= 0) {
          const itemName = items[node.level]?.name || `Item ${node.level + 1}`;
          label = `TAKE ${itemName}`;
        } else if (node.decision === 'skip' && node.level >= 0) {
          const itemName = items[node.level]?.name || `Item ${node.level + 1}`;
          label = `SKIP ${itemName}`;
        }
        return {
          id: node.id,
          parentId: node.parentId,
          label,
          boundDisplay: Number.isFinite(node.upperBound) ? `$${node.upperBound}` : '-∞',
          boundLabel: 'Upper Bound',
          status: node.status,
          reason: node.reason,
          depth: node.depth,
          isOverridden: node.isOverridden,
        };
      });
    }
  }, [activeProblem, currentTspRecord, currentKnapsackRecord, tspCityNames]);

  // Inspected node (either user clicked on tree or active node from step record)
  const inspectedNodeId =
    userSelectedNodeId !== null
      ? userSelectedNodeId
      : activeProblem === 'tsp'
      ? currentTspRecord?.activeNodeId
      : currentKnapsackRecord?.activeNodeId;

  const inspectedTspNode = currentTspRecord?.nodes.find((n) => n.id === inspectedNodeId);
  const inspectedKnapsackNode = currentKnapsackRecord?.nodes.find((n) => n.id === inspectedNodeId);

  // Benchmarking comparison calculations (benchmarks the full problem instance run)
  const comparisonResults = useMemo(() => {
    if (activeProblem === 'tsp') {
      const finalStep = tspSteps[tspSteps.length - 1];
      const stats = finalStep?.stats || { generated: 1, expanded: 0, pruned: 0 };
      return compareTspSolvers(
        tspMatrix,
        stats,
        finalStep?.bestCost ?? Infinity,
        finalStep?.bestTour ?? null,
        tspCityNames
      );
    } else {
      const finalStep = knapsackSteps[knapsackSteps.length - 1];
      const stats = finalStep?.stats || { generated: 1, expanded: 0, pruned: 0 };
      const items =
        knapsackSolverRef.current?.items ||
        solveKnapsackBranchAndBound(knapsackRawItems, knapsackCapacity).items;
      return compareKnapsackSolvers(
        items,
        knapsackCapacity,
        stats,
        finalStep?.bestValue ?? 0,
        finalStep?.bestItems ?? null
      );
    }
  }, [
    activeProblem,
    tspSteps,
    knapsackSteps,
    tspMatrix,
    tspCityNames,
    knapsackRawItems,
    knapsackCapacity,
  ]);

  // TSP bound arithmetic for currently inspected node
  const tspBoundArithmetic = inspectedTspNode && inspectedTspNode.parentId !== null
    ? {
        parentBound:
          currentTspRecord?.nodes.find((n) => n.id === inspectedTspNode.parentId)?.bound ?? 0,
        edgeCost: inspectedTspNode.edgeCostFromParent,
        edgeName: `${tspCityNames[currentTspRecord?.nodes.find((n) => n.id === inspectedTspNode.parentId)?.city ?? 0]}→${tspCityNames[inspectedTspNode.city]}`,
        newReduction: inspectedTspNode.additionalReductionCost,
        childBound: inspectedTspNode.bound,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Top Header */}
      <Header
        activeProblem={activeProblem}
        onSelectProblem={handleSelectProblem}
        isChallengeMode={isChallengeMode}
        onToggleChallengeMode={() => setIsChallengeMode((prev) => !prev)}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        presetName={activeProblem === 'tsp' ? tspPreset.name : knapsackPreset.name}
      />

      {/* 2. Interactive Step Control Bar */}
      <ControlBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        isPlaying={isPlaying}
        onPlayPause={() => {
          if (currentStep >= totalSteps - 1) {
            setCurrentStep(0);
            setIsPlaying(true);
          } else {
            setIsPlaying((prev) => !prev);
          }
        }}
        onNext={() => {
          if (currentStep < totalSteps - 1) {
            setCurrentStep((prev) => prev + 1);
            setUserSelectedNodeId(null);
          }
        }}
        onPrev={() => {
          if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
            setUserSelectedNodeId(null);
          }
        }}
        onReset={() => {
          setCurrentStep(0);
          setIsPlaying(false);
          setUserSelectedNodeId(null);
        }}
        onJumpToStart={() => {
          setCurrentStep(0);
          setIsPlaying(false);
          setUserSelectedNodeId(null);
        }}
        onJumpToEnd={() => {
          setCurrentStep(totalSteps - 1);
          setIsPlaying(false);
          setUserSelectedNodeId(null);
        }}
        playbackSpeed={playbackSpeed}
        onSpeedChange={setPlaybackSpeed}
        onScrub={(idx) => {
          setCurrentStep(idx);
          setUserSelectedNodeId(null);
        }}
      />

      {/* 3. Live Statistics Bar */}
      <StatsBar
        stats={
          activeProblem === 'tsp'
            ? currentTspRecord?.stats || { generated: 1, expanded: 0, pruned: 0 }
            : currentKnapsackRecord?.stats || { generated: 1, expanded: 0, pruned: 0 }
        }
        frontierCount={
          activeProblem === 'tsp'
            ? currentTspRecord?.frontierNodeIds.length || 0
            : currentKnapsackRecord?.frontierNodeIds.length || 0
        }
        bestCostOrValue={
          activeProblem === 'tsp'
            ? currentTspRecord?.bestCost === Infinity
              ? null
              : currentTspRecord?.bestCost ?? null
            : currentKnapsackRecord?.bestValue || null
        }
        bestSolutionText={
          activeProblem === 'tsp'
            ? currentTspRecord?.bestTour
              ? currentTspRecord.bestTour.map((c) => tspCityNames[c]).join(' → ')
              : 'None found yet'
            : currentKnapsackRecord?.bestItems && currentKnapsackRecord.bestItems.length > 0
            ? currentKnapsackRecord.bestItems
                .map((id) => (knapsackSolverRef.current?.items || [])[id]?.name || `Item ${id + 1}`)
                .join(', ')
            : 'None found yet'
        }
        isMinimization={activeProblem === 'tsp'}
      />

      {/* 4. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Challenge Mode Prediction Quiz Banner (if active) */}
        {isChallengeMode && (
          <ChallengeBanner
            challenge={
              activeProblem === 'tsp'
                ? currentTspRecord?.challenge
                : currentKnapsackRecord?.challenge
            }
            isMinimization={activeProblem === 'tsp'}
          />
        )}

        {/* Algorithmic Reasoning & Explanation Panel */}
        <ExplanationPanel
          title={
            activeProblem === 'tsp'
              ? currentTspRecord?.title || 'Initializing...'
              : currentKnapsackRecord?.title || 'Initializing...'
          }
          description={
            activeProblem === 'tsp'
              ? currentTspRecord?.description || ''
              : currentKnapsackRecord?.description || ''
          }
          formula={
            activeProblem === 'tsp'
              ? currentTspRecord?.detailedFormula
              : currentKnapsackRecord?.detailedFormula
          }
          pruneReason={
            activeProblem === 'tsp'
              ? inspectedTspNode?.status === 'pruned'
                ? inspectedTspNode.reason
                : currentTspRecord?.type === 'prune'
                ? currentTspRecord.description
                : null
              : inspectedKnapsackNode?.status === 'pruned'
              ? inspectedKnapsackNode.reason
              : currentKnapsackRecord?.type === 'prune'
              ? currentKnapsackRecord.description
              : null
          }
          nodeStatus={
            activeProblem === 'tsp'
              ? inspectedTspNode?.status || currentTspRecord?.type
              : inspectedKnapsackNode?.status || currentKnapsackRecord?.type
          }
          activeNodeId={inspectedNodeId}
        />

        {/* Problem-Specific Visual Components (2 Columns) */}
        {activeProblem === 'tsp' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* City Network Graph View */}
            <div className="h-[380px]">
              <CityGraph
                cityNames={tspCityNames}
                cityPositions={tspCityPositions}
                distanceMatrix={tspMatrix}
                currentPath={inspectedTspNode?.path || currentTspRecord?.nodes[0]?.path || [0]}
                candidateEdge={
                  currentTspRecord?.type === 'expand' || currentTspRecord?.type === 'prune'
                    ? [
                        inspectedTspNode?.path[inspectedTspNode.path.length - 2] ?? 0,
                        inspectedTspNode?.city ?? 0,
                      ]
                    : null
                }
                bestTour={currentTspRecord?.bestTour}
              />
            </div>

            {/* Reduced Matrix & Arithmetic Breakdown View */}
            <div className="h-[380px]">
              <MatrixView
                matrix={inspectedTspNode?.matrix || currentTspRecord?.currentMatrix}
                originalMatrix={tspMatrix}
                cityNames={tspCityNames}
                reductionOps={
                  inspectedTspNode?.reductionOps || currentTspRecord?.reductionOps || []
                }
                boundArithmetic={tspBoundArithmetic}
              />
            </div>
          </div>
        ) : (
          <div className="h-[380px]">
            <KnapsackItemsTable
              items={
                knapsackSolverRef.current?.items ||
                solveKnapsackBranchAndBound(knapsackRawItems, knapsackCapacity).items
              }
              capacity={knapsackCapacity}
              currentWeight={inspectedKnapsackNode?.currentWeight ?? 0}
              currentValue={inspectedKnapsackNode?.currentValue ?? 0}
              takenItemIds={inspectedKnapsackNode?.takenItemIds ?? []}
              currentItemLevel={inspectedKnapsackNode?.level ?? -1}
              boundBreakdown={inspectedKnapsackNode?.boundBreakdown}
              upperBound={inspectedKnapsackNode?.upperBound}
            />
          </div>
        )}

        {/* State-Space Search Tree View */}
        <div className="min-h-[380px]">
          <SearchTree
            nodes={searchTreeDisplayNodes}
            activeNodeId={inspectedNodeId}
            onSelectNode={(nodeId) => setUserSelectedNodeId(nodeId)}
            onExploreAnyway={handleExploreAnyway}
            title={
              activeProblem === 'tsp'
                ? 'TSP State-Space Search Tree (Least-Cost Branch and Bound)'
                : '0/1 Knapsack Decision Tree (Take / Skip Branches)'
            }
          />
        </div>
      </main>

      {/* Comparison Benchmark Modal */}
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        bbData={comparisonResults.bbComparison}
        bfData={comparisonResults.bfComparison}
        nodesEliminated={comparisonResults.nodesEliminated}
        pruningPercentage={comparisonResults.pruningPercentage}
      />

      {/* Custom Problem Modals */}
      {activeProblem === 'tsp' ? (
        <TspCustomModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          currentPresetId={tspPreset.id}
          onSelectPreset={(preset) => {
            setTspPreset(preset);
            setTspMatrix(preset.matrix);
            setTspCityNames(preset.cityNames);
            setTspCityPositions(preset.cityPositions);
            initTspSolver(preset.matrix, preset.cityNames);
          }}
          onApplyCustomMatrix={(matrix, names) => {
            // Generate circular positions for custom cities
            const n = names.length;
            const positions = names.map((_, i) => {
              const angle = (2 * Math.PI * i) / n - Math.PI / 2;
              return {
                x: Math.round(200 + 120 * Math.cos(angle)),
                y: Math.round(150 + 100 * Math.sin(angle)),
              };
            });
            setTspMatrix(matrix);
            setTspCityNames(names);
            setTspCityPositions(positions);
            setTspPreset({
              id: 'custom',
              name: `Custom (${n} Cities)`,
              description: 'User-configured custom distance matrix.',
              cityNames: names,
              cityPositions: positions,
              matrix,
            });
            initTspSolver(matrix, names);
          }}
        />
      ) : (
        <KnapsackCustomModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          currentPresetId={knapsackPreset.id}
          onSelectPreset={(preset) => {
            setKnapsackPreset(preset);
            setKnapsackCapacity(preset.capacity);
            setKnapsackRawItems(preset.items);
            initKnapsackSolver(preset.items, preset.capacity);
          }}
          onApplyCustom={(items, capacity) => {
            setKnapsackRawItems(items);
            setKnapsackCapacity(capacity);
            setKnapsackPreset({
              id: 'custom',
              name: `Custom Knapsack (${items.length} Items, Cap: ${capacity})`,
              description: 'User-defined knapsack items and capacity.',
              capacity,
              items,
              expectedOptimalValue: 0,
            });
            initKnapsackSolver(items, capacity);
          }}
        />
      )}
    </div>
  );
}
