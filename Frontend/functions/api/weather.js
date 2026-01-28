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

    if (!env.OPENWEATHER_API_KEY) {
      return jsonResponse({ 
        error: 'Weather API key is missing in Cloudflare environment variables',
        mock: true,
        data: {
          city: city,
          temperature: 22,
          feels_like: 25,
          humidity: 65,
          pressure: 1013,
          wind_speed: 3.5,
          wind_direction: 'SW',
          description: 'Ясно',
          icon: '01d',
          forecast: [
            { day: 'Сегодня', temp: 22, description: 'Ясно', icon: '01d' },
            { day: 'Завтра', temp: 24, description: 'Облачно', icon: '03d' },
            { day: 'Послезавтра', temp: 19, description: 'Дождь', icon: '10d' }
          ]
        }
      });
    }

    // Получаем текущую погоду
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${env.OPENWEATHER_API_KEY}&units=${units}&lang=${lang}`;
    const currentResponse = await fetch(currentWeatherUrl);
    
    if (!currentResponse.ok) {
      const errorText = await currentResponse.text();
      throw new Error(`Weather API error: ${currentResponse.status} ${currentResponse.statusText} - ${errorText}`);
    }
    
    const currentData = await currentResponse.json();

    // Получаем прогноз на 3 дня
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${env.OPENWEATHER_API_KEY}&units=${units}&lang=${lang}`;
    const forecastResponse = await fetch(forecastUrl);
    
    if (!forecastResponse.ok) {
      const errorText = await forecastResponse.text();
      throw new Error(`Forecast API error: ${forecastResponse.status} ${forecastResponse.statusText} - ${errorText}`);
    }
    
    const forecastData = await forecastResponse.json();

    // Обрабатываем прогноз - берем по одному прогнозу на день
    const dailyForecasts = [];
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

    // Определяем рекомендации для садовода
    const recommendations = [];
    const temp = currentData.main.temp;
    const humidity = currentData.main.humidity;
    const windSpeed = currentData.wind.speed;
    const weatherMain = currentData.weather[0].main.toLowerCase();

    if (temp < 5) {
      recommendations.push('❄️ Внимание! Низкая температура - прикройте растения');
    } else if (temp > 30) {
      recommendations.push('🔥 Жарко! Увеличьте полив и создайте тень');
    }

    if (weatherMain.includes('rain')) {
      recommendations.push('🌧️ Дождь - отмените полив, проверьте дренаж');
    } else if (humidity < 40) {
      recommendations.push('💧 Низкая влажность - увеличьте полив');
    }

    if (windSpeed > 10) {
      recommendations.push('💨 Сильный ветер - закрепите высокие растения');
    }

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
    console.error('Weather API Error:', error);
    return jsonResponse({ 
      error: 'Failed to fetch weather data',
      details: error.message 
    }, 500);
  }
}