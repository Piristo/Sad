import type { LunarContext, MoonPhase, ZodiacSign } from './types';

const SYNODIC_MONTH = 29.530588853;
const KNOWN_NEW_MOON_JD = 2451550.1; // 2000-01-06 18:14 UTC (approx)

const ZODIAC: ZodiacSign[] = [
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

export interface ZonedDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function getZonedParts(date: Date, timeZone: string): ZonedDateParts {
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

export function zonedPartsToDate(parts: ZonedDateParts): Date {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second));
}

export function getZonedDate(timeZone: string, date = new Date()): Date {
  return zonedPartsToDate(getZonedParts(date, timeZone));
}

export function formatDate(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function toJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function getMoonEclipticLongitude(date: Date): number {
  const jd = toJulianDate(date);
  const d = jd - 2451545.0;

  const L0 = normalizeAngle(218.316 + 13.176396 * d);
  const M = normalizeAngle(134.963 + 13.064993 * d);
  const D = normalizeAngle(297.850 + 12.190749 * d);

  const lon = L0
    + 6.289 * Math.sin(degToRad(M))
    + 1.274 * Math.sin(degToRad(2 * D - M))
    + 0.658 * Math.sin(degToRad(2 * D))
    + 0.214 * Math.sin(degToRad(2 * M))
    + 0.11 * Math.sin(degToRad(D));

  return normalizeAngle(lon);
}

function getMoonAge(date: Date): number {
  const jd = toJulianDate(date);
  const age = (jd - KNOWN_NEW_MOON_JD) % SYNODIC_MONTH;
  return (age + SYNODIC_MONTH) % SYNODIC_MONTH;
}

function getPhase(age: number): MoonPhase {
  if (age < 1.0 || age > SYNODIC_MONTH - 1.0) {
    return 'new';
  }
  if (Math.abs(age - SYNODIC_MONTH / 2) < 1.0) {
    return 'full';
  }
  if (age < SYNODIC_MONTH / 2) {
    return 'waxing';
  }
  return 'waning';
}

export function getLunarContext(date: Date): LunarContext {
  const age = getMoonAge(date);
  const phase = getPhase(age);
  const longitude = getMoonEclipticLongitude(date);
  const zodiacIndex = Math.floor(longitude / 30) % 12;
  const zodiac = ZODIAC[zodiacIndex];

  const isForbiddenWindow =
    age < 0.5
    || age > SYNODIC_MONTH - 0.5
    || Math.abs(age - SYNODIC_MONTH / 2) < 0.5;

  return {
    phase,
    zodiac,
    isForbiddenWindow,
  };
}
