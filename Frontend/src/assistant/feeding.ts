import type { CultureItem, CultureType } from './types';
import { formatDate } from './lunar';

export interface FeedingPlan {
  firstAfterDays: number;
  intervalDays: number;
  harvestStartDays: number;
  note: string;
}

const DEFAULT_PLANS: Record<CultureType, FeedingPlan> = {
  root: {
    firstAfterDays: 14,
    intervalDays: 20,
    harvestStartDays: 70,
    note: 'Для корнеплодов избегайте избытка азота.',
  },
  leaf: {
    firstAfterDays: 7,
    intervalDays: 14,
    harvestStartDays: 35,
    note: 'Листовые хорошо реагируют на мягкие азотные подкормки.',
  },
  fruit: {
    firstAfterDays: 10,
    intervalDays: 14,
    harvestStartDays: 60,
    note: 'В фазу цветения делайте упор на фосфор и калий.',
  },
  flower: {
    firstAfterDays: 14,
    intervalDays: 21,
    harvestStartDays: 70,
    note: 'Подкормки умеренные, чтобы не наращивать только зелёную массу.',
  },
};

const SPECIFIC_PLANS: Record<string, FeedingPlan> = {
  tomato: {
    firstAfterDays: 10,
    intervalDays: 14,
    harvestStartDays: 60,
    note: 'Перед цветением — фосфор/калий, азот умеренно.',
  },
  cucumber: {
    firstAfterDays: 7,
    intervalDays: 10,
    harvestStartDays: 45,
    note: 'Подкормки чаще, но меньшими дозами.',
  },
  'sweet-pepper': {
    firstAfterDays: 14,
    intervalDays: 14,
    harvestStartDays: 70,
    note: 'Следите за кальцием, не перекармливайте азотом.',
  },
  eggplant: {
    firstAfterDays: 14,
    intervalDays: 14,
    harvestStartDays: 70,
    note: 'Тёплая почва и регулярные подкормки без переувлажнения.',
  },
  zucchini: {
    firstAfterDays: 12,
    intervalDays: 14,
    harvestStartDays: 45,
    note: 'Хорошо реагирует на органику.',
  },
  watermelon: {
    firstAfterDays: 14,
    intervalDays: 14,
    harvestStartDays: 80,
    note: 'В период налива — калийные подкормки.',
  },
  melon: {
    firstAfterDays: 14,
    intervalDays: 14,
    harvestStartDays: 75,
    note: 'Подкормки умеренные, без избытка азота.',
  },
  pumpkin: {
    firstAfterDays: 14,
    intervalDays: 21,
    harvestStartDays: 90,
    note: 'Лучше органические подкормки.',
  },
  radish: {
    firstAfterDays: 10,
    intervalDays: 14,
    harvestStartDays: 25,
    note: 'Минимальные подкормки, чтобы не ушёл в стрелку.',
  },
  carrot: {
    firstAfterDays: 14,
    intervalDays: 21,
    harvestStartDays: 80,
    note: 'Без избытка азота.',
  },
  beet: {
    firstAfterDays: 14,
    intervalDays: 21,
    harvestStartDays: 90,
    note: 'Хорошо реагирует на калий.',
  },
  lettuce: {
    firstAfterDays: 7,
    intervalDays: 14,
    harvestStartDays: 30,
    note: 'Азотные подкормки в малых дозах.',
  },
  spinach: {
    firstAfterDays: 7,
    intervalDays: 14,
    harvestStartDays: 30,
    note: 'Подкормки умеренные, без переувлажнения.',
  },
  dill: {
    firstAfterDays: 10,
    intervalDays: 14,
    harvestStartDays: 35,
    note: 'Лёгкие подкормки и регулярный полив.',
  },
  parsley: {
    firstAfterDays: 14,
    intervalDays: 20,
    harvestStartDays: 70,
    note: 'Лучше совмещать с поливом.',
  },
  cilantro: {
    firstAfterDays: 10,
    intervalDays: 14,
    harvestStartDays: 35,
    note: 'Не перекармливать азотом.',
  },
  basil: {
    firstAfterDays: 10,
    intervalDays: 14,
    harvestStartDays: 45,
    note: 'Мягкие подкормки для зелёной массы.',
  },
  'green-onion': {
    firstAfterDays: 10,
    intervalDays: 14,
    harvestStartDays: 30,
    note: 'Азотные подкормки малыми дозами.',
  },
  arugula: {
    firstAfterDays: 7,
    intervalDays: 14,
    harvestStartDays: 30,
    note: 'Лёгкие подкормки, не заливать.',
  },
  strawberry: {
    firstAfterDays: 14,
    intervalDays: 21,
    harvestStartDays: 60,
    note: 'До цветения — азот, далее — фосфор/калий.',
  },
};

export interface FeedingStep {
  dayOffset: number;
  date: string;
  label: string;
}

export function getFeedingPlan(culture: CultureItem): FeedingPlan {
  return SPECIFIC_PLANS[culture.id] ?? DEFAULT_PLANS[culture.type];
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function buildFeedingSchedule(
  culture: CultureItem,
  transplantDate: Date,
): { plan: FeedingPlan; steps: FeedingStep[]; harvestDate: string } {
  const plan = getFeedingPlan(culture);
  const steps: FeedingStep[] = [];

  for (
    let offset = plan.firstAfterDays;
    offset <= plan.harvestStartDays;
    offset += plan.intervalDays
  ) {
    const date = addDays(transplantDate, offset);
    steps.push({
      dayOffset: offset,
      date: formatDate(date),
      label: `Подкормка +${offset} дней`,
    });

    if (steps.length >= 10) break;
  }

  const harvestDate = formatDate(addDays(transplantDate, plan.harvestStartDays));

  return { plan, steps, harvestDate };
}
