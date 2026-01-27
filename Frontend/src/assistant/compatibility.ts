import type { CultureItem } from './types';

export interface CompatibilityInfo {
  good: string[];
  bad: string[];
}

const COMPATIBILITY: Record<string, CompatibilityInfo> = {
  tomato: {
    good: ['basil', 'parsley', 'green-onion'],
    bad: ['cucumber', 'potato'],
  },
  cucumber: {
    good: ['dill', 'green-onion', 'radish'],
    bad: ['tomato', 'potato'],
  },
  'sweet-pepper': {
    good: ['basil', 'green-onion'],
    bad: ['cucumber'],
  },
  eggplant: {
    good: ['basil', 'parsley'],
    bad: ['cucumber'],
  },
  zucchini: {
    good: ['dill', 'green-onion'],
    bad: ['cucumber'],
  },
  radish: {
    good: ['cucumber', 'lettuce'],
    bad: ['hyssop'],
  },
  lettuce: {
    good: ['radish', 'cucumber'],
    bad: ['parsley'],
  },
  strawberry: {
    good: ['green-onion', 'spinach'],
    bad: ['cabbage'],
  },
  raspberry: {
    good: ['garlic', 'green-onion'],
    bad: ['strawberry'],
  },
  currant: {
    good: ['garlic', 'green-onion'],
    bad: ['gooseberry'],
  },
};

export function getCompatibility(culture: CultureItem): CompatibilityInfo | null {
  return COMPATIBILITY[culture.id] ?? null;
}
