export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  description: string;
  icon: string;
  forecast: Array<{
    day: string;
    temp: number;
    description: string;
    icon: string;
  }>;
  recommendations: string[];
  updated_at: number;
  error?: string;
  mock?: boolean;
}

export class WeatherService {
  private static instance: WeatherService;
  private cache: Map<string, { data: WeatherData; timestamp: number }> = new Map();
  private CACHE_DURATION = 10 * 60 * 1000; // 10 минут

  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  async getWeather(city: string = 'Chelyabinsk'): Promise<WeatherData> {
    const cacheKey = city.toLowerCase();
    const cached = this.cache.get(cacheKey);
    
    // Возвращаем кэшированные данные, если они свежие
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}&units=metric&lang=ru`);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data: WeatherData = await response.json();
      
      // Кэшируем успешный ответ
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      
      // Возвращаем кэшированные данные при ошибке, если есть
      if (cached) {
        return cached.data;
      }
      
      // Возвращаем объект с ошибкой для отображения в UI
      return {
        city: city,
        country: '',
        temperature: 0,
        feels_like: 0,
        humidity: 0,
        pressure: 0,
        wind_speed: 0,
        wind_direction: 0,
        description: 'Ошибка загрузки',
        icon: '01d',
        forecast: [],
        recommendations: [`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`],
        updated_at: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  formatWindDirection(degrees: number): string {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  getTemperatureColor(temp: number): string {
    if (temp < 0) return '#4FC3F7'; // Голубой (холодно)
    if (temp < 10) return '#81C784'; // Светло-зеленый (прохладно)
    if (temp < 20) return '#9CCC65'; // Зеленый (комфортно)
    if (temp < 30) return '#FFB74D'; // Оранжевый (тепло)
    return '#FF8A65'; // Красный (жарко)
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const weatherService = WeatherService.getInstance();