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
        error: 'Weather API key is missing in Cloudflare environment variables',
        mock: true,
        // ... (mock data omitted for brevity)
      }, 200); // Return 200 with error info to display in UI
    }

    const apiKey = env.OPENWEATHER_API_KEY.trim(); // Удаляем пробелы

    // 1. Запрос текущей погоды
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}&lang=${lang}`;
    
    // Логируем URL без ключа для отладки
    const debugUrl = currentWeatherUrl.replace(apiKey, 'HIDDEN_KEY');
    
    let currentResponse;
    try {
      currentResponse = await fetch(currentWeatherUrl);
    } catch (fetchError) {
      throw new Error(`Fetch failed for ${debugUrl}: ${fetchError.message}`);
    }
    
    if (!currentResponse.ok) {
      const errorText = await currentResponse.text();
      throw new Error(`OpenWeatherMap Current Weather Error (${currentResponse.status}): ${errorText}`);
    }
    
    const currentData = await currentResponse.json();

    // 2. Запрос прогноза
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}&lang=${lang}`;
    
    let forecastResponse;
    try {
      forecastResponse = await fetch(forecastUrl);
    } catch (fetchError) {
       // Если прогноз упал, но погода есть - не страшно, продолжим без прогноза
       console.error('Forecast fetch failed:', fetchError);
    }
    
    let dailyForecasts = [];
    if (forecastResponse && forecastResponse.ok) {
      const forecastData = await forecastResponse.json();
      const processedDays = new Set();
      
      for (const item of forecastData.list) {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toISOString().split('T')[0];
        
        if (!processedDays.has(dayKey) && dailyForecasts.length < 3) {
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
    // Возвращаем подробную ошибку клиенту
    return jsonResponse({ 
      error: `Backend Error: ${error.message}`,
      stack: error.stack
    }, 500);
  }
}