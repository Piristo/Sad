import type { CultureType } from './types';
import { formatDate } from './lunar';

export interface StageTemplate {
  id: string;
  title: string;
  startDay: number;
  endDay: number;
  tips: string;
}

const STAGES_BY_TYPE: Record<CultureType, StageTemplate[]> = {
  root: [
    { id: 'seedling', title: 'Рассада/всходы', startDay: 0, endDay: 25, tips: 'Равномерная влажность, без перелива.' },
    { id: 'transplant', title: 'Пересадка', startDay: 25, endDay: 40, tips: 'Перевалка с комом, 1–2 дня притенения.' },
    { id: 'growth', title: 'Рост корнеплода', startDay: 40, endDay: 80, tips: 'Полив стабильный, рыхление, без избытка азота.' },
    { id: 'harvest', title: 'Сбор урожая', startDay: 80, endDay: 110, tips: 'Сбор по мере готовности, без переувлажнения.' },
  ],
  leaf: [
    { id: 'seedling', title: 'Рассада/всходы', startDay: 0, endDay: 20, tips: 'Частый лёгкий полив.' },
    { id: 'growth', title: 'Наращивание зелени', startDay: 20, endDay: 45, tips: 'Азотные подкормки малыми дозами.' },
    { id: 'harvest', title: 'Срез зелени', startDay: 45, endDay: 70, tips: 'Срезайте постепенно, не допускайте стрелкования.' },
  ],
  fruit: [
    { id: 'seedling', title: 'Рассада', startDay: 0, endDay: 30, tips: 'Ровная влага и тепло.' },
    { id: 'transplant', title: 'Пересадка', startDay: 30, endDay: 45, tips: 'Беречь корни, защита от холода.' },
    { id: 'flowering', title: 'Цветение', startDay: 45, endDay: 70, tips: 'Фосфор‑калий, проветривание.' },
    { id: 'fruiting', title: 'Плодоношение', startDay: 70, endDay: 120, tips: 'Регулярный полив, калийные подкормки.' },
  ],
  flower: [
    { id: 'seedling', title: 'Рассада', startDay: 0, endDay: 25, tips: 'Умеренный полив, свет.' },
    { id: 'transplant', title: 'Пересадка', startDay: 25, endDay: 40, tips: 'Притенение на 1–2 дня.' },
    { id: 'bloom', title: 'Цветение', startDay: 40, endDay: 90, tips: 'Удаляйте отцветшие бутоны.' },
  ],
};

export interface StageScheduleItem {
  id: string;
  title: string;
  range: string;
  tips: string;
  startDate: Date;
  endDate: Date;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function buildStageSchedule(cultureType: CultureType, startDate: Date): StageScheduleItem[] {
  const stages = STAGES_BY_TYPE[cultureType] ?? STAGES_BY_TYPE.fruit;

  return stages.map((stage) => {
    const start = addDays(startDate, stage.startDay);
    const end = addDays(startDate, stage.endDay);
    return {
      id: stage.id,
      title: stage.title,
      tips: stage.tips,
      range: `${formatDate(start)} – ${formatDate(end)}`,
      startDate: start,
      endDate: end,
    };
  });
}
