import type { FC, ChangeEvent } from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { Button, Card, Input, Section, Select } from '@/components/ui';
import { WeatherWidget } from '@/components/WeatherWidget';
import {
  CULTURE_GROUPS,
  DEFAULT_REGION,
  DEFAULT_TIMEZONE,
  TASKS,
  ZODIAC_SIGNS,
} from '@/assistant/data';
import { resolveCultureDetail } from '@/assistant/cultureDetails';
import {
  assessCultures,
  assessTasks,
  cultureTypeLabel,
  formatDate,
  phaseLabel,
  statusLabel,
} from '@/assistant/logic';
import { getLunarContext, getZonedParts, zonedPartsToDate } from '@/assistant/lunar';
import { buildFeedingSchedule } from '@/assistant/feeding';
import { buildStageSchedule } from '@/assistant/stages';
import { getWateringSchedule } from '@/assistant/watering';
import { getCompatibility } from '@/assistant/compatibility';
import type {
  CultureGroupId,
  CultureItem,
  CultureType,
  LunarContext,
  TaskId,
} from '@/assistant/types';

import './IndexPage.css';

const PLOT_TYPES = [
  { id: 'garden', title: 'Огород' },
  { id: 'greenhouse', title: 'Теплица' },
  { id: 'indoor', title: 'Комнатные растения' },
] as const;

const PHASES: { id: LunarContext['phase']; title: string }[] = [
  { id: 'new', title: 'Новолуние' },
  { id: 'waxing', title: 'Растущая' },
  { id: 'full', title: 'Полнолуние' },
  { id: 'waning', title: 'Убывающая' },
];

const CULTURE_TYPES: { id: CultureType; title: string }[] = [
  { id: 'root', title: 'Корнеплод' },
  { id: 'leaf', title: 'Листовая зелень' },
  { id: 'fruit', title: 'Плодовая культура' },
  { id: 'flower', title: 'Цветочная' },
];

const GROUP_LABELS: Record<CultureGroupId, string> = {
  vegetables: 'Овощи',
  berries: 'Фрукты и ягоды',
  greens: 'Зелень',
  flowers: 'Цветы',
};

const DISCLAIMER =
  'Рекомендации основаны на традициях лунного календаря и дополняют агротехнику, климат и особенности вашего участка.';

const ORCHARD_TREES: CultureItem[] = [
  { id: 'apple-tree', title: 'Яблоня', type: 'fruit', group: 'berries' },
  { id: 'pear-tree', title: 'Груша', type: 'fruit', group: 'berries' },
  { id: 'plum-tree', title: 'Слива', type: 'fruit', group: 'berries' },
  { id: 'cherry-tree', title: 'Вишня', type: 'fruit', group: 'berries' },
  { id: 'apricot-tree', title: 'Абрикос', type: 'fruit', group: 'berries' },
  { id: 'raspberry', title: 'Малина', type: 'fruit', group: 'berries' },
  { id: 'currant', title: 'Смородина', type: 'fruit', group: 'berries' },
];

interface OrchardScheduleItem {
  period: string;
  feeding: string;
  pests: string;
}

const ORCHARD_DETAILS: Record<string, { pruning: string; pests: string; feeding: string; notes: string }> = {
  raspberry: {
    pruning: 'Весной удалите слабые и подмерзшие побеги, оставьте 6–8 сильных на куст.',
    pests: 'Следите за малиновой мухой и тлёй, обрабатывайте точечно при необходимости.',
    feeding: 'Весной — азот, в июне — фосфор/калий, после сбора — фосфор/калий.',
    notes: 'Не загущайте посадки, это снижает риск болезней.',
  },
  currant: {
    pruning: 'Ежегодно удаляйте старые ветки старше 4–5 лет и загущающие побеги.',
    pests: 'Контроль клеща и тли, особенно в мае–июне.',
    feeding: 'Весной — азот, после цветения — комплекс, осенью — фосфор/калий.',
    notes: 'Полив обязателен в период наливания ягод.',
  },
  'apple-tree': {
    pruning: 'Формирующая обрезка ранней весной до распускания почек.',
    pests: 'Контроль плодожорки и тли, ловчие пояса в мае–июне.',
    feeding: 'Весной — азот, летом — фосфор/калий, осенью — фосфор/калий.',
    notes: 'Проветривайте крону, удаляя загущающие ветки.',
  },
  'pear-tree': {
    pruning: 'Санитарная и формирующая обрезка ранней весной.',
    pests: 'Контроль тли и листогрызущих, обработка по необходимости.',
    feeding: 'Весной — азот, летом — калий, осенью — фосфор/калий.',
    notes: 'Груша чувствительна к загущению кроны.',
  },
  'plum-tree': {
    pruning: 'Санитарная обрезка ранней весной, прореживание летом.',
    pests: 'Контроль тли и плодожорки, осмотры каждые 7–10 дней.',
    feeding: 'Весной — азот, летом — калийные подкормки.',
    notes: 'Слива любит умеренную влажность почвы.',
  },
  'cherry-tree': {
    pruning: 'Удаляйте загущающие ветви, особенно в центре кроны.',
    pests: 'Контроль тли и коккомикоза, особенно при влажной погоде.',
    feeding: 'Весной — азот, после цветения — комплекс NPK.',
    notes: 'Вишня лучше плодоносит при хорошем освещении.',
  },
  'apricot-tree': {
    pruning: 'Формирующая обрезка до распускания почек.',
    pests: 'Контроль тли и монилиоза, избегайте переувлажнения.',
    feeding: 'Весной — азот, летом — калий, осенью — фосфор/калий.',
    notes: 'Абрикос чувствителен к возвратным заморозкам.',
  },
};

const ORCHARD_SCHEDULE_BASE = {
  pome: [
    {
      period: 'Апрель (1–2 неделя)',
      feeding: 'Азотная подкормка после схода снега и прогрева почвы.',
      pests: 'Санитарная обработка до распускания почек, очистка коры.',
    },
    {
      period: 'Апрель (3–4 неделя)',
      feeding: 'Поддерживающая органика или комплекс NPK.',
      pests: 'Контроль вредителей, обработка при необходимости.',
    },
    {
      period: 'Май (1–2 неделя)',
      feeding: 'После цветения — комплекс NPK, азот умеренно.',
      pests: 'Защита от тли и листогрызущих, ловчие пояса.',
    },
    {
      period: 'Июнь (1–2 неделя)',
      feeding: 'Фосфор + калий для завязей.',
      pests: 'Осмотр кроны 1–2 раза в неделю.',
    },
    {
      period: 'Июль (1–2 неделя)',
      feeding: 'Калийные подкормки, азот минимально.',
      pests: 'При жаре — мягкие обработки, проветривание кроны.',
    },
    {
      period: 'Август (1–2 неделя)',
      feeding: 'Калий + микроэлементы для созревания.',
      pests: 'Избегать жёсткой химии, только щадящие меры.',
    },
    {
      period: 'Сентябрь (1–2 неделя)',
      feeding: 'После сбора урожая — фосфор‑калий.',
      pests: 'Сбор падалицы, санитарная обрезка.',
    },
    {
      period: 'Октябрь (1–2 неделя)',
      feeding: 'Органика + мульча, влагозарядковый полив при сухой осени.',
      pests: 'Очистка приствольных кругов, беление штамбов.',
    },
  ],
  stone: [
    {
      period: 'Апрель (1–2 неделя)',
      feeding: 'Азотная подкормка после прогрева почвы.',
      pests: 'Обработка до распускания почек, санитарная чистка.',
    },
    {
      period: 'Май (1–2 неделя)',
      feeding: 'После цветения — комплекс NPK.',
      pests: 'Контроль тли и монилиоза, при необходимости обработка.',
    },
    {
      period: 'Июнь (1–2 неделя)',
      feeding: 'Фосфор‑калий для формирования плодов.',
      pests: 'Регулярные осмотры, точечные меры.',
    },
    {
      period: 'Июль (1–2 неделя)',
      feeding: 'Калийные подкормки, азот минимально.',
      pests: 'Профилактика при влажной погоде.',
    },
    {
      period: 'Август (1–2 неделя)',
      feeding: 'Подготовка к созреванию: калий + микроэлементы.',
      pests: 'Щадящие обработки, если есть признаки.',
    },
    {
      period: 'Сентябрь (1–2 неделя)',
      feeding: 'После сбора — фосфор‑калий.',
      pests: 'Санитарная обрезка и уборка листвы.',
    },
    {
      period: 'Октябрь (1–2 неделя)',
      feeding: 'Органика + мульча.',
      pests: 'Подготовка к зимовке, очистка приствольных кругов.',
    },
  ],
  berry: [
    {
      period: 'Апрель (1–2 неделя)',
      feeding: 'Азотная подкормка по талой/прогретой почве.',
      pests: 'Санитарная обрезка, уборка старых побегов.',
    },
    {
      period: 'Май (1–2 неделя)',
      feeding: 'Комплекс NPK после начала роста.',
      pests: 'Контроль тли и клещей, точечные обработки.',
    },
    {
      period: 'Июнь (1–2 неделя)',
      feeding: 'Фосфор‑калий при завязи.',
      pests: 'Осмотр 1–2 раза в неделю.',
    },
    {
      period: 'Июль (1–2 неделя)',
      feeding: 'Калийные подкормки для плодоношения.',
      pests: 'Щадящие средства при необходимости.',
    },
    {
      period: 'Август (1–2 неделя)',
      feeding: 'Калий + микроэлементы, азот исключить.',
      pests: 'Сбор падалицы и больных листьев.',
    },
    {
      period: 'Сентябрь (1–2 неделя)',
      feeding: 'Фосфор‑калий после сбора.',
      pests: 'Санитарная обрезка, уборка.',
    },
    {
      period: 'Октябрь (1–2 неделя)',
      feeding: 'Органика + мульча.',
      pests: 'Подготовка к зиме, очистка приствольных кругов.',
    },
  ],
};

const ORCHARD_SCHEDULES: Record<string, OrchardScheduleItem[]> = {
  'apple-tree': ORCHARD_SCHEDULE_BASE.pome,
  'pear-tree': ORCHARD_SCHEDULE_BASE.pome,
  'plum-tree': ORCHARD_SCHEDULE_BASE.stone,
  'cherry-tree': ORCHARD_SCHEDULE_BASE.stone,
  'apricot-tree': ORCHARD_SCHEDULE_BASE.stone,
  raspberry: ORCHARD_SCHEDULE_BASE.berry,
  currant: ORCHARD_SCHEDULE_BASE.berry,
};

const CULTURE_NAME_OVERRIDES: Record<string, string> = {
  potato: 'Картофель',
  cabbage: 'Капуста',
  garlic: 'Чеснок',
  gooseberry: 'Крыжовник',
  hyssop: 'Иссоп',
};

type PlotType = (typeof PLOT_TYPES)[number]['id'];

interface PlotProfile {
  id: string;
  name: string;
  region: string;
  type: PlotType;
}

const PLOTS_STORAGE_KEY = 'garden-plots';
const PLOT_CULTURES_KEY = 'garden-plot-cultures';
const REMINDERS_STORAGE_KEY = 'garden-reminders';

const DEFAULT_PLOTS: PlotProfile[] = [
  {
    id: 'plot-1',
    name: 'Теплица',
    region: DEFAULT_REGION,
    type: 'greenhouse',
  },
];

type JournalType = 'посадка' | 'уход' | 'сбор' | 'заметка';

interface JournalEntry {
  id: string;
  date: string;
  plotId: string;
  culture: string;
  entryType: JournalType;
  notes: string;
}

const JOURNAL_STORAGE_KEY = 'garden-journal';

function loadJournal(): JournalEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(JOURNAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as JournalEntry[]) : [];
  } catch {
    return [];
  }
}

function loadPlots(): PlotProfile[] {
  if (typeof window === 'undefined') {
    return DEFAULT_PLOTS;
  }

  try {
    const raw = localStorage.getItem(PLOTS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as PlotProfile[]) : DEFAULT_PLOTS;
    return parsed.length ? parsed : DEFAULT_PLOTS;
  } catch {
    return DEFAULT_PLOTS;
  }
}

function loadPlotCultures(): Record<string, string[]> {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = localStorage.getItem(PLOT_CULTURES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

interface ReminderItem {
  id: string;
  time: number;
  title: string;
  message: string;
  fired?: boolean;
}

function loadReminders(): ReminderItem[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(REMINDERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReminderItem[]) : [];
  } catch {
    return [];
  }
}

export const IndexPage: FC = () => {
  const navigate = useNavigate();
  const todayParts = useMemo(() => getZonedParts(new Date(), DEFAULT_TIMEZONE), []);
  const today = useMemo(() => zonedPartsToDate(todayParts), [todayParts]);
  const autoContext = useMemo(() => getLunarContext(today), [today]);
  const [flow, setFlow] = useState<'home' | 'plan' | 'care' | 'feeding' | 'orchard'>('home');
  const [planStep, setPlanStep] = useState(0);
  const [careStep, setCareStep] = useState(0);

  const initialPlots = useMemo(() => loadPlots(), []);
  const [plots, setPlots] = useState<PlotProfile[]>(initialPlots);
  const [plotCultures, setPlotCultures] = useState<Record<string, string[]>>(loadPlotCultures());
  const [activePlotId, setActivePlotId] = useState(
    initialPlots[0]?.id ?? DEFAULT_PLOTS[0].id,
  );
  const [newPlotName, setNewPlotName] = useState('');

  const activePlot = useMemo(
    () => plots.find((plot) => plot.id === activePlotId) ?? plots[0],
    [plots, activePlotId],
  );

  const region = activePlot?.region ?? DEFAULT_REGION;
  const plotType = activePlot?.type ?? 'greenhouse';

  const [customCultures, setCustomCultures] = useState<CultureItem[]>([]);
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<CultureType>('leaf');
  const [customGroup, setCustomGroup] = useState<CultureGroupId>('vegetables');

  const [selectedCultures, setSelectedCultures] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<TaskId[]>([]);
  const [selectedOrchard, setSelectedOrchard] = useState<string[]>([]);
  const [orchardScheduleId, setOrchardScheduleId] = useState('apple-tree');
  const [orchardTab, setOrchardTab] = useState<'overview' | 'schedule'>('overview');

  const [manualMode, setManualMode] = useState(false);
  const [lunarContext, setLunarContext] = useState<LunarContext>(autoContext);
  const activeContext = manualMode ? lunarContext : autoContext;

  const initialJournal = useMemo(() => loadJournal(), []);
  const [journal, setJournal] = useState<JournalEntry[]>(initialJournal);
  const [journalType, setJournalType] = useState<JournalType>('посадка');
  const [journalCulture, setJournalCulture] = useState('');
  const [journalNotes, setJournalNotes] = useState('');
  const [journalDate, setJournalDate] = useState(() => formatDate(today));
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editCulture, setEditCulture] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editType, setEditType] = useState<JournalType>('посадка');

  const [currentTime, setCurrentTime] = useState('');
  const [reminders, setReminders] = useState<ReminderItem[]>(loadReminders());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported' as const;
    }
    return Notification.permission;
  });

  const [feedingCultureId, setFeedingCultureId] = useState(() => CULTURE_GROUPS[0]?.items[0]?.id ?? '');
  const [feedingDate, setFeedingDate] = useState(() => {
    const year = today.getUTCFullYear();
    const month = String(today.getUTCMonth() + 1).padStart(2, '0');
    const day = String(today.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [calendarPlotId, setCalendarPlotId] = useState(activePlotId);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);
  const [stageCultureId, setStageCultureId] = useState(() => CULTURE_GROUPS[0]?.items[0]?.id ?? '');
  const [stageStartDate, setStageStartDate] = useState(() => {
    const year = today.getUTCFullYear();
    const month = String(today.getUTCMonth() + 1).padStart(2, '0');
    const day = String(today.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Weather notifications
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    
    const checkWeatherAlerts = async () => {
      try {
        const weather = await import('@/services/weather').then(m => m.weatherService.getWeather());
        const criticalRecs = weather.recommendations.filter(r => 
          r.includes('Внимание') || r.includes('Заморозки') || r.includes('Сильный ветер')
        );

        if (criticalRecs.length > 0 && Notification.permission === 'granted') {
          new Notification('Погодное предупреждение', {
            body: criticalRecs[0],
            icon: '/icon-192x192.png' // Make sure this icon exists or remove
          });
        }
      } catch (e) {
        // Ignore weather errors here
      }
    };

    checkWeatherAlerts();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PLOTS_STORAGE_KEY, JSON.stringify(plots));
  }, [plots]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(journal));
  }, [journal]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PLOT_CULTURES_KEY, JSON.stringify(plotCultures));
  }, [plotCultures]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: DEFAULT_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
    });

    const update = () => {
      setCurrentTime(formatter.format(new Date()));
    };

    update();
    const timer = window.setInterval(update, 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (notificationPermission === 'unsupported') return;

    const tick = () => {
      const now = Date.now();
      setReminders((prev) => {
        let changed = false;
        const next = prev.map((item) => {
          if (!item.fired && item.time <= now) {
            if (notificationPermission === 'granted') {
              try {
                new Notification(item.title, { body: item.message });
              } catch {
                // Ignore notification errors.
              }
            }
            changed = true;
            return { ...item, fired: true };
          }
          return item;
        });
        return changed ? next : prev;
      });
    };

    tick();
    const timer = window.setInterval(tick, 60000);
    return () => window.clearInterval(timer);
  }, [notificationPermission]);

  useEffect(() => {
    if (selectedOrchard.length && !selectedOrchard.includes(orchardScheduleId)) {
      setOrchardScheduleId(selectedOrchard[0]);
    }
  }, [selectedOrchard, orchardScheduleId]);

  useEffect(() => {
    if (!activePlot && plots.length) {
      setActivePlotId(plots[0].id);
    }
  }, [activePlot, plots]);

  useEffect(() => {
    if (plots.find((plot) => plot.id === calendarPlotId)) return;
    if (plots.length) {
      setCalendarPlotId(plots[0].id);
    }
  }, [plots, calendarPlotId]);

  const cultureMap = useMemo(() => {
    const map = new Map<string, CultureItem>();
    CULTURE_GROUPS.forEach((group) => {
      group.items.forEach((item) => map.set(item.id, item));
    });
    customCultures.forEach((item) => map.set(item.id, item));
    return map;
  }, [customCultures]);

  const resolveCultureName = (id: string) => {
    return cultureMap.get(id)?.title ?? CULTURE_NAME_OVERRIDES[id] ?? id;
  };

  const groupedCultures = useMemo(() => {
    return CULTURE_GROUPS.map((group) => ({
      ...group,
      items: [
        ...group.items,
        ...customCultures.filter((item) => item.group === group.id),
      ],
    }));
  }, [customCultures]);

  const selectedCultureItems = useMemo(() => {
    return selectedCultures
      .map((id) => cultureMap.get(id))
      .filter((item): item is CultureItem => Boolean(item));
  }, [selectedCultures, cultureMap]);

  const activePlotCultureItems = useMemo(() => {
    const ids = plotCultures[activePlotId] ?? [];
    return ids.map((id) => cultureMap.get(id)).filter((item): item is CultureItem => Boolean(item));
  }, [plotCultures, activePlotId, cultureMap]);

  const calendarCultureItems = useMemo(() => {
    const ids = plotCultures[calendarPlotId] ?? [];
    return ids.map((id) => cultureMap.get(id)).filter((item): item is CultureItem => Boolean(item));
  }, [plotCultures, calendarPlotId, cultureMap]);

  const todayCultureItems = activePlotCultureItems.length > 0
    ? activePlotCultureItems
    : selectedCultureItems;

  const selectedTaskItems = useMemo(() => {
    return TASKS.filter((task) => selectedTasks.includes(task.id));
  }, [selectedTasks]);

  const selectedOrchardItems = useMemo(() => {
    return ORCHARD_TREES.filter((tree) => selectedOrchard.includes(tree.id));
  }, [selectedOrchard]);

  const orchardSchedule = useMemo(() => {
    return ORCHARD_SCHEDULES[orchardScheduleId] ?? ORCHARD_SCHEDULE_BASE.pome;
  }, [orchardScheduleId]);

  const orchardTasks = useMemo(() => {
    return TASKS.filter((task) =>
      ['pruning', 'feeding', 'pests', 'watering'].includes(task.id),
    );
  }, []);

  const cultureDetails = useMemo(() => {
    return selectedCultureItems.map((item) => resolveCultureDetail(item));
  }, [selectedCultureItems]);

  const todayPlotAssessments = useMemo(() => {
    if (!todayCultureItems.length) return [];
    return assessCultures(todayCultureItems, activeContext, today);
  }, [todayCultureItems, activeContext, today]);

  const wateringSchedules = useMemo(() => {
    return selectedCultureItems.map((item) => ({
      culture: item,
      stages: getWateringSchedule(item.type),
    }));
  }, [selectedCultureItems]);

  const compatibilityItems = useMemo(() => {
    return selectedCultureItems.map((culture) => ({
      culture,
      info: getCompatibility(culture),
    }));
  }, [selectedCultureItems]);

  const stageCulture = useMemo(() => {
    return (
      cultureMap.get(stageCultureId)
      ?? selectedCultureItems[0]
      ?? CULTURE_GROUPS[0]?.items[0]
    );
  }, [stageCultureId, cultureMap, selectedCultureItems]);

  const stageSchedule = useMemo(() => {
    if (!stageCulture) return null;
    const date = parseInputDate(stageStartDate);
    if (!date) return null;
    return buildStageSchedule(stageCulture.type, date);
  }, [stageCulture, stageStartDate]);

  const monthlyCalendar = useMemo(() => {
    const baseYear = today.getUTCFullYear();
    const baseMonth = today.getUTCMonth() + calendarMonthOffset;
    const monthStart = new Date(Date.UTC(baseYear, baseMonth, 1));
    const year = monthStart.getUTCFullYear();
    const month = monthStart.getUTCMonth();
    const totalDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const formatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: DEFAULT_TIMEZONE,
      month: 'long',
      year: 'numeric',
    });
    const label = formatter.format(monthStart);
    const leading = (monthStart.getUTCDay() + 6) % 7;
    const days = [];

    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(Date.UTC(year, month, day));
      const context = getLunarContext(date);
      const assessments = assessCultures(calendarCultureItems, context, date);

      days.push({
        day,
        date: formatDate(date),
        phase: phaseLabel(context.phase),
        zodiac: context.zodiac,
        good: assessments.filter((item) => item.status === 'good').length,
        ok: assessments.filter((item) => item.status === 'ok').length,
        bad: assessments.filter((item) => item.status === 'bad').length,
        isToday: formatDate(date) === formatDate(today),
      });
    }

    return { label, leading, days };
  }, [today, calendarMonthOffset, calendarCultureItems]);

  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => a.time - b.time);
  }, [reminders]);

  const planAssessments = useMemo(() => {
    return assessCultures(selectedCultureItems, activeContext, today);
  }, [selectedCultureItems, activeContext, today]);

  const taskAssessments = useMemo(() => {
    return assessTasks(selectedTaskItems, activeContext, today);
  }, [selectedTaskItems, activeContext, today]);

  const orchardAssessments = useMemo(() => {
    return assessCultures(selectedOrchardItems, activeContext, today);
  }, [selectedOrchardItems, activeContext, today]);

  const orchardTaskAssessments = useMemo(() => {
    return assessTasks(orchardTasks, activeContext, today);
  }, [orchardTasks, activeContext, today]);

  const summaryText = useMemo(() => {
    const phaseText = phaseLabel(activeContext.phase);
    if (activeContext.isForbiddenWindow || activeContext.phase === 'new' || activeContext.phase === 'full') {
      return `Сегодня ${formatDate(today)} — ${phaseText}. Лучше снизить активные работы и перенести посадки.`;
    }
    return `Сегодня ${formatDate(today)} — ${phaseText}. День в целом подходит для плановых работ с учётом выбранных культур.`;
  }, [activeContext, today]);

  const seasonNote = useMemo(() => {
    const month = today.getUTCMonth();
    if (plotType === 'indoor') {
      return 'Для комнатных растений сезонные ограничения мягче, избегайте пересадок в жару и при сухом воздухе.';
    }

    if (plotType === 'greenhouse') {
      return 'В теплице работы возможны раньше, но учитывайте прогрев почвы и риск резких похолоданий.';
    }

    if (month <= 2 || month >= 10) {
      return 'Для открытого грунта сейчас важно проверить ночные температуры и риск заморозков.';
    }

    if (month <= 4) {
      return 'Весной в открытый грунт высаживайте после устойчивых плюсовых температур.';
    }

    return 'Следите за влажностью почвы и режимом полива, особенно в жаркие периоды.';
  }, [plotType, today]);

  const reminderFormatter = useMemo(() => {
    return new Intl.DateTimeFormat('ru-RU', {
      timeZone: DEFAULT_TIMEZONE,
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const formatReminderTime = (time: number) => reminderFormatter.format(new Date(time));


  const toggleCulture = (id: string) => {
    setSelectedCultures((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleTask = (id: TaskId) => {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleOrchard = (id: string) => {
    setSelectedOrchard((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addCustomCulture = () => {
    const trimmed = customName.trim();
    if (!trimmed) return;

    const id = `custom-${Date.now()}`;
    const item: CultureItem = {
      id,
      title: trimmed,
      type: customType,
      group: customGroup,
    };

    setCustomCultures((prev) => [...prev, item]);
    setSelectedCultures((prev) => [...prev, id]);
    setCustomName('');
  };

  const saveCulturesForPlot = () => {
    if (!selectedCultures.length) return;
    setPlotCultures((prev) => ({
      ...prev,
      [activePlotId]: [...selectedCultures],
    }));
  };

  const clearCulturesForPlot = () => {
    setPlotCultures((prev) => {
      const next = { ...prev };
      delete next[activePlotId];
      return next;
    });
  };

  const requestNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  const addStageReminders = () => {
    if (!stageSchedule || !stageCulture) return;
    const next = stageSchedule.map((stage) => {
      const remindAt = new Date(stage.startDate);
      remindAt.setHours(9, 0, 0, 0);
      return {
        id: `rem-${stageCulture.id}-${stage.id}-${remindAt.getTime()}`,
        time: remindAt.getTime(),
        title: `Этап: ${stage.title}`,
        message: `${stageCulture.title}. ${stage.tips}`,
        fired: false,
      } as ReminderItem;
    });

    setReminders((prev) => [...next, ...prev]);
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((item) => item.id !== id));
  };

  const clearReminders = () => {
    setReminders([]);
  };

  const resetFlow = () => {
    setFlow('home');
    setPlanStep(0);
    setCareStep(0);
  };

  const handleRegionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPlots((prev) =>
      prev.map((plot) =>
        plot.id === activePlotId ? { ...plot, region: value } : plot
      )
    );
  };

  const handlePlotTypeChange = (type: PlotType) => {
    setPlots((prev) =>
      prev.map((plot) =>
        plot.id === activePlotId ? { ...plot, type } : plot
      )
    );
  };

  const addJournalEntry = () => {
    if (!journalCulture.trim() && !journalNotes.trim()) return;
    const entry: JournalEntry = {
      id: `entry-${Date.now()}`,
      date: journalDate || formatDate(today),
      plotId: activePlotId,
      culture: journalCulture.trim() || 'Без культуры',
      entryType: journalType,
      notes: journalNotes.trim(),
    };

    setJournal((prev) => [entry, ...prev]);
    setJournalNotes('');
    setJournalCulture('');
  };

  const startEditEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEditCulture(entry.culture);
    setEditNotes(entry.notes);
    setEditDate(entry.date);
    setEditType(entry.entryType);
  };

  const saveEditEntry = () => {
    if (!editingEntryId) return;
    setJournal((prev) =>
      prev.map((entry) =>
        entry.id === editingEntryId
          ? {
            ...entry,
            culture: editCulture.trim() || entry.culture,
            notes: editNotes.trim(),
            date: editDate || entry.date,
            entryType: editType,
          }
          : entry,
      ),
    );
    setEditingEntryId(null);
  };

  const deleteEntry = (id: string) => {
    setJournal((prev) => prev.filter((entry) => entry.id !== id));
    if (editingEntryId === id) {
      setEditingEntryId(null);
    }
  };

  const calendarDays = useMemo(() => {
    const days: Array<{
      date: string;
      phase: string;
      zodiac: string;
      cultureGood: number;
      cultureBad: number;
      taskGood: number;
      taskBad: number;
    }> = [];

    for (let offset = 0; offset < 14; offset += 1) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() + offset);
      const context = getLunarContext(date);
      const cultureAssessments = assessCultures(selectedCultureItems, context, date);
      const taskAssessments = assessTasks(selectedTaskItems, context, date);

      days.push({
        date: formatDate(date),
        phase: phaseLabel(context.phase),
        zodiac: context.zodiac,
        cultureGood: cultureAssessments.filter((item) => item.status === 'good').length,
        cultureBad: cultureAssessments.filter((item) => item.status === 'bad').length,
        taskGood: taskAssessments.filter((item) => item.status === 'good').length,
        taskBad: taskAssessments.filter((item) => item.status === 'bad').length,
      });
    }

    return days;
  }, [today, selectedCultureItems, selectedTaskItems]);
  const addPlot = () => {
    const name = newPlotName.trim();
    if (!name) return;

    const id = `plot-${Date.now()}`;
    const nextPlot: PlotProfile = {
      id,
      name,
      region: region || DEFAULT_REGION,
      type: plotType,
    };

    setPlots((prev) => [...prev, nextPlot]);
    setActivePlotId(id);
    setNewPlotName('');
  };

  const handleManualToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setManualMode(checked);
    if (checked) {
      setLunarContext(autoContext);
    }
  };

  function parseInputDate(value: string): Date | null {
    if (!value) return null;
    if (value.includes('.')) {
      const [day, month, year] = value.split('.').map(Number);
      if (!day || !month || !year) return null;
      return new Date(Date.UTC(year, month - 1, day));
    }
    if (value.includes('-')) {
      const [year, month, day] = value.split('-').map(Number);
      if (!day || !month || !year) return null;
      return new Date(Date.UTC(year, month - 1, day));
    }
    return null;
  }

  const feedingCulture = useMemo(
    () => cultureMap.get(feedingCultureId) ?? selectedCultureItems[0] ?? CULTURE_GROUPS[0]?.items[0],
    [feedingCultureId, cultureMap, selectedCultureItems],
  );

  const feedingSchedule = useMemo(() => {
    if (!feedingCulture) return null;
    const date = parseInputDate(feedingDate);
    if (!date) return null;
    return buildFeedingSchedule(feedingCulture, date);
  }, [feedingCulture, feedingDate]);

  return (
    <Page back={false}>
      <div className="assistant">
        <header className="assistant__header">
          <div className="assistant__topline">
            <div className="assistant__brand">
              <div className="assistant__leaf">
                <span className="assistant__leaf-mark">
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M16 3a9 9 0 1 0 5 16.4A8 8 0 0 1 16 3z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </div>
              <div>
                <p className="assistant__eyebrow">Лунный помощник</p>
                <h1 className="assistant__title">Умный садовник</h1>
              </div>
            </div>
            <div className="assistant__avatar" />
          </div>
          <p className="assistant__subtitle">
            Планируйте посадки и уход в стиле спокойной теплицы.
          </p>
        </header>

        {flow === 'home' && (
          <Section>
            <WeatherWidget />
            <Card className="assistant__hero-card" variant="accent">
              <div className="assistant__hero">
                <div className="assistant__hero-content">
                  <span className="assistant__eyebrow">Начинаем посадки</span>
                  <h2 className="assistant__hero-title">Лунный гид по растениям</h2>
                  <p className="assistant__subtitle">
                    Рекомендации по фазе Луны, знаку Зодиака и сезону.
                  </p>
                </div>
                <div className="assistant__hero-media">
                  <div className="assistant__plant" />
                  <div className="assistant__pot" />
                </div>
              </div>
            </Card>

            <div className="assistant__cta">
              <Button
                variant="primary"
                className="assistant__cta-ai"
                onClick={() => navigate('/chat')}
              >
                🤖 AI Агроном
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setPlanStep(0);
                  setFlow('plan');
                }}
              >
                Планировать посадки
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setCareStep(0);
                  setFlow('care');
                }}
              >
                Уход и работы в огороде
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setFlow('feeding');
                }}
              >
                Подкормка после высадки
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setFlow('orchard');
                }}
              >
                Сад
              </Button>
            </div>

            <Section title="Время" hint={DEFAULT_TIMEZONE}>
              <Card variant="glass">
                <p className="assistant__meta">Сейчас</p>
                <p className="assistant__weather-temp">{currentTime || '—:—'}</p>
              </Card>
            </Section>

            <Section title="Журнал посадок и работ" hint="Быстрые заметки">
              <Card variant="glass">
                <div className="assistant__custom-row">
                  <Input
                    value={journalDate}
                    onChange={(event) => setJournalDate(event.target.value)}
                    placeholder="ДД.ММ.ГГГГ"
                  />
                  <Select
                    value={journalType}
                    onChange={(event) => setJournalType(event.target.value as JournalType)}
                  >
                    <option value="посадка">Посадка</option>
                    <option value="уход">Уход</option>
                    <option value="сбор">Сбор</option>
                    <option value="заметка">Заметка</option>
                  </Select>
                  <Input
                    value={journalCulture}
                    onChange={(event) => setJournalCulture(event.target.value)}
                    placeholder="Культура"
                  />
                  <Button variant="secondary" onClick={addJournalEntry}>
                    Добавить
                  </Button>
                </div>
                <Input
                  value={journalNotes}
                  onChange={(event) => setJournalNotes(event.target.value)}
                  placeholder="Короткая заметка"
                />
              </Card>
              <div className="assistant__results">
                {journal.slice(0, 6).map((entry) => (
                  <Card key={entry.id} variant="glass">
                    {editingEntryId === entry.id ? (
                      <div className="assistant__edit">
                        <div className="assistant__custom-row">
                          <Input
                            value={editDate}
                            onChange={(event) => setEditDate(event.target.value)}
                            placeholder="ДД.ММ.ГГГГ"
                          />
                          <Select
                            value={editType}
                            onChange={(event) => setEditType(event.target.value as JournalType)}
                          >
                            <option value="посадка">Посадка</option>
                            <option value="уход">Уход</option>
                            <option value="сбор">Сбор</option>
                            <option value="заметка">Заметка</option>
                          </Select>
                          <Input
                            value={editCulture}
                            onChange={(event) => setEditCulture(event.target.value)}
                            placeholder="Культура"
                          />
                        </div>
                        <Input
                          value={editNotes}
                          onChange={(event) => setEditNotes(event.target.value)}
                          placeholder="Заметка"
                        />
                        <div className="assistant__actions-row">
                          <Button variant="primary" onClick={saveEditEntry}>
                            Сохранить
                          </Button>
                          <Button variant="ghost" onClick={() => setEditingEntryId(null)}>
                            Отмена
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="assistant__meta">
                          {entry.date} • {entry.entryType} • {plots.find((plot) => plot.id === entry.plotId)?.name}
                        </p>
                        <h3 className="assistant__title">{entry.culture}</h3>
                        {entry.notes && <p className="assistant__meta">{entry.notes}</p>}
                        <div className="assistant__actions-row">
                          <Button variant="chip" onClick={() => startEditEntry(entry)}>
                            Редактировать
                          </Button>
                          <Button variant="chip" onClick={() => deleteEntry(entry.id)}>
                            Удалить
                          </Button>
                        </div>
                      </>
                    )}
                  </Card>
                ))}
                {journal.length === 0 && (
                  <Card variant="glass">
                    <p className="assistant__meta">Пока нет записей.</p>
                  </Card>
                )}
              </div>
            </Section>
          </Section>
        )}

        {flow === 'plan' && (
          <>
            <Section title="Шаг 1. Регион и участок">
              <Card variant="glass">
                <div className="assistant__custom-row">
                  <div>
                    <label className="assistant__label">Участки</label>
                    <div className="assistant__chips">
                      {plots.map((plot) => (
                        <Button
                          key={plot.id}
                          variant={plot.id === activePlotId ? 'primary' : 'chip'}
                          onClick={() => setActivePlotId(plot.id)}
                        >
                          {plot.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="assistant__label">Добавить участок</label>
                    <div className="assistant__chips">
                      <Input
                        value={newPlotName}
                        onChange={(event) => setNewPlotName(event.target.value)}
                        placeholder="Название участка"
                      />
                      <Button variant="secondary" onClick={addPlot}>
                        Добавить
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="assistant__custom-row">
                  <div>
                    <label className="assistant__label">Регион</label>
                    <Input
                      value={region}
                      onChange={handleRegionChange}
                      placeholder={DEFAULT_REGION}
                    />
                  </div>
                  <div>
                    <label className="assistant__label">Тип участка</label>
                    <div className="assistant__chips">
                      {PLOT_TYPES.map((type) => (
                        <Button
                          key={type.id}
                          variant={plotType === type.id ? 'primary' : 'chip'}
                          onClick={() => handlePlotTypeChange(type.id)}
                        >
                          {type.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <p className="assistant__meta">Часовой пояс: {DEFAULT_TIMEZONE}</p>
                </div>
              </Card>
              <div className="assistant__cta">
                <Button variant="primary" onClick={() => setPlanStep(1)}>
                  Далее
                </Button>
                <Button variant="ghost" onClick={resetFlow}>
                  На главный экран
                </Button>
              </div>
            </Section>

            {planStep >= 1 && (
              <Section title="Шаг 2. Выберите культуры">
                <Card variant="glass">
                  {groupedCultures.map((group) => (
                    <div key={group.id} className="assistant__group">
                      <h3 className="assistant__title">{group.title}</h3>
                      <div className="assistant__grid">
                        {group.items.map((item) => (
                          <label key={item.id} className="assistant__check">
                            <input
                              type="checkbox"
                              checked={selectedCultures.includes(item.id)}
                              onChange={() => toggleCulture(item.id)}
                            />
                            <span>{item.title}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </Card>

                <Card variant="accent">
                  <h3 className="assistant__title">Добавить свою культуру</h3>
                  <div className="assistant__custom-row">
                    <Input
                      value={customName}
                      onChange={(event) => setCustomName(event.target.value)}
                      placeholder="Например, мята или розмарин"
                    />
                    <Select
                      value={customType}
                      onChange={(event) => setCustomType(event.target.value as CultureType)}
                    >
                      {CULTURE_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.title}
                        </option>
                      ))}
                    </Select>
                    <Select
                      value={customGroup}
                      onChange={(event) => setCustomGroup(event.target.value as CultureGroupId)}
                    >
                      {Object.entries(GROUP_LABELS).map(([id, title]) => (
                        <option key={id} value={id}>
                          {title}
                        </option>
                      ))}
                    </Select>
                    <Button variant="secondary" onClick={addCustomCulture}>
                      Добавить
                    </Button>
                  </div>
                </Card>

                <Card variant="glass">
                  <h3 className="assistant__title">Закрепить культуры за участком</h3>
                  <p className="assistant__meta">
                    Сохраните список выбранных культур, чтобы строить календарь и быстрый обзор для участка
                    «{activePlot?.name}».
                  </p>
                  <div className="assistant__actions-row">
                    <Button
                      variant="secondary"
                      onClick={saveCulturesForPlot}
                      disabled={selectedCultures.length === 0}
                    >
                      Сохранить для участка
                    </Button>
                    {plotCultures[activePlotId]?.length ? (
                      <Button variant="ghost" onClick={clearCulturesForPlot}>
                        Очистить
                      </Button>
                    ) : null}
                  </div>
                  {plotCultures[activePlotId]?.length ? (
                    <p className="assistant__meta">
                      Сейчас сохранено: {plotCultures[activePlotId].length} культур.
                    </p>
                  ) : (
                    <p className="assistant__meta">
                      Для участка пока нет сохранённых культур.
                    </p>
                  )}
                </Card>

                <div className="assistant__cta">
                  <Button
                    variant="primary"
                    onClick={() => setPlanStep(2)}
                    disabled={selectedCultures.length === 0}
                  >
                    Посмотреть рекомендации
                  </Button>
                  <Button variant="ghost" onClick={resetFlow}>
                    На главный экран
                  </Button>
                </div>
              </Section>
            )}

            {planStep >= 2 && (
              <Section title="Рекомендации на сегодня">
                <Card className="assistant__summary" variant="glass">
                  <p>{summaryText}</p>
                  <p>{seasonNote}</p>
                </Card>

                <Card variant="accent">
                  <h3 className="assistant__title">Данные Луны</h3>
                  <p className="assistant__meta">
                    Авто: {phaseLabel(autoContext.phase)}, знак {autoContext.zodiac}
                  </p>
                  <label className="assistant__check">
                    <input
                      type="checkbox"
                      checked={manualMode}
                      onChange={handleManualToggle}
                    />
                    <span>Ручной режим (для тестов)</span>
                  </label>
                  {manualMode && (
                    <div className="assistant__custom-row">
                      <Select
                        value={lunarContext.phase}
                        onChange={(event) =>
                          setLunarContext((prev) => ({
                            ...prev,
                            phase: event.target.value as LunarContext['phase'],
                          }))
                        }
                      >
                        {PHASES.map((phase) => (
                          <option key={phase.id} value={phase.id}>
                            {phase.title}
                          </option>
                        ))}
                      </Select>
                      <Select
                        value={lunarContext.zodiac}
                        onChange={(event) =>
                          setLunarContext((prev) => ({
                            ...prev,
                            zodiac: event.target.value as LunarContext['zodiac'],
                          }))
                        }
                      >
                        {ZODIAC_SIGNS.map((sign) => (
                          <option key={sign} value={sign}>
                            {sign}
                          </option>
                        ))}
                      </Select>
                      <label className="assistant__check">
                        <input
                          type="checkbox"
                          checked={lunarContext.isForbiddenWindow}
                          onChange={(event) =>
                            setLunarContext((prev) => ({
                              ...prev,
                              isForbiddenWindow: event.target.checked,
                            }))
                          }
                        />
                        <span>Неблагоприятное окно (±12 часов)</span>
                      </label>
                    </div>
                  )}
                </Card>

                <div className="assistant__results">
                  {planAssessments.map((item) => (
                    <Card key={item.id} variant="glass">
                      <h3 className="assistant__title">{item.title}</h3>
                      <p
                        className={`assistant__status assistant__status--${item.status}`}
                      >
                        {statusLabel(item.status)}
                      </p>
                      <p className="assistant__meta">{item.explanation}</p>
                      <p className="assistant__meta">Тип: {cultureTypeLabel(item.type)}</p>
                      {item.suggestedDates && (
                        <p className="assistant__meta">
                          Ближайшие даты: {item.suggestedDates.join(', ')}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>

                <Section title="Быстрый просмотр: сегодня на участке" hint="Что можно сделать прямо сейчас">
                  <Card variant="glass">
                    <p className="assistant__meta">
                      Участок: {activePlot?.name ?? 'Без названия'} • Культур в календаре: {todayCultureItems.length}
                    </p>
                    {activePlotCultureItems.length ? (
                      <p className="assistant__meta">
                        Используем сохранённые культуры для участка.
                      </p>
                    ) : (
                      <p className="assistant__meta">
                        Участок ещё не закреплён, используем текущий список выбора.
                      </p>
                    )}
                  </Card>
                  <div className="assistant__results">
                    {todayPlotAssessments.map((item) => (
                      <Card key={item.id} variant="glass">
                        <h3 className="assistant__title">{item.title}</h3>
                        <p className={`assistant__status assistant__status--${item.status}`}>
                          {statusLabel(item.status)}
                        </p>
                        <p className="assistant__meta">{item.explanation}</p>
                      </Card>
                    ))}
                    {todayPlotAssessments.length === 0 && (
                      <Card variant="glass">
                        <p className="assistant__meta">Добавьте культуры, чтобы видеть быстрый обзор.</p>
                      </Card>
                    )}
                  </div>
                </Section>

                {cultureDetails.length > 0 && (
                  <Section title="Карточки культур" hint="Быстрые подсказки по уходу">
                    <div className="assistant__results">
                      {cultureDetails.map((detail) => (
                        <Card key={detail.id} variant="glass">
                          <h3 className="assistant__title">{detail.title}</h3>
                          <p className="assistant__meta">Полив: {detail.watering}</p>
                          <p className="assistant__meta">Подкормка: {detail.feeding}</p>
                          <p className="assistant__meta">Пересадка: {detail.transplant}</p>
                          <p className="assistant__meta">Особенности: {detail.notes}</p>
                        </Card>
                      ))}
                    </div>
                  </Section>
                )}

                <Section title="График полива по фазам роста">
                  <div className="assistant__results">
                    {wateringSchedules.map((schedule) => (
                      <Card key={schedule.culture.id} variant="glass">
                        <h3 className="assistant__title">{schedule.culture.title}</h3>
                        <ul className="assistant__list">
                          {schedule.stages.map((stage) => (
                            <li key={`${schedule.culture.id}-${stage.stage}`}>
                              {stage.stage}: {stage.frequency}. {stage.notes}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))}
                  </div>
                </Section>

                <Section title="Совместимость культур" hint="Что рядом сажать, чего избегать">
                  <div className="assistant__results">
                    {compatibilityItems.map(({ culture, info }) => (
                      <Card key={culture.id} variant="glass">
                        <h3 className="assistant__title">{culture.title}</h3>
                        {info ? (
                          <>
                            <p className="assistant__meta">
                              Хорошие соседи: {info.good.length ? info.good.map(resolveCultureName).join(', ') : '—'}
                            </p>
                            <p className="assistant__meta">
                              Избегать: {info.bad.length ? info.bad.map(resolveCultureName).join(', ') : '—'}
                            </p>
                          </>
                        ) : (
                          <p className="assistant__meta">Пока нет данных по совместимости.</p>
                        )}
                      </Card>
                    ))}
                  </div>
                </Section>

                <Section title="Поэтапные рекомендации" hint="Рассада → пересадка → плодоношение">
                  <Card variant="glass">
                    <div className="assistant__custom-row">
                      <div>
                        <label className="assistant__label">Культура</label>
                        <Select
                          value={stageCulture?.id ?? stageCultureId}
                          onChange={(event) => setStageCultureId(event.target.value)}
                        >
                          {groupedCultures.flatMap((group) =>
                            group.items.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.title}
                              </option>
                            )),
                          )}
                        </Select>
                      </div>
                      <div>
                        <label className="assistant__label">Старт цикла</label>
                        <Input
                          type="date"
                          value={stageStartDate}
                          onChange={(event) => setStageStartDate(event.target.value)}
                        />
                      </div>
                    </div>
                  </Card>

                  {stageSchedule ? (
                    <div className="assistant__results">
                      {stageSchedule.map((stage) => (
                        <Card key={stage.id} variant="glass">
                          <h3 className="assistant__title">{stage.title}</h3>
                          <p className="assistant__meta">{stage.range}</p>
                          <p className="assistant__meta">{stage.tips}</p>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card variant="glass">
                      <p className="assistant__meta">Укажите культуру и дату старта, чтобы получить этапы.</p>
                    </Card>
                  )}
                </Section>

                <Section title="Напоминания" hint="Уведомления о начале этапов">
                  <Card variant="accent">
                    <p className="assistant__meta">
                      Статус уведомлений:{' '}
                      {notificationPermission === 'granted'
                        ? 'разрешены'
                        : notificationPermission === 'denied'
                          ? 'запрещены'
                          : notificationPermission === 'unsupported'
                            ? 'не поддерживаются'
                            : 'не запрошены'}
                    </p>
                    <div className="assistant__actions-row">
                      {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' ? (
                        <Button variant="secondary" onClick={requestNotifications}>
                          Разрешить уведомления
                        </Button>
                      ) : null}
                      <Button
                        variant="primary"
                        onClick={addStageReminders}
                        disabled={!stageSchedule}
                      >
                        Создать напоминания по этапам
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={clearReminders}
                        disabled={reminders.length === 0}
                      >
                        Очистить
                      </Button>
                    </div>
                  </Card>

                  <div className="assistant__results">
                    {sortedReminders.map((item) => (
                      <Card key={item.id} variant="glass">
                        <p className="assistant__meta">{formatReminderTime(item.time)}</p>
                        <h3 className="assistant__title">{item.title}</h3>
                        <p className="assistant__meta">{item.message}</p>
                        <div className="assistant__actions-row">
                          <span className={`assistant__badge ${item.fired ? 'assistant__badge--done' : ''}`}>
                            {item.fired ? 'Отправлено' : 'Ожидает'}
                          </span>
                          <Button variant="chip" onClick={() => deleteReminder(item.id)}>
                            Удалить
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {sortedReminders.length === 0 && (
                      <Card variant="glass">
                        <p className="assistant__meta">Пока нет напоминаний.</p>
                      </Card>
                    )}
                  </div>
                </Section>

                <Section title="Календарь работ по участкам на месяц" hint="Выберите участок и месяц">
                  <Card variant="accent">
                    <div className="assistant__custom-row">
                      <div>
                        <label className="assistant__label">Участок</label>
                        <Select
                          value={calendarPlotId}
                          onChange={(event) => setCalendarPlotId(event.target.value)}
                        >
                          {plots.map((plot) => (
                            <option key={plot.id} value={plot.id}>
                              {plot.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label className="assistant__label">Месяц</label>
                        <div className="assistant__actions-row">
                          <Button
                            variant="chip"
                            onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
                          >
                            ◀
                          </Button>
                          <span className="assistant__meta">{monthlyCalendar.label}</span>
                          <Button
                            variant="chip"
                            onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
                          >
                            ▶
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="assistant__meta">
                      Для календаря используются культуры, закреплённые за выбранным участком.
                    </p>
                  </Card>

                  {calendarCultureItems.length > 0 ? (
                    <div className="assistant__month-grid">
                      {Array.from({ length: monthlyCalendar.leading }).map((_, index) => (
                        <div key={`empty-${index}`} className="assistant__month-cell assistant__month-cell--empty" />
                      ))}
                      {monthlyCalendar.days.map((day) => (
                        <div
                          key={day.date}
                          className={`assistant__month-cell${day.isToday ? ' assistant__month-cell--today' : ''}`}
                        >
                          <div className="assistant__month-day">{day.day}</div>
                          <div className="assistant__month-meta">{day.phase}</div>
                          <div className="assistant__month-meta">{day.zodiac}</div>
                          <div className="assistant__month-badges">
                            <span className="assistant__badge assistant__badge--good">+{day.good}</span>
                            <span className="assistant__badge assistant__badge--ok">±{day.ok}</span>
                            <span className="assistant__badge assistant__badge--bad">−{day.bad}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card variant="glass">
                      <p className="assistant__meta">
                        Закрепите культуры за участком, чтобы построить календарь.
                      </p>
                    </Card>
                  )}
                </Section>

                <Section title="Календарь на 14 дней" hint="Ближайшие окна для работ">
                  <div className="assistant__calendar">
                    {calendarDays.map((day) => (
                      <Card key={day.date} variant="glass">
                        <p className="assistant__meta">{day.date}</p>
                        <p className="assistant__meta">{day.phase}, {day.zodiac}</p>
                        <div className="assistant__badges">
                          <span className="assistant__badge assistant__badge--good">
                            Посадки: {day.cultureGood}
                          </span>
                          <span className="assistant__badge assistant__badge--bad">
                            Посадки: {day.cultureBad}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Section>

                <p className="assistant__disclaimer">{DISCLAIMER}</p>
              </Section>
            )}
          </>
        )}

        {flow === 'care' && (
          <>
            <Section title="Шаг 1. Выберите работы">
              <Card variant="glass">
                <div className="assistant__grid">
                  {TASKS.map((task) => (
                    <label key={task.id} className="assistant__check">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => toggleTask(task.id)}
                      />
                      <span>{task.title}</span>
                    </label>
                  ))}
                </div>
              </Card>
              <div className="assistant__cta">
                <Button
                  variant="primary"
                  onClick={() => setCareStep(1)}
                  disabled={selectedTasks.length === 0}
                >
                  Посмотреть рекомендации
                </Button>
                <Button variant="ghost" onClick={resetFlow}>
                  На главный экран
                </Button>
              </div>
            </Section>

            {careStep >= 1 && (
              <Section title="Рекомендации на сегодня">
                <Card className="assistant__summary" variant="glass">
                  <p>{summaryText}</p>
                  <p>{seasonNote}</p>
                </Card>

                <Card variant="accent">
                  <h3 className="assistant__title">Данные Луны</h3>
                  <p className="assistant__meta">
                    Авто: {phaseLabel(autoContext.phase)}, знак {autoContext.zodiac}
                  </p>
                  <label className="assistant__check">
                    <input
                      type="checkbox"
                      checked={manualMode}
                      onChange={handleManualToggle}
                    />
                    <span>Ручной режим (для тестов)</span>
                  </label>
                  {manualMode && (
                    <div className="assistant__custom-row">
                      <Select
                        value={lunarContext.phase}
                        onChange={(event) =>
                          setLunarContext((prev) => ({
                            ...prev,
                            phase: event.target.value as LunarContext['phase'],
                          }))
                        }
                      >
                        {PHASES.map((phase) => (
                          <option key={phase.id} value={phase.id}>
                            {phase.title}
                          </option>
                        ))}
                      </Select>
                      <Select
                        value={lunarContext.zodiac}
                        onChange={(event) =>
                          setLunarContext((prev) => ({
                            ...prev,
                            zodiac: event.target.value as LunarContext['zodiac'],
                          }))
                        }
                      >
                        {ZODIAC_SIGNS.map((sign) => (
                          <option key={sign} value={sign}>
                            {sign}
                          </option>
                        ))}
                      </Select>
                      <label className="assistant__check">
                        <input
                          type="checkbox"
                          checked={lunarContext.isForbiddenWindow}
                          onChange={(event) =>
                            setLunarContext((prev) => ({
                              ...prev,
                              isForbiddenWindow: event.target.checked,
                            }))
                          }
                        />
                        <span>Неблагоприятное окно (±12 часов)</span>
                      </label>
                    </div>
                  )}
                </Card>

                <div className="assistant__results">
                  {taskAssessments.map((item) => (
                    <Card key={item.id} variant="glass">
                      <h3 className="assistant__title">{item.title}</h3>
                      <p
                        className={`assistant__status assistant__status--${item.status}`}
                      >
                        {statusLabel(item.status)}
                      </p>
                      <p className="assistant__meta">{item.explanation}</p>
                      <ul className="assistant__list">
                        {item.instructions.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                      {item.suggestedDates && (
                        <p className="assistant__meta">
                          Ближайшие даты: {item.suggestedDates.join(', ')}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>

                <Section title="Календарь на 14 дней" hint="Окна для выбранных работ">
                  <div className="assistant__calendar">
                    {calendarDays.map((day) => (
                      <Card key={day.date} variant="glass">
                        <p className="assistant__meta">{day.date}</p>
                        <p className="assistant__meta">{day.phase}, {day.zodiac}</p>
                        <div className="assistant__badges">
                          <span className="assistant__badge assistant__badge--good">
                            Работы: {day.taskGood}
                          </span>
                          <span className="assistant__badge assistant__badge--bad">
                            Работы: {day.taskBad}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Section>

                <p className="assistant__disclaimer">{DISCLAIMER}</p>
              </Section>
            )}
          </>
        )}

        {flow === 'orchard' && (
          <>
            <Section title="Сад" hint="Деревья и ягодники">
              <Card variant="glass">
                <div className="assistant__chips">
                  <Button
                    variant={orchardTab === 'overview' ? 'primary' : 'chip'}
                    onClick={() => setOrchardTab('overview')}
                  >
                    Рекомендации
                  </Button>
                  <Button
                    variant={orchardTab === 'schedule' ? 'primary' : 'chip'}
                    onClick={() => setOrchardTab('schedule')}
                  >
                    График
                  </Button>
                </div>
              </Card>
              <div className="assistant__cta">
                <Button variant="ghost" onClick={resetFlow}>
                  На главный экран
                </Button>
              </div>
            </Section>

            {orchardTab === 'overview' && (
              <>
                <Section title="Садовые культуры">
                  <Card variant="glass">
                    <div className="assistant__grid">
                      {ORCHARD_TREES.map((tree) => (
                        <label key={tree.id} className="assistant__check">
                          <input
                            type="checkbox"
                            checked={selectedOrchard.includes(tree.id)}
                            onChange={() => toggleOrchard(tree.id)}
                          />
                          <span>{tree.title}</span>
                        </label>
                      ))}
                    </div>
                  </Card>
                </Section>

                {selectedOrchard.length > 0 && (
                  <Section title="Рекомендации на сегодня">
                    <Card className="assistant__summary" variant="glass">
                      <p>{summaryText}</p>
                      <p>{seasonNote}</p>
                    </Card>

                    <Card variant="accent">
                      <h3 className="assistant__title">Данные Луны</h3>
                      <p className="assistant__meta">
                        Авто: {phaseLabel(autoContext.phase)}, знак {autoContext.zodiac}
                      </p>
                      <label className="assistant__check">
                        <input
                          type="checkbox"
                          checked={manualMode}
                          onChange={handleManualToggle}
                        />
                        <span>Ручной режим (для тестов)</span>
                      </label>
                      {manualMode && (
                        <div className="assistant__custom-row">
                          <Select
                            value={lunarContext.phase}
                            onChange={(event) =>
                              setLunarContext((prev) => ({
                                ...prev,
                                phase: event.target.value as LunarContext['phase'],
                              }))
                            }
                          >
                            {PHASES.map((phase) => (
                              <option key={phase.id} value={phase.id}>
                                {phase.title}
                              </option>
                            ))}
                          </Select>
                          <Select
                            value={lunarContext.zodiac}
                            onChange={(event) =>
                              setLunarContext((prev) => ({
                                ...prev,
                                zodiac: event.target.value as LunarContext['zodiac'],
                              }))
                            }
                          >
                            {ZODIAC_SIGNS.map((sign) => (
                              <option key={sign} value={sign}>
                                {sign}
                              </option>
                            ))}
                          </Select>
                          <label className="assistant__check">
                            <input
                              type="checkbox"
                              checked={lunarContext.isForbiddenWindow}
                              onChange={(event) =>
                                setLunarContext((prev) => ({
                                  ...prev,
                                  isForbiddenWindow: event.target.checked,
                                }))
                              }
                            />
                            <span>Неблагоприятное окно (±12 часов)</span>
                          </label>
                        </div>
                      )}
                    </Card>

                    <Section title="Посадки и пересадки деревьев">
                      <div className="assistant__results">
                        {orchardAssessments.map((item) => (
                          <Card key={item.id} variant="glass">
                            <h3 className="assistant__title">{item.title}</h3>
                            <p className={`assistant__status assistant__status--${item.status}`}>
                              {statusLabel(item.status)}
                            </p>
                            <p className="assistant__meta">{item.explanation}</p>
                            {item.suggestedDates && (
                              <p className="assistant__meta">
                                Ближайшие даты: {item.suggestedDates.join(', ')}
                              </p>
                            )}
                          </Card>
                        ))}
                      </div>
                    </Section>

                    <Section title="Уход за садом">
                      <div className="assistant__results">
                        {orchardTaskAssessments.map((item) => (
                          <Card key={item.id} variant="glass">
                            <h3 className="assistant__title">{item.title}</h3>
                            <p className={`assistant__status assistant__status--${item.status}`}>
                              {statusLabel(item.status)}
                            </p>
                            <p className="assistant__meta">{item.explanation}</p>
                            <ul className="assistant__list">
                              {item.instructions.map((tip) => (
                                <li key={tip}>{tip}</li>
                              ))}
                            </ul>
                          </Card>
                        ))}
                      </div>
                    </Section>

                    <Section title="Особые рекомендации">
                      <div className="assistant__results">
                        {selectedOrchardItems.map((tree) => {
                          const detail = ORCHARD_DETAILS[tree.id];
                          if (!detail) return null;
                          return (
                            <Card key={tree.id} variant="glass">
                              <h3 className="assistant__title">{tree.title}</h3>
                              <p className="assistant__meta">Обрезка: {detail.pruning}</p>
                              <p className="assistant__meta">Вредители: {detail.pests}</p>
                              <p className="assistant__meta">Подкормки: {detail.feeding}</p>
                              <p className="assistant__meta">{detail.notes}</p>
                            </Card>
                          );
                        })}
                      </div>
                    </Section>

                    <p className="assistant__disclaimer">{DISCLAIMER}</p>
                  </Section>
                )}
              </>
            )}

            {orchardTab === 'schedule' && (
              <Section title="График подкормок и обработок" hint="По неделям, апрель–октябрь">
                <Card variant="accent">
                  <div className="assistant__custom-row">
                    <div>
                      <label className="assistant__label">График для культуры</label>
                      <Select
                        value={orchardScheduleId}
                        onChange={(event) => setOrchardScheduleId(event.target.value)}
                      >
                        {ORCHARD_TREES.map((tree) => (
                          <option key={tree.id} value={tree.id}>
                            {tree.title}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <p className="assistant__meta">
                      Расписание учитывает климат Челябинской области.
                    </p>
                  </div>
                </Card>
                <div className="assistant__results">
                  {orchardSchedule.map((step) => (
                    <Card key={step.period} variant="glass">
                      <h3 className="assistant__title">{step.period}</h3>
                      <p className="assistant__meta">Подкормка: {step.feeding}</p>
                      <p className="assistant__meta">Вредители: {step.pests}</p>
                    </Card>
                  ))}
                </div>
                <p className="assistant__disclaimer">{DISCLAIMER}</p>
              </Section>
            )}
          </>
        )}

        {flow === 'feeding' && (
          <>
            <Section title="Подкормка после высадки" hint="Планируем цикл до сбора урожая">
              <Card variant="glass">
                <div className="assistant__custom-row">
                  <div>
                    <label className="assistant__label">Культура</label>
                    <Select
                      value={feedingCulture?.id ?? feedingCultureId}
                      onChange={(event) => setFeedingCultureId(event.target.value)}
                    >
                    {groupedCultures.flatMap((group) =>
                      group.items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))
                    )}
                    </Select>
                  </div>
                  <div>
                    <label className="assistant__label">Дата высадки</label>
                    <Input
                      type="date"
                      value={feedingDate}
                      onChange={(event) => setFeedingDate(event.target.value)}
                    />
                  </div>
                </div>
              </Card>

              <div className="assistant__cta">
                <Button variant="ghost" onClick={resetFlow}>
                  На главный экран
                </Button>
              </div>
            </Section>

            <Section title="График подкормок" hint="Дни после высадки">
              <Card className="assistant__summary" variant="glass">
                {feedingSchedule ? (
                  <>
                    <p>
                      Первая подкормка через {feedingSchedule.plan.firstAfterDays} дней,
                      далее каждые {feedingSchedule.plan.intervalDays} дней.
                    </p>
                    <p className="assistant__meta">
                      Ориентировочное начало сбора урожая: {feedingSchedule.harvestDate}.
                    </p>
                    <p className="assistant__meta">{feedingSchedule.plan.note}</p>
                  </>
                ) : (
                  <p className="assistant__meta">Укажите культуру и дату высадки.</p>
                )}
              </Card>

              {feedingSchedule && (
                <div className="assistant__results">
                  {feedingSchedule.steps.map((step) => (
                    <Card key={step.date} variant="glass">
                      <p className="assistant__meta">{step.label}</p>
                      <h3 className="assistant__title">{step.date}</h3>
                    </Card>
                  ))}
                </div>
              )}

              <p className="assistant__disclaimer">{DISCLAIMER}</p>
            </Section>
          </>
        )}
      </div>
    </Page>
  );
};
