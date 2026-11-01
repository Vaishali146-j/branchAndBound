export interface TspPreset {
  id: string;
  name: string;
  description: string;
  cityNames: string[];
  cityPositions: { x: number; y: number }[];
  matrix: number[][];
  expectedCost?: number;
}

export const TSP_PRESETS: TspPreset[] = [
  {
    id: 'textbook-4',
    name: 'Textbook 4-City Symmetric (Classic)',
    description: 'The standard 4-city DAA textbook example. Optimal tour has cost 80 (A → B → D → C → A).',
    cityNames: ['A', 'B', 'C', 'D'],
    cityPositions: [
      { x: 120, y: 70 },
      { x: 280, y: 70 },
      { x: 90, y: 220 },
      { x: 310, y: 220 },
    ],
    matrix: [
      [0, 10, 15, 20],
      [10, 0, 35, 25],
      [15, 35, 0, 30],
      [20, 25, 30, 0],
    ],
    expectedCost: 80,
  },
  {
    id: 'asymmetric-4',
    name: 'Asymmetric 4-City (Directed)',
    description: 'Distances differ based on travel direction (e.g., flight headwinds or one-way roads). Demonstrates row & col reduction asymmetry.',
    cityNames: ['A', 'B', 'C', 'D'],
    cityPositions: [
      { x: 200, y: 50 },
      { x: 320, y: 150 },
      { x: 200, y: 240 },
      { x: 80, y: 150 },
    ],
    matrix: [
      [0, 4, 12, 7],
      [5, 0, 6, 18],
      [11, 8, 0, 6],
      [10, 14, 9, 0],
    ],
    expectedCost: 25,
  },
  {
    id: 'benchmark-5',
    name: '5-City Challenge (High Pruning)',
    description: '5 cities with 24 brute-force permutations. Shows how Branch & Bound cuts out large sections of search space.',
    cityNames: ['A', 'B', 'C', 'D', 'E'],
    cityPositions: [
      { x: 200, y: 40 },
      { x: 320, y: 110 },
      { x: 280, y: 230 },
      { x: 120, y: 230 },
      { x: 80, y: 110 },
    ],
    matrix: [
      [0, 20, 30, 10, 11],
      [15, 0, 16, 4, 2],
      [3, 5, 0, 2, 4],
      [19, 6, 18, 0, 3],
      [16, 4, 7, 16, 0],
    ],
    expectedCost: 28,
  },
  {
    id: 'triangular-4',
    name: 'Planar Geometric 4-City',
    description: 'Clean planar graph where distances strictly satisfy Euclidean geometry.',
    cityNames: ['North', 'East', 'South', 'West'],
    cityPositions: [
      { x: 200, y: 50 },
      { x: 320, y: 150 },
      { x: 200, y: 250 },
      { x: 80, y: 150 },
    ],
    matrix: [
      [0, 14, 20, 14],
      [14, 0, 14, 20],
      [20, 14, 0, 14],
      [14, 20, 14, 0],
    ],
    expectedCost: 56,
  },
];
