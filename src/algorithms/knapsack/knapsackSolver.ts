import { KnapsackItem, KnapsackStepRecord, KnapsackTreeNode } from '../types';

export interface KnapsackSolverInstance {
  steps: KnapsackStepRecord[];
  items: KnapsackItem[];
  capacity: number;
  exploreNodeAnyway: (nodeId: number, currentStepIndex: number) => KnapsackStepRecord[];
}

/**
 * Calculates fractional knapsack relaxation upper bound from index startIdx onwards.
 */
export function calculateUpperBound(
  items: KnapsackItem[],
  capacity: number,
  currentWeight: number,
  currentValue: number,
  startLevel: number
): {
  upperBound: number;
  breakdown: KnapsackTreeNode['boundBreakdown'];
} {
  let remainingCapacity = capacity - currentWeight;
  let bound = currentValue;
  const fractionalItems: KnapsackTreeNode['boundBreakdown']['fractionalItems'] = [];

  if (remainingCapacity < 0) {
    return {
      upperBound: -Infinity,
      breakdown: { baseValue: currentValue, fractionalItems: [], remainingCapacity },
    };
  }

  for (let i = startLevel; i < items.length; i++) {
    const item = items[i];
    if (item.weight <= remainingCapacity) {
      remainingCapacity -= item.weight;
      bound += item.value;
      fractionalItems.push({
        item,
        fraction: 1,
        valueGain: item.value,
      });
    } else {
      if (remainingCapacity > 0) {
        const fraction = remainingCapacity / item.weight;
        const valueGain = Number((item.value * fraction).toFixed(2));
        bound += valueGain;
        fractionalItems.push({
          item,
          fraction: Number(fraction.toFixed(2)),
          valueGain,
        });
        remainingCapacity = 0;
      }
      break;
    }
  }

  return {
    upperBound: Number(bound.toFixed(2)),
    breakdown: {
      baseValue: currentValue,
      fractionalItems,
      remainingCapacity,
    },
  };
}

export function solveKnapsackBranchAndBound(
  rawItems: { name: string; weight: number; value: number }[],
  capacity: number
): KnapsackSolverInstance {
  // Sort items descending by value/weight ratio
  const items: KnapsackItem[] = rawItems
    .map((item, idx) => ({
      id: idx,
      name: item.name,
      weight: item.weight,
      value: item.value,
      ratio: Number((item.value / item.weight).toFixed(2)),
    }))
    .sort((a, b) => b.ratio - a.ratio);

  const steps: KnapsackStepRecord[] = [];
  let nextNodeId = 0;

  // Root node
  const rootBound = calculateUpperBound(items, capacity, 0, 0, 0);
  const rootNode: KnapsackTreeNode = {
    id: nextNodeId++,
    parentId: null,
    level: -1,
    decision: 'root',
    currentWeight: 0,
    currentValue: 0,
    upperBound: rootBound.upperBound,
    boundBreakdown: rootBound.breakdown,
    takenItemIds: [],
    status: 'root',
    reason: `Initial root Upper Bound = ${rootBound.upperBound} calculated via Fractional Knapsack Relaxation on sorted items.`,
    depth: 0,
  };

  const allNodes: KnapsackTreeNode[] = [rootNode];
  let frontier: KnapsackTreeNode[] = [rootNode];
  let bestItems: number[] | null = null;
  let bestValue = 0;

  const stats = {
    generated: 1,
    expanded: 0,
    pruned: 0,
    solutionsFound: 0,
    overridden: 0,
  };

  function recordStep(
    type: KnapsackStepRecord['type'],
    title: string,
    description: string,
    extra: Partial<KnapsackStepRecord> = {}
  ) {
    steps.push({
      stepIndex: steps.length,
      type,
      title,
      description,
      nodes: allNodes.map((n) => ({ ...n })),
      frontierNodeIds: frontier.map((n) => n.id),
      bestItems: bestItems ? [...bestItems] : null,
      bestValue,
      stats: { ...stats },
      ...extra,
    });
  }

  // Initial step
  recordStep(
    'init',
    'Root Upper Bound Calculation',
    `Sorted ${items.length} items by profit density (value/weight). Solved Fractional Knapsack to determine theoretical ceiling Upper Bound = ${rootBound.upperBound}.`,
    {
      activeNodeId: rootNode.id,
      detailedFormula: `Root Upper Bound = ${rootBound.upperBound} (Capacity: ${capacity})`,
    }
  );

  // Best-First Branch and Bound (expand node with highest Upper Bound)
  while (frontier.length > 0) {
    // Sort descending by upper bound
    frontier.sort((a, b) => b.upperBound - a.upperBound || a.id - b.id);
    const current = frontier.shift()!;

    // Pruning check: can this node beat the current best known integer solution?
    if (current.upperBound <= bestValue && current.decision !== 'root') {
      current.status = 'pruned';
      current.reason = `Pruned: Upper Bound (${current.upperBound}) ≤ Best Known Solution (${bestValue}). Cannot produce an improvement.`;
      stats.pruned++;

      recordStep(
        'prune',
        `Prune Node ${current.id}`,
        `Node ${current.id} has Upper Bound ${current.upperBound} ≤ Best Value ${bestValue}. Pruning entire branch.`,
        {
          activeNodeId: current.id,
          detailedFormula: `Upper Bound (${current.upperBound}) ≤ Incumbent (${bestValue}) → PRUNED`,
        }
      );
      continue;
    }

    // If we've reached a leaf (all items decided)
    if (current.level >= items.length - 1) {
      if (current.currentValue > bestValue) {
        bestValue = current.currentValue;
        bestItems = [...current.takenItemIds];
        current.status = 'complete';
        stats.solutionsFound++;

        recordStep(
          'solution',
          `Leaf Solution at Node ${current.id}`,
          `Reached leaf node with valid weight ${current.currentWeight} ≤ ${capacity} and new record Value = ${current.currentValue}!`,
          {
            activeNodeId: current.id,
            detailedFormula: `New Best Value = ${current.currentValue} (Items: ${current.takenItemIds.map((id) => items[id].name).join(', ') || 'None'})`,
          }
        );
      }
      continue;
    }

    current.status = 'expanded';
    stats.expanded++;

    const nextLevel = current.level + 1;
    const item = items[nextLevel];

    recordStep(
      'select',
      `Expand Node ${current.id} ➔ Considering Item "${item.name}"`,
      `Branching on item ${nextLevel + 1}/${items.length} (${item.name}: W=${item.weight}, V=${item.value}, Ratio=${item.ratio}). Exploring Take vs Skip.`,
      {
        activeNodeId: current.id,
        detailedFormula: `Next decision: Take "${item.name}" (+${item.weight}kg, +$${item.value}) OR Skip`,
      }
    );

    // Branch 1: TAKE item (if weight capacity allows)
    const canTake = current.currentWeight + item.weight <= capacity;
    if (canTake) {
      const takeWeight = current.currentWeight + item.weight;
      const takeValue = current.currentValue + item.value;
      const takeBound = calculateUpperBound(items, capacity, takeWeight, takeValue, nextLevel + 1);
      const isBetterSolution = takeValue > bestValue;
      if (isBetterSolution) {
        bestValue = takeValue;
        bestItems = [...current.takenItemIds, nextLevel];
        stats.solutionsFound++;
      }

      const isPruned = takeBound.upperBound <= bestValue && nextLevel < items.length - 1;

      const takeNode: KnapsackTreeNode = {
        id: nextNodeId++,
        parentId: current.id,
        level: nextLevel,
        decision: 'take',
        currentWeight: takeWeight,
        currentValue: takeValue,
        upperBound: takeBound.upperBound,
        boundBreakdown: takeBound.breakdown,
        takenItemIds: [...current.takenItemIds, nextLevel],
        status: isPruned ? 'pruned' : 'frontier',
        reason: isPruned
          ? `Pruned: Upper bound ${takeBound.upperBound} ≤ Best known ${bestValue}.`
          : `Valid branch: Upper bound ${takeBound.upperBound} > Best known ${bestValue}.`,
        depth: current.depth + 1,
      };

      stats.generated++;
      allNodes.push(takeNode);

      if (isPruned) {
        stats.pruned++;
      } else {
        frontier.push(takeNode);
      }

      recordStep(
        isPruned ? 'prune' : 'expand',
        `Branch TAKE "${item.name}" (Node ${takeNode.id})`,
        `Included "${item.name}". Total Weight: ${takeWeight}/${capacity}, Value: ${takeValue}, Upper Bound: ${takeBound.upperBound}.`,
        {
          activeNodeId: takeNode.id,
          detailedFormula: `Weight: ${takeWeight}/${capacity} | Value: ${takeValue} | Upper Bound: ${takeBound.upperBound} vs Incumbent: ${bestValue}`,
          challenge: {
            nodeId: takeNode.id,
            decision: 'take',
            upperBound: takeBound.upperBound,
            bestValue,
            correctAction: isPruned ? 'prune' : 'explore',
            explanation: isPruned
              ? `Upper bound (${takeBound.upperBound}) cannot exceed best value (${bestValue}). Prune!`
              : `Upper bound (${takeBound.upperBound}) > incumbent (${bestValue}). Must explore!`,
          },
        }
      );
    }

    // Branch 2: SKIP item
    const skipBound = calculateUpperBound(items, capacity, current.currentWeight, current.currentValue, nextLevel + 1);
    const skipPruned = skipBound.upperBound <= bestValue;

    const skipNode: KnapsackTreeNode = {
      id: nextNodeId++,
      parentId: current.id,
      level: nextLevel,
      decision: 'skip',
      currentWeight: current.currentWeight,
      currentValue: current.currentValue,
      upperBound: skipBound.upperBound,
      boundBreakdown: skipBound.breakdown,
      takenItemIds: [...current.takenItemIds],
      status: skipPruned ? 'pruned' : 'frontier',
      reason: skipPruned
        ? `Pruned: Upper bound ${skipBound.upperBound} ≤ Best known ${bestValue}.`
        : `Valid branch: Upper bound ${skipBound.upperBound} > Best known ${bestValue}.`,
      depth: current.depth + 1,
    };

    stats.generated++;
    allNodes.push(skipNode);

    if (skipPruned) {
      stats.pruned++;
    } else {
      frontier.push(skipNode);
    }

    recordStep(
      skipPruned ? 'prune' : 'expand',
      `Branch SKIP "${item.name}" (Node ${skipNode.id})`,
      `Skipped "${item.name}". Weight unchanged: ${current.currentWeight}/${capacity}, Value: ${current.currentValue}, Upper Bound: ${skipBound.upperBound}.`,
      {
        activeNodeId: skipNode.id,
        detailedFormula: `Weight: ${current.currentWeight}/${capacity} | Value: ${current.currentValue} | Upper Bound: ${skipBound.upperBound} vs Incumbent: ${bestValue}`,
        challenge: {
          nodeId: skipNode.id,
          decision: 'skip',
          upperBound: skipBound.upperBound,
          bestValue,
          correctAction: skipPruned ? 'prune' : 'explore',
          explanation: skipPruned
            ? `Upper bound (${skipBound.upperBound}) cannot beat incumbent (${bestValue}). Safe to prune!`
            : `Upper bound (${skipBound.upperBound}) is promising (> ${bestValue}). Keep in frontier!`,
        },
      }
    );
  }

  // Finished
  recordStep(
    'finished',
    '0/1 Knapsack Branch & Bound Complete',
    `Optimal Knapsack subset proven: Total Value = ${bestValue}, containing: ${bestItems ? bestItems.map((id) => items[id].name).join(', ') : 'None'}.`,
    {
      detailedFormula: `Proven Optimal Max Profit = ${bestValue}. Nodes Generated: ${stats.generated}, Pruned: ${stats.pruned}.`,
    }
  );

  function exploreNodeAnyway(nodeId: number, currentStepIdx: number): KnapsackStepRecord[] {
    const target = allNodes.find((n) => n.id === nodeId);
    if (!target) return steps;

    target.isOverridden = true;
    target.status = 'overridden';
    stats.overridden++;

    const overrideStep: KnapsackStepRecord = {
      stepIndex: steps.length,
      type: 'overridden',
      title: `Explore Anyway on Pruned Node ${target.id}`,
      description: `Forced expansion of pruned Node ${target.id}. Notice that the upper bound (${target.upperBound}) guarantees any solution found will not exceed ${bestValue}.`,
      detailedFormula: `Pruned Upper Bound: ${target.upperBound} ≤ Best Known: ${bestValue}. Override for learning demonstration.`,
      activeNodeId: target.id,
      nodes: allNodes.map((n) => ({ ...n })),
      frontierNodeIds: frontier.map((n) => n.id),
      bestItems: bestItems ? [...bestItems] : null,
      bestValue,
      stats: { ...stats },
    };

    return [...steps.slice(0, currentStepIdx + 1), overrideStep];
  }

  return {
    steps,
    items,
    capacity,
    exploreNodeAnyway,
  };
}
