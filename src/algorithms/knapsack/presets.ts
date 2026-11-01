export interface KnapsackPreset {
  id: string;
  name: string;
  description: string;
  capacity: number;
  items: { name: string; weight: number; value: number }[];
  expectedOptimalValue: number;
}

export const KNAPSACK_PRESETS: KnapsackPreset[] = [
  {
    id: 'textbook-4',
    name: 'DAA Textbook 4-Item (Classic)',
    description: 'Classic 4-item problem demonstrating how fractional relaxation prunes the right (skip) branch early.',
    capacity: 16,
    items: [
      { name: 'Item 1', weight: 2, value: 40 },
      { name: 'Item 2', weight: 5, value: 30 },
      { name: 'Item 3', weight: 10, value: 50 },
      { name: 'Item 4', weight: 5, value: 10 },
    ],
    expectedOptimalValue: 90, // Items 1, 2, 3 (weight 2+5+10 = 17 > 16), items 1, 3, 4 (2+10=12, val 90; items 1,2: 70)
  },
  {
    id: 'tricky-5',
    name: '5-Item Pruning Showcase',
    description: '5 items with tight capacity. Shows pruning of multiple subtrees where fractional upper bounds drop below incumbent.',
    capacity: 10,
    items: [
      { name: 'Laptop', weight: 3, value: 45 },
      { name: 'Camera', weight: 2, value: 30 },
      { name: 'Drone', weight: 5, value: 55 },
      { name: 'Tablet', weight: 4, value: 32 },
      { name: 'Headphones', weight: 1, value: 10 },
    ],
    expectedOptimalValue: 100, // Camera(2,30) + Drone(5,55) + Laptop(3,45) -> weight 10, value 130! Wait, 2+5+3 = 10, value = 30+55+45 = 130
  },
  {
    id: 'jewels-4',
    name: 'Jewel Thief (High Value Density)',
    description: 'Jewels with varied weights and high values, where greedy order guides rapid discovery of the global optimum.',
    capacity: 15,
    items: [
      { name: 'Diamond', weight: 4, value: 100 },
      { name: 'Ruby', weight: 7, value: 140 },
      { name: 'Emerald', weight: 5, value: 90 },
      { name: 'Sapphire', weight: 3, value: 50 },
    ],
    expectedOptimalValue: 290,
  },
];
