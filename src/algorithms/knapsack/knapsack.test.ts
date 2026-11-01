import test from 'node:test';
import assert from 'node:assert/strict';
import { solveKnapsackBranchAndBound, calculateUpperBound } from './knapsackSolver';
import { solveKnapsackBruteForce, compareKnapsackSolvers } from './knapsackBruteForce';
import { KNAPSACK_PRESETS } from './presets';

test('Knapsack Upper Bound calculation accounts for fractional relaxation', () => {
  const items = [
    { id: 0, name: 'Item 1', weight: 2, value: 40, ratio: 20 },
    { id: 1, name: 'Item 2', weight: 5, value: 30, ratio: 6 },
    { id: 2, name: 'Item 3', weight: 10, value: 50, ratio: 5 },
  ];
  const capacity = 10;
  // Takes item 0 (w=2, val=40, rem=8), item 1 (w=5, val=30, rem=3), fraction 3/10 of item 2 (val 15)
  // Total upper bound = 40 + 30 + 15 = 85
  const bound = calculateUpperBound(items, capacity, 0, 0, 0);
  assert.equal(bound.upperBound, 85);
});

test('Knapsack Branch & Bound matches Brute Force on 4-item classic instance', () => {
  const preset = KNAPSACK_PRESETS[0];
  const solver = solveKnapsackBranchAndBound(preset.items, preset.capacity);
  const bf = solveKnapsackBruteForce(solver.items, preset.capacity);

  const lastStep = solver.steps[solver.steps.length - 1];
  assert.equal(lastStep.bestValue, bf.bestValue);
  assert.ok(lastStep.bestValue > 0);

  const comparison = compareKnapsackSolvers(
    solver.items,
    preset.capacity,
    lastStep.stats,
    lastStep.bestValue,
    lastStep.bestItems
  );
  assert.equal(comparison.bbComparison.optimalCostOrValue, bf.bestValue);
  assert.ok(comparison.pruningPercentage > 0);
});
