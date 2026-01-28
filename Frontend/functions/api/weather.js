export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const city = url.searchParams.get('city') || 'Chelyabinsk';
    
    // Проверка наличия ключа
    if (!env.OPENWEATHER_API_KEY) {
      return new Response(JSON.stringify({
        error: 'Configuration Error',
        details: 'OPENWEATHER_API_KEY is missing in environment variables'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = env.OPENWEATHER_API_KEY.trim();
    
    // Прямой запрос без лишних параметров для теста
    const targetUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ru`;
    
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      const text = await response.text();
      return new Response(JSON.stringify({
        error: 'OpenWeatherMap API Error',
        status: response.status,
        details: text,
        url_masked: targetUrl.replace(apiKey, '***')
      }), {
        status: 502, // Bad Gateway
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    
    // Формируем простой ответ
    const result = {
      city: data.name,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      // Добавляем поля для совместимости с нашим UI
      forecast: [],
      recommendations: [],
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      feels_like: Math.round(data.main.feels_like)
    };

    return new Response(JSON.stringify(result), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({
      error: 'Internal Worker Error',
      message: e.message,
      stack: e.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}