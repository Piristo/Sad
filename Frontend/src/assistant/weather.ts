export interface WeatherDay {
  date: string;
  min: number;
  max: number;
  precipitation: number;
}

export interface WeatherInfo {
  location: string;
  temperature: number;
  wind: number;
  min: number;
  max: number;
  precipitation: number;
  daily: WeatherDay[];
  updatedAt: string;
}

interface GeocodeResult {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function geocode(region: string): Promise<GeocodeResult | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(region)}&count=1&language=ru&format=json`;
  const data = await fetchJson<{ results?: GeocodeResult[] }>(url);
  return data.results?.[0] ?? null;
}

export async function fetchWeather(region: string, timeZone: string): Promise<WeatherInfo | null> {
  const location = await geocode(region);
  if (!location) return null;

  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    timezone: timeZone,
  });

  const forecastUrl = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const forecast = await fetchJson<{
    current?: { temperature_2m: number; wind_speed_10m: number };
    daily?: {
      time: string[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_sum: number[];
    };
  }>(forecastUrl);

  const daily = forecast.daily;
  const current = forecast.current;
  if (!current || !daily) return null;

  const locationLabel = [location.name, location.admin1, location.country]
    .filter(Boolean)
    .join(', ');

  const dailyForecast: WeatherDay[] = (daily.time || []).slice(0, 7).map((date, index) => ({
    date,
    min: daily.temperature_2m_min?.[index] ?? current.temperature_2m,
    max: daily.temperature_2m_max?.[index] ?? current.temperature_2m,
    precipitation: daily.precipitation_sum?.[index] ?? 0,
  }));

  return {
    location: locationLabel,
    temperature: current.temperature_2m,
    wind: current.wind_speed_10m,
    min: daily.temperature_2m_min?.[0] ?? current.temperature_2m,
    max: daily.temperature_2m_max?.[0] ?? current.temperature_2m,
    precipitation: daily.precipitation_sum?.[0] ?? 0,
    daily: dailyForecast,
    updatedAt: new Date().toISOString(),
  };
}
