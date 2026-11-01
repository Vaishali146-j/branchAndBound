import test from 'node:test';
import assert from 'node:assert/strict';
import { reduceMatrix, solveTspBranchAndBound, calculateActualTourCost } from './tspSolver';
import { solveTspBruteForce, compareTspSolvers } from './tspBruteForce';
import { TSP_PRESETS } from './presets';

test('TSP Matrix reduction works correctly on 4x4 matrix', () => {
  const matrix = [
    [Infinity, 10, 15, 20],
    [10, Infinity, 35, 25],
    [15, 35, Infinity, 30],
    [20, 25, 30, Infinity],
  ];

  const result = reduceMatrix(matrix);
  // Row reductions:
  // r0 min = 10 -> [inf, 0, 5, 10]
  // r1 min = 10 -> [0, inf, 25, 15]
  // r2 min = 15 -> [0, 20, inf, 15]
  // r3 min = 20 -> [0, 5, 10, inf]
  // Sum of row mins = 55
  // Columns:
  // c0 has 0s (min 0)
  // c1 has 0s (min 0)
  // c2: [5, 25, inf, 10] min = 5 -> reduced to [0, 20, inf, 5]
  // c3: [10, 15, 15, inf] min = 10 -> reduced to [0, 5, 5, inf]
  // Total reduction cost = 55 + 5 + 10 = 70 (or depending on exact row reductions)
  assert.ok(result.reductionCost > 0);
  assert.equal(result.reductionCost, 70);
});

test('TSP Branch and Bound finds optimal tour for classic 4-city', () => {
  const textbook = TSP_PRESETS[0];
  const solver = solveTspBranchAndBound(textbook.matrix, textbook.cityNames, 0);

  const lastStep = solver.steps[solver.steps.length - 1];
  assert.equal(lastStep.bestCost, 80);
  assert.ok(lastStep.bestTour !== null);
  assert.equal(lastStep.bestTour?.length, 5); // A -> ... -> A
  assert.equal(lastStep.bestTour?.[0], 0);
  assert.equal(lastStep.bestTour?.[4], 0);

  // Cross check with brute force
  const bf = solveTspBruteForce(textbook.matrix, 0);
  assert.equal(bf.bestCost, 80);
  assert.equal(lastStep.bestCost, bf.bestCost);
});

test('Actual tour cost calculation matches edge sums', () => {
  const textbook = TSP_PRESETS[0];
  // Tour: 0 -> 1 -> 3 -> 2 -> 0:
  // 0->1 = 10, 1->3 = 25, 3->2 = 30, 2->0 = 15 => 10 + 25 + 30 + 15 = 80
  const cost = calculateActualTourCost([0, 1, 3, 2], textbook.matrix);
  assert.equal(cost, 80);
});

test('Explore Anyway creates an overridden state', () => {
  const textbook = TSP_PRESETS[0];
  const solver = solveTspBranchAndBound(textbook.matrix, textbook.cityNames, 0);
  const prunedNode = solver.steps
    .flatMap((s) => s.nodes)
    .find((n) => n.status === 'pruned');

  if (prunedNode) {
    const newSteps = solver.exploreNodeAnyway(prunedNode.id, 5);
    const last = newSteps[newSteps.length - 1];
    assert.equal(last.type, 'overridden');
    assert.equal(last.activeNodeId, prunedNode.id);
  }
});

test('compareTspSolvers computes benchmark comparison without error', () => {
  const textbook = TSP_PRESETS[0];
  const solver = solveTspBranchAndBound(textbook.matrix, textbook.cityNames, 0);
  const lastStep = solver.steps[solver.steps.length - 1];
  const comparison = compareTspSolvers(
    textbook.matrix,
    lastStep.stats,
    lastStep.bestCost,
    lastStep.bestTour,
    textbook.cityNames
  );
  assert.equal(comparison.bbComparison.optimalCostOrValue, 80);
  assert.equal(comparison.bfComparison.optimalCostOrValue, 80);
  assert.ok(comparison.pruningPercentage > 0);
  assert.ok(comparison.nodesEliminated > 0);
});

