import type {
  CultureAssessment,
  CultureItem,
  CultureType,
  LunarContext,
  Status,
  TaskAssessment,
  TaskId,
  TaskItem,
} from './types';
import { ZODIAC_FERTILITY } from './data';
import { formatDate, getLunarContext } from './lunar';

const STATUS_LABELS: Record<Status, string> = {
  good: 'благоприятный день',
  ok: 'допустимо',
  bad: 'неблагоприятно',
};

const PHASE_LABELS: Record<LunarContext['phase'], string> = {
  new: 'новолуние',
  waxing: 'растущая Луна',
  full: 'полнолуние',
  waning: 'убывающая Луна',
};

const CULTURE_TYPE_LABELS: Record<CultureType, string> = {
  root: 'корнеплод',
  leaf: 'листовая зелень',
  fruit: 'плодовая культура',
  flower: 'цветочная',
};

const TASK_HINTS: Record<TaskId, string[]> = {
  watering: [
    'Ориентируйтесь на влажность почвы: полив 1–2 раза в неделю.',
    'Поливайте утром или вечером, избегая листьев в жару.',
  ],
  feeding: [
    'Подкормка раз в 2–3 недели, если растения в активном росте.',
    'Для зелени — азотные, для плодовых — фосфор-калийные.',
  ],
  pruning: [
    'Удаляйте сухие и повреждённые части чистым инструментом.',
    'Срезы делайте под углом, не оставляя рваных краёв.',
  ],
  transplant: [
    'Пересаживайте с комом земли, минимизируя стресс корней.',
    'После пересадки — умеренный полив и притенение на 1–2 дня.',
  ],
  weeding: [
    'Лучше пропалывать после полива или дождя: корни выходят легче.',
    'Старайтесь удалять сорняки с корнями, не повреждая культурные растения.',
  ],
  pests: [
    'Осматривайте нижнюю сторону листьев и молодые побеги.',
    'Начинайте с механического удаления и мягких средств.',
  ],
  harvest: [
    'Собирайте в сухую погоду, без росы.',
    'Для хранения выбирайте здоровые и неповреждённые плоды.',
  ],
};

const CARE_PREFERENCES: Record<TaskId, {
  prefer: LunarContext['phase'][];
  avoid: LunarContext['phase'][];
  zodiacBoost: 'fertile' | 'barren' | 'neutral';
}> = {
  watering: {
    prefer: ['waxing'],
    avoid: ['new', 'full'],
    zodiacBoost: 'fertile',
  },
  feeding: {
    prefer: ['waxing'],
    avoid: ['new', 'full'],
    zodiacBoost: 'fertile',
  },
  pruning: {
    prefer: ['waning'],
    avoid: ['new', 'full'],
    zodiacBoost: 'barren',
  },
  transplant: {
    prefer: ['waxing'],
    avoid: ['new', 'full'],
    zodiacBoost: 'fertile',
  },
  weeding: {
    prefer: ['waning'],
    avoid: ['new', 'full'],
    zodiacBoost: 'barren',
  },
  pests: {
    prefer: ['waning'],
    avoid: ['new', 'full'],
    zodiacBoost: 'barren',
  },
  harvest: {
    prefer: ['waning'],
    avoid: ['new', 'full'],
    zodiacBoost: 'barren',
  },
};

export function statusLabel(status: Status): string {
  return STATUS_LABELS[status];
}

export function phaseLabel(phase: LunarContext['phase']): string {
  return PHASE_LABELS[phase];
}

export function cultureTypeLabel(type: CultureType): string {
  return CULTURE_TYPE_LABELS[type];
}

function scoreToStatus(score: number): Status {
  if (score >= 1) return 'good';
  if (score <= -1) return 'bad';
  return 'ok';
}

function baseScoreForCulture(type: CultureType, phase: LunarContext['phase']): number {
  if (phase === 'new' || phase === 'full') {
    return -2;
  }

  switch (type) {
    case 'root':
      return phase === 'waning' ? 1 : -1;
    case 'leaf':
      return phase === 'waxing' ? 1 : -1;
    case 'fruit':
      return phase === 'waxing' ? 1 : -1;
    case 'flower':
      return phase === 'waxing' ? 1 : 0;
    default:
      return 0;
  }
}

function zodiacScore(zodiac: LunarContext['zodiac']): number {
  const fertility = ZODIAC_FERTILITY[zodiac];
  if (fertility === 'fertile') return 1;
  if (fertility === 'barren') return -1;
  return 0;
}

function datePlusDays(base: Date, offset: number): Date {
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + offset);
  return next;
}

function evaluateCulture(culture: CultureItem, context: LunarContext): Status {
  let score = baseScoreForCulture(culture.type, context.phase);
  score += zodiacScore(context.zodiac);

  if (context.isForbiddenWindow) {
    score = -2;
  }

  return scoreToStatus(score);
}

function suggestDatesForCulture(
  culture: CultureItem,
  today: Date,
): string[] {
  const goodDates: string[] = [];
  const okDates: string[] = [];

  for (let offset = 1; offset <= 30; offset += 1) {
    const date = datePlusDays(today, offset);
    const context = getLunarContext(date);
    const status = evaluateCulture(culture, context);

    if (status === 'good') {
      goodDates.push(formatDate(date));
    } else if (status === 'ok') {
      okDates.push(formatDate(date));
    }

    if (goodDates.length >= 3) break;
  }

  if (goodDates.length < 3) {
    for (let i = 0; i < okDates.length && goodDates.length < 3; i += 1) {
      goodDates.push(okDates[i]);
    }
  }

  if (goodDates.length === 0) {
    goodDates.push(formatDate(datePlusDays(today, 3)));
  }

  return goodDates.slice(0, 3);
}

export function assessCultures(
  cultures: CultureItem[],
  context: LunarContext,
  today: Date,
): CultureAssessment[] {
  return cultures.map((culture) => {
    const status = evaluateCulture(culture, context);
    const explanation = `${phaseLabel(context.phase)}, знак ${context.zodiac}, тип: ${cultureTypeLabel(culture.type)}.`;
    const suggestedDates = status === 'bad'
      ? suggestDatesForCulture(culture, today)
      : undefined;

    return {
      id: culture.id,
      title: culture.title,
      type: culture.type,
      status,
      explanation,
      suggestedDates,
    };
  });
}

function evaluateTask(task: TaskId, context: LunarContext): Status {
  const rules = CARE_PREFERENCES[task];
  let score = 0;

  if (context.isForbiddenWindow || rules.avoid.includes(context.phase)) {
    score = -2;
  } else if (rules.prefer.includes(context.phase)) {
    score += 1;
  }

  const fertility = ZODIAC_FERTILITY[context.zodiac];
  if (rules.zodiacBoost === 'fertile' && fertility === 'fertile') score += 1;
  if (rules.zodiacBoost === 'barren' && fertility === 'barren') score += 1;
  if (fertility === 'barren' && rules.zodiacBoost === 'fertile') score -= 1;

  return scoreToStatus(score);
}

function suggestDatesForTask(task: TaskId, today: Date): string[] {
  const goodDates: string[] = [];
  const okDates: string[] = [];

  for (let offset = 1; offset <= 21; offset += 1) {
    const date = datePlusDays(today, offset);
    const context = getLunarContext(date);
    const status = evaluateTask(task, context);

    if (status === 'good') {
      goodDates.push(formatDate(date));
    } else if (status === 'ok') {
      okDates.push(formatDate(date));
    }

    if (goodDates.length >= 2) break;
  }

  if (goodDates.length < 2) {
    for (let i = 0; i < okDates.length && goodDates.length < 2; i += 1) {
      goodDates.push(okDates[i]);
    }
  }

  if (goodDates.length === 0) {
    goodDates.push(formatDate(datePlusDays(today, 2)));
  }

  return goodDates.slice(0, 2);
}

export function assessTasks(
  tasks: TaskItem[] = [],
  context: LunarContext,
  today: Date,
): TaskAssessment[] {
  return tasks.map((task) => {
    const status = evaluateTask(task.id, context);
    const explanation = `${phaseLabel(context.phase)}, знак ${context.zodiac}.`;
    const suggestedDates = status === 'bad'
      ? suggestDatesForTask(task.id, today)
      : undefined;

    return {
      id: task.id,
      title: task.title,
      status,
      explanation,
      instructions: TASK_HINTS[task.id],
      suggestedDates,
    };
  });
}

export { formatDate };
