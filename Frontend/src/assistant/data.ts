import type { CultureGroup, TaskItem, ZodiacFertility, ZodiacSign } from './types';

export const DEFAULT_REGION = 'Челябинская область, Копейск';
export const DEFAULT_TIMEZONE = 'Asia/Yekaterinburg';

export const CULTURE_GROUPS: CultureGroup[] = [
  {
    id: 'vegetables',
    title: 'Овощи',
    items: [
      { id: 'tomato', title: 'Томат', type: 'fruit', group: 'vegetables' },
      { id: 'cucumber', title: 'Огурец', type: 'fruit', group: 'vegetables' },
      { id: 'sweet-pepper', title: 'Перец болгарский', type: 'fruit', group: 'vegetables' },
      { id: 'eggplant', title: 'Баклажан', type: 'fruit', group: 'vegetables' },
      { id: 'zucchini', title: 'Кабачок', type: 'fruit', group: 'vegetables' },
      { id: 'watermelon', title: 'Арбуз', type: 'fruit', group: 'vegetables' },
      { id: 'melon', title: 'Дыня', type: 'fruit', group: 'vegetables' },
      { id: 'pumpkin', title: 'Тыква', type: 'fruit', group: 'vegetables' },
      { id: 'radish', title: 'Редис', type: 'root', group: 'vegetables' },
      { id: 'carrot', title: 'Морковь', type: 'root', group: 'vegetables' },
      { id: 'beet', title: 'Свёкла', type: 'root', group: 'vegetables' },
    ],
  },
  {
    id: 'berries',
    title: 'Фрукты и ягоды',
    items: [
      { id: 'strawberry', title: 'Клубника/земляника', type: 'fruit', group: 'berries' },
    ],
  },
  {
    id: 'greens',
    title: 'Зелень',
    items: [
      { id: 'lettuce', title: 'Салат', type: 'leaf', group: 'greens' },
      { id: 'spinach', title: 'Шпинат', type: 'leaf', group: 'greens' },
      { id: 'dill', title: 'Укроп', type: 'leaf', group: 'greens' },
      { id: 'parsley', title: 'Петрушка', type: 'leaf', group: 'greens' },
      { id: 'cilantro', title: 'Кинза', type: 'leaf', group: 'greens' },
      { id: 'basil', title: 'Базилик', type: 'leaf', group: 'greens' },
      { id: 'green-onion', title: 'Зелёный лук', type: 'leaf', group: 'greens' },
      { id: 'arugula', title: 'Руккола', type: 'leaf', group: 'greens' },
    ],
  },
  {
    id: 'flowers',
    title: 'Цветы',
    items: [
      { id: 'petunia', title: 'Петуния', type: 'flower', group: 'flowers' },
      { id: 'marigold', title: 'Бархатцы', type: 'flower', group: 'flowers' },
      { id: 'calendula', title: 'Календула', type: 'flower', group: 'flowers' },
      { id: 'begonia', title: 'Бегония', type: 'flower', group: 'flowers' },
    ],
  },
];

export const TASKS: TaskItem[] = [
  { id: 'watering', title: 'Полив' },
  { id: 'feeding', title: 'Подкормка' },
  { id: 'pruning', title: 'Обрезка' },
  { id: 'transplant', title: 'Пересадка' },
  { id: 'weeding', title: 'Прополка' },
  { id: 'pests', title: 'Борьба с вредителями' },
  { id: 'harvest', title: 'Заготовки урожая' },
];

export const ZODIAC_FERTILITY: Record<ZodiacSign, ZodiacFertility> = {
  Овен: 'barren',
  Телец: 'medium',
  Близнецы: 'barren',
  Рак: 'fertile',
  Лев: 'barren',
  Дева: 'neutral',
  Весы: 'medium',
  Скорпион: 'fertile',
  Стрелец: 'neutral',
  Козерог: 'medium',
  Водолей: 'barren',
  Рыбы: 'fertile',
};

export const ZODIAC_SIGNS: ZodiacSign[] = [
  'Овен',
  'Телец',
  'Близнецы',
  'Рак',
  'Лев',
  'Дева',
  'Весы',
  'Скорпион',
  'Стрелец',
  'Козерог',
  'Водолей',
  'Рыбы',
];
