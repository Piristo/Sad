import type { CultureType } from './types';

export interface CultureDetail {
  id: string;
  title: string;
  watering: string;
  feeding: string;
  transplant: string;
  notes: string;
}

const TYPE_DEFAULTS: Record<CultureType, Omit<CultureDetail, 'id' | 'title'>> = {
  root: {
    watering: 'Полив ровный, без пересушивания, 1–2 раза в неделю.',
    feeding: 'Лёгкая подкормка раз в 2–3 недели в период роста.',
    transplant: 'Лучше прямой посев или очень аккуратная пересадка.',
    notes: 'Не переувлажняйте, чтобы не растрескивались корнеплоды.',
  },
  leaf: {
    watering: 'Регулярный полив, почва постоянно слегка влажная.',
    feeding: 'Азотные подкормки раз в 2–3 недели, без переизбытка.',
    transplant: 'Пересаживать можно, избегая оголения корней.',
    notes: 'При жаре возможна стрелкование — притеняйте.',
  },
  fruit: {
    watering: 'Умеренно, 1–2 раза в неделю, без застоя воды.',
    feeding: 'Фосфор‑калий в фазу цветения и плодоношения.',
    transplant: 'Пересадка с комом земли, без травм корней.',
    notes: 'Нужен стабильный свет и тепло, избегайте сквозняков.',
  },
  flower: {
    watering: 'Полив по мере подсыхания верхнего слоя почвы.',
    feeding: 'Комплексное удобрение раз в 2–3 недели.',
    transplant: 'Пересадка в фазе активного роста, без стресса.',
    notes: 'Удаляйте отцветшие бутоны для продления цветения.',
  },
};

export const CULTURE_DETAILS: Record<string, CultureDetail> = {
  tomato: {
    id: 'tomato',
    title: 'Томат',
    watering: '1–2 раза в неделю, тёплой водой, без переувлажнения.',
    feeding: 'Фосфор-калий каждые 2–3 недели в период цветения и завязи.',
    transplant: 'Пересадка с комом, защита от сквозняков первые 2–3 дня.',
    notes: 'Проветривание теплицы и пасынкование обязательны.',
  },
  cucumber: {
    id: 'cucumber',
    title: 'Огурец',
    watering: 'Часто, 2–3 раза в неделю, без пересушки почвы.',
    feeding: 'Чередуйте органику и минералы раз в 10–14 дней.',
    transplant: 'Перевалка без повреждения корней, затем притенение.',
    notes: 'Любит влажность воздуха, проветривайте без сквозняков.',
  },
  'sweet-pepper': {
    id: 'sweet-pepper',
    title: 'Перец болгарский',
    watering: 'Умеренный полив, 1–2 раза в неделю.',
    feeding: 'Фосфор-калий при бутонизации, азот умеренно.',
    transplant: 'Пересаживать аккуратно, корни чувствительны.',
    notes: 'Не переносит резкие перепады температуры.',
  },
  eggplant: {
    id: 'eggplant',
    title: 'Баклажан',
    watering: 'Регулярный полив тёплой водой, без переувлажнения.',
    feeding: 'Комплексное удобрение раз в 2–3 недели.',
    transplant: 'Перевалка, после — лёгкое притенение.',
    notes: 'Чувствителен к холоду, любит тепло.',
  },
  zucchini: {
    id: 'zucchini',
    title: 'Кабачок',
    watering: '1–2 раза в неделю, обильный полив.',
    feeding: 'Органика раз в 2–3 недели.',
    transplant: 'Лучше прямой посев или аккуратная пересадка.',
    notes: 'Собирайте плоды регулярно для продолжения плодоношения.',
  },
  watermelon: {
    id: 'watermelon',
    title: 'Арбуз',
    watering: 'Умеренный полив, избегать сырости у корней.',
    feeding: 'Фосфор-калий при формировании плодов.',
    transplant: 'Только при тёплой почве и устойчивых температурах.',
    notes: 'Требует много света и тепла.',
  },
  melon: {
    id: 'melon',
    title: 'Дыня',
    watering: 'Умеренно, без застойной влаги.',
    feeding: 'Комплексное удобрение раз в 2–3 недели.',
    transplant: 'Перевалка при стабильном тепле.',
    notes: 'Предпочитает сухой воздух и солнечное место.',
  },
  pumpkin: {
    id: 'pumpkin',
    title: 'Тыква',
    watering: '1 раз в неделю, обильный полив.',
    feeding: 'Органика раз в 2–3 недели.',
    transplant: 'Пересадка с комом, избегать повреждений корней.',
    notes: 'Нуждается в пространстве и тепле.',
  },
  radish: {
    id: 'radish',
    title: 'Редис',
    watering: 'Частый лёгкий полив, не допускать пересушки.',
    feeding: 'Лёгкая азотная подкормка по необходимости.',
    transplant: 'Лучше прямой посев.',
    notes: 'Быстро уходит в стрелку при жаре.',
  },
};

export const DEFAULT_CULTURE_DETAIL: CultureDetail = {
  id: 'default',
  title: 'Культура',
  watering: 'Полив 1–2 раза в неделю, ориентируйтесь на почву.',
  feeding: 'Подкормка раз в 2–3 недели в период активного роста.',
  transplant: 'Пересадка с комом земли, без стресса для корней.',
  notes: 'Учитывайте особенности сорта и микроклимат участка.',
};

export function resolveCultureDetail(
  culture: { id: string; title: string; type: CultureType },
): CultureDetail {
  const specific = CULTURE_DETAILS[culture.id];
  if (specific) {
    return { ...specific, title: culture.title };
  }

  const defaults = TYPE_DEFAULTS[culture.type] ?? DEFAULT_CULTURE_DETAIL;
  return {
    id: culture.id,
    title: culture.title,
    watering: defaults.watering,
    feeding: defaults.feeding,
    transplant: defaults.transplant,
    notes: defaults.notes,
  };
}
