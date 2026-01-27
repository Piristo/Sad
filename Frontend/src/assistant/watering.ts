import type { CultureType } from './types';

export interface WateringStage {
  stage: string;
  frequency: string;
  notes: string;
}

const WATERING_BY_TYPE: Record<CultureType, WateringStage[]> = {
  root: [
    { stage: 'Рассада/всходы', frequency: '2–3 раза в неделю', notes: 'Почва слегка влажная.' },
    { stage: 'Рост корнеплода', frequency: '1–2 раза в неделю', notes: 'Не заливать, рыхлить.' },
    { stage: 'Сбор', frequency: 'По необходимости', notes: 'Избегать переувлажнения.' },
  ],
  leaf: [
    { stage: 'Вегетация', frequency: '2–3 раза в неделю', notes: 'Часто, но малыми объёмами.' },
    { stage: 'Срез зелени', frequency: '1–2 раза в неделю', notes: 'Поддерживать влажность.' },
  ],
  fruit: [
    { stage: 'Рассада', frequency: '2–3 раза в неделю', notes: 'Без перелива.' },
    { stage: 'Цветение', frequency: '2 раза в неделю', notes: 'Полив утром/вечером.' },
    { stage: 'Плодоношение', frequency: '2–3 раза в неделю', notes: 'Увеличить объём воды.' },
  ],
  flower: [
    { stage: 'Рост', frequency: '1–2 раза в неделю', notes: 'Не допускать пересушки.' },
    { stage: 'Цветение', frequency: '1–2 раза в неделю', notes: 'Полив под корень.' },
  ],
};

export function getWateringSchedule(type: CultureType): WateringStage[] {
  return WATERING_BY_TYPE[type] ?? WATERING_BY_TYPE.fruit;
}
