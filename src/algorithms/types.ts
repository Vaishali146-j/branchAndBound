export const INF = Infinity;

export type ProblemType = 'tsp' | 'knapsack';

export type NodeStatus =
  | 'root'
  | 'frontier'       // Live in priority queue
  | 'selected'       // Currently chosen for expansion
  | 'expanded'       // Children generated
  | 'pruned'         // Cut off by bound or feasibility
  | 'complete'       // Valid complete solution reached
  | 'overridden';    // Pruned node forced to explore by user ("Explore Anyway")

export interface ReductionOperation {
  type: 'row' | 'column';
  index: number;
  minimum: number;
}

export interface MatrixReductionResult {
  matrix: number[][];
  reductionCost: number;
  operations: ReductionOperation[];
}

export interface TspTreeNode {
  id: number;
  parentId: number | null;
  city: number;               // Current city reached
  path: number[];             // Order of visited cities: [0, 2, 1...]
  visited: number[];          // Set of visited city indices
  matrix: number[][];         // Reduced matrix at this node
  bound: number;              // Calculated lower bound
  edgeCostFromParent: number; // Cost from parent to this city in parent's reduced matrix
  additionalReductionCost: number; // Sum of row & col reductions for this child
  status: NodeStatus;
  reason: string;             // Detailed mathematical explanation
  isOverridden?: boolean;     // Whether user used "Explore Anyway"
  depth: number;
  reductionOps?: ReductionOperation[];
}

export interface TspStepRecord {
  stepIndex: number;
  type: 'init' | 'select' | 'expand' | 'prune' | 'solution' | 'overridden' | 'finished';
  title: string;
  description: string;
  detailedFormula?: string;
  activeNodeId?: number;
  selectedChildId?: number;
  nodes: TspTreeNode[];
  frontierNodeIds: number[];
  bestTour: number[] | null;
  bestCost: number;
  currentMatrix?: number[][];
  reductionOps?: ReductionOperation[];
  stats: {
    generated: number;
    expanded: number;
    pruned: number;
    completeTours: number;
    overridden: number;
  };
  // Data for Interactive Challenge / Quiz mode
  challenge?: {
    nodeId: number;
    city: number;
    path: number[];
    lowerBound: number;
    bestCost: number;
    correctAction: 'explore' | 'prune';
    explanation: string;
  };
}

export interface KnapsackItem {
  id: number;
  name: string;
  weight: number;
  value: number;
  ratio: number; // value / weight
}

export interface KnapsackTreeNode {
  id: number;
  parentId: number | null;
  level: number;              // Item index being considered (0 to N-1)
  decision: 'take' | 'skip' | 'root';
  currentWeight: number;
  currentValue: number;
  upperBound: number;         // Fractional knapsack relaxation bound
  boundBreakdown: {
    baseValue: number;
    fractionalItems: { item: KnapsackItem; fraction: number; valueGain: number }[];
    remainingCapacity: number;
  };
  takenItemIds: number[];
  status: NodeStatus;
  reason: string;
  isOverridden?: boolean;
  depth: number;
}

export interface KnapsackStepRecord {
  stepIndex: number;
  type: 'init' | 'select' | 'expand' | 'prune' | 'solution' | 'overridden' | 'finished';
  title: string;
  description: string;
  detailedFormula?: string;
  activeNodeId?: number;
  nodes: KnapsackTreeNode[];
  frontierNodeIds: number[];
  bestItems: number[] | null;
  bestValue: number;
  stats: {
    generated: number;
    expanded: number;
    pruned: number;
    solutionsFound: number;
    overridden: number;
  };
  challenge?: {
    nodeId: number;
    decision: 'take' | 'skip';
    upperBound: number;
    bestValue: number;
    correctAction: 'explore' | 'prune';
    explanation: string;
  };
}

export interface BenchmarkComparison {
  algorithm: 'Branch and Bound' | 'Brute Force';
  problemName: string;
  nodesExplored: number;
  nodesPruned: number;
  totalSearchSpace: number;
  pruningPercentage: number;
  executionTimeMs: number;
  optimalSolutionString: string;
  optimalCostOrValue: number;
  speedupFactor?: number;
}
