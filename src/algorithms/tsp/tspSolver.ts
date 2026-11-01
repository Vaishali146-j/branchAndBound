import { INF, MatrixReductionResult, ReductionOperation, TspStepRecord, TspTreeNode } from '../types';

export function cloneMatrix(matrix: number[][]): number[][] {
  return matrix.map((row) => [...row]);
}

/**
 * Reduce a cost matrix according to standard Branch & Bound DAA textbook algorithm:
 * 1. For each row, find the minimum finite value and subtract it from all elements in the row.
 * 2. For each column, find the minimum finite value and subtract it from all elements in the column.
 * Returns the reduced matrix, total reduction sum, and list of operations.
 */
export function reduceMatrix(matrix: number[][]): MatrixReductionResult {
  const n = matrix.length;
  const reduced = cloneMatrix(matrix);
  let reductionCost = 0;
  const operations: ReductionOperation[] = [];

  // Row reduction
  for (let i = 0; i < n; i++) {
    const finite = reduced[i].filter((val) => Number.isFinite(val) && val >= 0);
    if (finite.length === 0) continue;

    const min = Math.min(...finite);
    if (min > 0 && Number.isFinite(min)) {
      for (let j = 0; j < n; j++) {
        if (Number.isFinite(reduced[i][j])) {
          reduced[i][j] -= min;
        }
      }
      reductionCost += min;
      operations.push({ type: 'row', index: i, minimum: min });
    }
  }

  // Column reduction
  for (let j = 0; j < n; j++) {
    const colValues: number[] = [];
    for (let i = 0; i < n; i++) {
      if (Number.isFinite(reduced[i][j]) && reduced[i][j] >= 0) {
        colValues.push(reduced[i][j]);
      }
    }
    if (colValues.length === 0) continue;

    const min = Math.min(...colValues);
    if (min > 0 && Number.isFinite(min)) {
      for (let i = 0; i < n; i++) {
        if (Number.isFinite(reduced[i][j])) {
          reduced[i][j] -= min;
        }
      }
      reductionCost += min;
      operations.push({ type: 'column', index: j, minimum: min });
    }
  }

  return { matrix: reduced, reductionCost, operations };
}

/**
 * Calculate the true total distance of a full tour:
 * start -> city1 -> ... -> city(n-1) -> start
 */
export function calculateActualTourCost(path: number[], originalDistance: number[][]): number {
  if (path.length === 0) return INF;
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const d = originalDistance[path[i]][path[i + 1]];
    if (!Number.isFinite(d)) return INF;
    total += d;
  }
  // Return edge
  const returnEdge = originalDistance[path[path.length - 1]][path[0]];
  if (!Number.isFinite(returnEdge)) return INF;
  return total + returnEdge;
}

export interface TspSolverInstance {
  steps: TspStepRecord[];
  cityNames: string[];
  originalDistance: number[][];
  exploreNodeAnyway: (nodeId: number, currentStepIndex: number) => TspStepRecord[];
}

export function solveTspBranchAndBound(
  originalDistance: number[][],
  cityNames: string[] = ['A', 'B', 'C', 'D'],
  startCity: number = 0
): TspSolverInstance {
  const n = originalDistance.length;
  const steps: TspStepRecord[] = [];

  // Deep clone initial matrix and disallow self-loops
  const initMatrix = cloneMatrix(originalDistance);
  for (let i = 0; i < n; i++) {
    initMatrix[i][i] = INF;
  }

  // Step 1: Initial Root Reduction
  const rootReduction = reduceMatrix(initMatrix);

  let nextNodeId = 0;
  const rootNode: TspTreeNode = {
    id: nextNodeId++,
    parentId: null,
    city: startCity,
    path: [startCity],
    visited: [startCity],
    matrix: rootReduction.matrix,
    bound: rootReduction.reductionCost,
    edgeCostFromParent: 0,
    additionalReductionCost: rootReduction.reductionCost,
    status: 'root',
    reason: `Root lower bound computed via initial matrix reduction. Sum of row reductions + col reductions = ${rootReduction.reductionCost}.`,
    depth: 0,
    reductionOps: rootReduction.operations,
  };

  const allNodes: TspTreeNode[] = [rootNode];
  let frontier: TspTreeNode[] = [rootNode];
  let bestTour: number[] | null = null;
  let bestCost: number = INF;

  const stats = {
    generated: 1,
    expanded: 0,
    pruned: 0,
    completeTours: 0,
    overridden: 0,
  };

  // Helper to snapshot current state into a Step Record
  function recordStep(
    type: TspStepRecord['type'],
    title: string,
    description: string,
    extra: Partial<TspStepRecord> = {}
  ) {
    steps.push({
      stepIndex: steps.length,
      type,
      title,
      description,
      nodes: allNodes.map((node) => ({
        ...node,
        path: [...node.path],
        visited: [...node.visited],
        matrix: cloneMatrix(node.matrix),
      })),
      frontierNodeIds: frontier.map((n) => n.id),
      bestTour: bestTour ? [...bestTour] : null,
      bestCost,
      currentMatrix: extra.currentMatrix ? cloneMatrix(extra.currentMatrix) : undefined,
      reductionOps: extra.reductionOps ? [...extra.reductionOps] : undefined,
      stats: { ...stats },
      ...extra,
    });
  }

  // Record initial step
  const rowOps = rootReduction.operations.filter((op) => op.type === 'row');
  const colOps = rootReduction.operations.filter((op) => op.type === 'column');
  const rowFormula = rowOps.map((op) => `r${cityNames[op.index]}=${op.minimum}`).join(' + ') || '0';
  const colFormula = colOps.map((op) => `c${cityNames[op.index]}=${op.minimum}`).join(' + ') || '0';

  recordStep(
    'init',
    'Root Matrix Reduction',
    `Initialize TSP from starting city ${cityNames[startCity]}. Reduce all rows and columns to establish the base Lower Bound = ${rootReduction.reductionCost}.`,
    {
      activeNodeId: rootNode.id,
      currentMatrix: rootReduction.matrix,
      reductionOps: rootReduction.operations,
      detailedFormula: `Row Minima (${rowFormula}) + Col Minima (${colFormula}) = ${rootReduction.reductionCost}`,
    }
  );

  // Main Branch and Bound loop (Best-First Search / LCBB - Least Cost Branch and Bound)
  while (frontier.length > 0) {
    // Sort frontier by lower bound ascending; break ties by node ID
    frontier.sort((a, b) => a.bound - b.bound || a.id - b.id);
    const current = frontier.shift()!;

    // Check if the best node in the frontier is already worse than or equal to incumbent
    if (current.bound >= bestCost) {
      current.status = 'pruned';
      current.reason = `Lower bound (${current.bound}) ≥ best complete tour cost (${bestCost}). No descendant can yield a better tour.`;
      stats.pruned++;

      recordStep(
        'prune',
        `Prune Node ${current.id} (${current.path.map((c) => cityNames[c]).join('→')})`,
        `Node ${current.id} with bound ${current.bound} is pruned because the best-known complete tour costs ${bestCost}. By the Branch & Bound theorem, all possible completions cost at least ${current.bound}.`,
        {
          activeNodeId: current.id,
          detailedFormula: `Lower Bound (${current.bound}) ≥ Best Known Solution (${bestCost}) → PRUNE`,
        }
      );
      continue;
    }

    // Expand current node
    current.status = 'expanded';
    stats.expanded++;

    const lastCity = current.city;
    const remainingCities: number[] = [];
    for (let c = 0; c < n; c++) {
      if (!current.visited.includes(c)) {
        remainingCities.push(c);
      }
    }

    recordStep(
      'select',
      `Select Node ${current.id} to Expand`,
      `Selected Node ${current.id} (${current.path.map((c) => cityNames[c]).join('→')}) because it has the minimum lower bound (${current.bound}) among all active frontier nodes (Least-Cost strategy).`,
      {
        activeNodeId: current.id,
        currentMatrix: current.matrix,
        detailedFormula: `Frontier Bounds: [${[current, ...frontier].map((node) => `#${node.id}: ${node.bound}`).join(', ')}]. Minimum is Node ${current.id} (${current.bound}).`,
      }
    );

    // Generate children for each unvisited city
    for (const nextCity of remainingCities) {
      const reducedEdgeCost = current.matrix[lastCity][nextCity];
      const newPath = [...current.path, nextCity];
      const newVisited = [...current.visited, nextCity];

      // If the edge was infinity in the parent's reduced matrix, this path is infeasible
      if (!Number.isFinite(reducedEdgeCost)) {
        continue;
      }

      // Check if this child completes the tour (i.e. all n cities visited)
      if (newPath.length === n) {
        const fullCost = calculateActualTourCost(newPath, originalDistance);
        const isBetter = fullCost < bestCost;

        const childNode: TspTreeNode = {
          id: nextNodeId++,
          parentId: current.id,
          city: nextCity,
          path: newPath,
          visited: newVisited,
          matrix: cloneMatrix(current.matrix),
          bound: fullCost,
          edgeCostFromParent: reducedEdgeCost,
          additionalReductionCost: 0,
          status: Number.isFinite(fullCost) ? 'complete' : 'pruned',
          reason: Number.isFinite(fullCost)
            ? isBetter
              ? `Complete tour found! Real cost ${fullCost} improves upon previous best (${bestCost === INF ? '∞' : bestCost}). Set as new incumbent solution.`
              : `Complete tour found with cost ${fullCost}, but incumbent (${bestCost}) is better.`
            : `Cannot return from city ${cityNames[nextCity]} to start ${cityNames[startCity]} (infinite cost).`,
          depth: current.depth + 1,
        };

        stats.generated++;
        allNodes.push(childNode);

        if (Number.isFinite(fullCost)) {
          stats.completeTours++;
          if (isBetter) {
            bestCost = fullCost;
            bestTour = [...newPath, startCity];
          }

          recordStep(
            'solution',
            `Complete Tour Found at Node ${childNode.id}`,
            `Tour: ${newPath.map((c) => cityNames[c]).join(' → ')} → ${cityNames[startCity]} has total cost ${fullCost}. ${isBetter ? '★ NEW BEST INCUMBENT TOUR!' : 'Incumbent remains superior.'}`,
            {
              activeNodeId: childNode.id,
              detailedFormula: `Tour Cost = ${newPath.map((c, i) => `${cityNames[c]}→${cityNames[newPath[(i + 1) % n]]} (${originalDistance[c][newPath[(i + 1) % n]]})`).join(' + ')} = ${fullCost}`,
            }
          );
        } else {
          stats.pruned++;
        }
        continue;
      }

      // Build child constrained matrix
      const childMatrix = cloneMatrix(current.matrix);

      // 1. Forbid all outgoing edges from lastCity (row lastCity = INF)
      for (let j = 0; j < n; j++) {
        childMatrix[lastCity][j] = INF;
      }
      // 2. Forbid all incoming edges to nextCity (col nextCity = INF)
      for (let i = 0; i < n; i++) {
        childMatrix[i][nextCity] = INF;
      }
      // 3. Forbid premature subtour: prevent nextCity -> startCity before visiting all cities
      childMatrix[nextCity][startCity] = INF;

      // 4. Reduce child's constrained matrix
      const childReduction = reduceMatrix(childMatrix);

      // Child Bound Formula: Parent Bound + Reduced Edge Cost + Child Reduction Cost
      const childBound = current.bound + reducedEdgeCost + childReduction.reductionCost;

      const isPruned = childBound >= bestCost;

      const childNode: TspTreeNode = {
        id: nextNodeId++,
        parentId: current.id,
        city: nextCity,
        path: newPath,
        visited: newVisited,
        matrix: childReduction.matrix,
        bound: childBound,
        edgeCostFromParent: reducedEdgeCost,
        additionalReductionCost: childReduction.reductionCost,
        status: isPruned ? 'pruned' : 'frontier',
        reason: isPruned
          ? `Pruned: Child Lower Bound (${childBound}) ≥ Best Known Tour Cost (${bestCost}). This branch cannot contain an optimal tour.`
          : `Valid branch: Lower Bound (${childBound}) < Best Known Tour Cost (${bestCost === INF ? '∞' : bestCost}). Placed in frontier.`,
        depth: current.depth + 1,
        reductionOps: childReduction.operations,
      };

      stats.generated++;
      allNodes.push(childNode);

      const formulaText = `Child Bound = Parent (${current.bound}) + Edge ${cityNames[lastCity]}→${cityNames[nextCity]} (${reducedEdgeCost}) + Matrix Reduction (${childReduction.reductionCost}) = ${childBound}`;

      if (isPruned) {
        stats.pruned++;
        recordStep(
          'prune',
          `Branch Pruned: City ${cityNames[lastCity]} → ${cityNames[nextCity]} (Node ${childNode.id})`,
          `Branch to ${cityNames[nextCity]} yielded lower bound ${childBound}. Since ${childBound} ≥ current best (${bestCost}), we prune this entire subtree without exploring its descendants!`,
          {
            activeNodeId: childNode.id,
            currentMatrix: childReduction.matrix,
            reductionOps: childReduction.operations,
            detailedFormula: `${formulaText} → [${childBound} ≥ ${bestCost}] → PRUNED`,
            challenge: {
              nodeId: childNode.id,
              city: nextCity,
              path: newPath,
              lowerBound: childBound,
              bestCost,
              correctAction: 'prune',
              explanation: `Lower bound ${childBound} meets or exceeds best-known tour cost ${bestCost}. Safe to prune!`,
            },
          }
        );
      } else {
        frontier.push(childNode);
        recordStep(
          'expand',
          `Branch Generated: City ${cityNames[lastCity]} → ${cityNames[nextCity]} (Node ${childNode.id})`,
          `Added Node ${childNode.id} (${newPath.map((c) => cityNames[c]).join('→')}) to frontier with Lower Bound = ${childBound}.`,
          {
            activeNodeId: childNode.id,
            currentMatrix: childReduction.matrix,
            reductionOps: childReduction.operations,
            detailedFormula: `${formulaText} → [${childBound} < ${bestCost === INF ? '∞' : bestCost}] → KEEP IN FRONTIER`,
            challenge: {
              nodeId: childNode.id,
              city: nextCity,
              path: newPath,
              lowerBound: childBound,
              bestCost,
              correctAction: 'explore',
              explanation: `Lower bound ${childBound} is less than best tour cost (${bestCost === INF ? '∞' : bestCost}). Must be kept for further expansion.`,
            },
          }
        );
      }
    }
  }

  // Algorithm Finished
  recordStep(
    'finished',
    'Branch & Bound Search Complete',
    bestTour
      ? `Optimal Hamiltonian Tour verified: ${bestTour.map((c) => cityNames[c]).join(' → ')} with minimum cost ${bestCost}. All non-optimal paths were mathematically proven unviable and pruned.`
      : 'Search complete: No valid Hamiltonian tour exists for this graph configuration.',
    {
      detailedFormula: bestTour
        ? `Proven Optimal Cost = ${bestCost}. Total nodes generated: ${stats.generated}, Expanded: ${stats.expanded}, Pruned: ${stats.pruned}.`
        : 'Infeasible graph.',
    }
  );

  /**
   * "Explore Anyway" pedagogical feature:
   * Expands an already pruned node to demonstrate the redundant subtree and prove
   * that any leaf reached will have cost >= bestCost.
   */
  function exploreNodeAnyway(nodeId: number, currentStepIdx: number): TspStepRecord[] {
    const target = allNodes.find((n) => n.id === nodeId);
    if (!target) return steps;

    target.isOverridden = true;
    target.status = 'overridden';
    stats.overridden++;

    const overrideStep: TspStepRecord = {
      stepIndex: steps.length,
      type: 'overridden',
      title: `Pedagogical "Explore Anyway" on Node ${target.id}`,
      description: `User forced expansion of pruned Node ${target.id} (${target.path.map((c) => cityNames[c]).join('→')}). Watch how any complete tour in this subtree confirms the lower bound theorem by costing ≥ ${bestCost}.`,
      detailedFormula: `Original Pruned Bound: ${target.bound} ≥ Best Known Tour: ${bestCost}. Overriding pruning for educational demonstration.`,
      activeNodeId: target.id,
      nodes: allNodes.map((n) => ({ ...n })),
      frontierNodeIds: frontier.map((n) => n.id),
      bestTour: bestTour ? [...bestTour] : null,
      bestCost,
      currentMatrix: target.matrix,
      stats: { ...stats },
    };

    return [...steps.slice(0, currentStepIdx + 1), overrideStep];
  }

  return {
    steps,
    cityNames,
    originalDistance,
    exploreNodeAnyway,
  };
}
