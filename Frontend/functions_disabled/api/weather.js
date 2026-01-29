function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const city = url.searchParams.get('city') || 'Chelyabinsk';
    const units = url.searchParams.get('units') || 'metric';
    const lang = url.searchParams.get('lang') || 'ru';

    // Проверка ключа
    if (!env.OPENWEATHER_API_KEY) {
      return jsonResponse({ 
        error: 'Configuration Error',
        details: 'Weather API key is missing in Cloudflare environment variables',
        mock: true
      }, 500);
    }

    const apiKey = env.OPENWEATHER_API_KEY.trim();

    // 1. Запрос текущей погоды
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}&lang=${lang}`;
    
    const currentResponse = await fetch(currentWeatherUrl);
    
    if (!currentResponse.ok) {
      const errorText = await currentResponse.text();
      let errorJson;
      try { errorJson = JSON.parse(errorText); } catch (e) {}
      
      return jsonResponse({
        error: 'OpenWeatherMap API Error',
        status: currentResponse.status,
        details: errorJson ? errorJson.message : errorText,
        code: errorJson ? errorJson.cod : currentResponse.status
      }, 502);
    }
    
    const currentData = await currentResponse.json();

    // 2. Запрос прогноза (не блокирует основной ответ при ошибке)
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}&lang=${lang}`;
    let dailyForecasts = [];
    
    try {
      const forecastResponse = await fetch(forecastUrl);
      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json();
        const processedDays = new Set();
        
        for (const item of forecastData.list) {
          const date = new Date(item.dt * 1000);
          const dayKey = date.toISOString().split('T')[0];
          
          // Берем прогноз на следующие дни (не сегодня)
          const todayKey = new Date().toISOString().split('T')[0];
          if (dayKey !== todayKey && !processedDays.has(dayKey) && dailyForecasts.length < 3) {
            processedDays.add(dayKey);
            dailyForecasts.push({
              day: date.toLocaleDateString('ru-RU', { weekday: 'long' }),
              temp: Math.round(item.main.temp),
              description: item.weather[0].description,
              icon: item.weather[0].icon
            });
          }
        }
      }
    } catch (e) {
      console.error('Forecast fetch failed:', e);
    }

    // Рекомендации
    const recommendations = [];
    const temp = currentData.main.temp;
    const humidity = currentData.main.humidity;
    const windSpeed = currentData.wind.speed;
    const weatherMain = currentData.weather[0].main.toLowerCase();

    if (temp < 5) recommendations.push('❄️ Внимание! Низкая температура - прикройте растения');
    else if (temp > 30) recommendations.push('🔥 Жарко! Увеличьте полив и создайте тень');

    if (weatherMain.includes('rain')) recommendations.push('🌧️ Дождь - отмените полив, проверьте дренаж');
    else if (humidity < 40) recommendations.push('💧 Низкая влажность - увеличьте полив');

    if (windSpeed > 10) recommendations.push('💨 Сильный ветер - закрепите высокие растения');

    return jsonResponse({
      city: currentData.name,
      country: currentData.sys.country,
      temperature: Math.round(temp),
      feels_like: Math.round(currentData.main.feels_like),
      humidity: currentData.main.humidity,
      pressure: currentData.main.pressure,
      wind_speed: currentData.wind.speed,
      wind_direction: currentData.wind.deg,
      description: currentData.weather[0].description,
      icon: currentData.weather[0].icon,
      forecast: dailyForecasts,
      recommendations: recommendations,
      updated_at: Date.now()
    });

  } catch (error) {
    return jsonResponse({ 
      error: 'Internal Server Error',
      details: error.message,
      stack: error.stack
    }, 500);
  }
}