export type CultureType = 'root' | 'leaf' | 'fruit' | 'flower';

export type CultureGroupId = 'vegetables' | 'berries' | 'greens' | 'flowers';

export interface CultureItem {
  id: string;
  title: string;
  type: CultureType;
  group: CultureGroupId;
}

export interface CultureGroup {
  id: CultureGroupId;
  title: string;
  items: CultureItem[];
}

export type MoonPhase = 'new' | 'waxing' | 'full' | 'waning';

export type ZodiacSign =
  | 'Овен'
  | 'Телец'
  | 'Близнецы'
  | 'Рак'
  | 'Лев'
  | 'Дева'
  | 'Весы'
  | 'Скорпион'
  | 'Стрелец'
  | 'Козерог'
  | 'Водолей'
  | 'Рыбы';

export type ZodiacFertility = 'fertile' | 'medium' | 'neutral' | 'barren';

export type TaskId =
  | 'watering'
  | 'feeding'
  | 'pruning'
  | 'transplant'
  | 'weeding'
  | 'pests'
  | 'harvest';

export interface TaskItem {
  id: TaskId;
  title: string;
}

export type Status = 'good' | 'ok' | 'bad';

export interface LunarContext {
  phase: MoonPhase;
  zodiac: ZodiacSign;
  isForbiddenWindow: boolean;
}

export interface CultureAssessment {
  id: string;
  title: string;
  type: CultureType;
  status: Status;
  explanation: string;
  suggestedDates?: string[];
}

export interface TaskAssessment {
  id: TaskId;
  title: string;
  status: Status;
  explanation: string;
  instructions: string[];
  suggestedDates?: string[];
}
