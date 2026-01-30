import { FC, useEffect, useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { weatherService, WeatherData } from '@/services/weather';
import { AnimatedIcon } from '@/components/AnimatedIcon/AnimatedIcon';
import './WeatherWidget.css';

interface WeatherWidgetProps {
  currentTime?: string;
  lunarPhase?: string;
  zodiacSign?: string;
}

export const WeatherWidget: FC<WeatherWidgetProps> = ({ 
  currentTime, 
  lunarPhase, 
  zodiacSign 
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('Chelyabinsk');
  const [isEditing, setIsEditing] = useState(false);
  const [newCity, setNewCity] = useState('');

  const loadWeather = async (cityName: string) => {
    setLoading(true);
    try {
      const data = await weatherService.getWeather(cityName);
      setWeather(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(city);
  }, [city]);

  const handleCitySubmit = () => {
    if (newCity.trim()) {
      setCity(newCity.trim());
      setIsEditing(false);
    }
  };

  if (loading && !weather) {
    return (
      <Card variant="glass" className="weather-widget weather-widget--loading">
        <p className="weather-widget__loader">Загрузка погоды...</p>
      </Card>
    );
  }

  if (!weather) return null;

  if (weather.error) {
    return (
      <Card variant="glass" className="weather-widget weather-widget--error">
        <div className="weather-widget__header-compact">
          <div className="weather-widget__location-compact" onClick={() => {
            setNewCity(city);
            setIsEditing(true);
          }}>
            <span className="weather-widget__city">{weather.city}</span>
            <span className="weather-widget__edit-icon">✎</span>
          </div>
          {currentTime && <div className="weather-widget__time-compact">{currentTime}</div>}
        </div>
        <div className="weather-widget__error-msg">
          ⚠️ {weather.recommendations[0] || weather.error}
        </div>
        {isEditing && (
          <div className="weather-widget__city-edit-compact">
            <Input 
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder="Введите город"
              autoFocus
            />
            <Button variant="chip" onClick={handleCitySubmit}>OK</Button>
            <Button variant="chip" onClick={() => setIsEditing(false)}>✕</Button>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card variant="glass" className="weather-widget">
      {/* Compact Header */}
      <div className="weather-widget__header-compact">
        <div className="weather-widget__location-compact" onClick={() => {
          setNewCity(city);
          setIsEditing(true);
        }}>
          <span className="weather-widget__city">{weather.city}</span>
          <span className="weather-widget__edit-icon">✎</span>
        </div>
        
        <div className="weather-widget__header-right">
          {currentTime && <div className="weather-widget__time-compact">{currentTime}</div>}
          {(lunarPhase || zodiacSign) && (
            <div className="weather-widget__lunar-compact">
              {lunarPhase && <span>🌑 {lunarPhase}</span>}
              {zodiacSign && <span> • {zodiacSign}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Compact Main Weather */}
      <div className="weather-widget__main-compact">
        <div className="weather-widget__temp-block-compact">
          <img 
            src={weatherService.getWeatherIconUrl(weather.icon)} 
            alt={weather.description}
            className="weather-widget__icon-compact"
          />
          <div className="weather-widget__temp-info-compact">
            <span 
              className="weather-widget__temp-compact"
              style={{ color: weatherService.getTemperatureColor(weather.temperature) }}
            >
              {weather.temperature > 0 ? '+' : ''}{weather.temperature}°
            </span>
            <span className="weather-widget__desc-compact">{weather.description}</span>
          </div>
        </div>
        
        <div className="weather-widget__details-compact">
          <div className="weather-widget__detail-pill">
            <AnimatedIcon name="water" size={14} />
            <span>{weather.humidity}%</span>
          </div>
          <div className="weather-widget__detail-pill">
            <AnimatedIcon name="cloud" size={14} />
            <span>{weather.wind_speed} м/с</span>
          </div>
          <div className="weather-widget__detail-pill">
            <AnimatedIcon name="sun" size={14} />
            <span>Ощ. {weather.feels_like > 0 ? '+' : ''}{weather.feels_like}°</span>
          </div>
        </div>
      </div>

      {/* Compact Recommendations */}
      {weather.recommendations && weather.recommendations.length > 0 && (
        <div className="weather-widget__recommendations-compact">
          {weather.recommendations.map((rec, idx) => (
            <p key={idx} className="weather-widget__rec-compact">{rec}</p>
          ))}
        </div>
      )}

      {/* Compact Forecast */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="weather-widget__forecast-compact">
          {weather.forecast.map((day, idx) => (
            <div key={idx} className="weather-widget__day-compact">
              <span className="weather-widget__day-name-compact">{day.day}</span>
              <img 
                src={weatherService.getWeatherIconUrl(day.icon)} 
                alt={day.description}
                className="weather-widget__day-icon-compact"
              />
              <span className="weather-widget__day-temp-compact">
                {day.temp > 0 ? '+' : ''}{day.temp}°
              </span>
            </div>
          ))}
        </div>
      )}

      {/* City Edit (if needed) */}
      {isEditing && (
        <div className="weather-widget__city-edit-compact">
          <Input 
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            placeholder="Введите город"
            autoFocus
          />
          <Button variant="chip" onClick={handleCitySubmit}>OK</Button>
          <Button variant="chip" onClick={() => setIsEditing(false)}>✕</Button>
        </div>
      )}
    </Card>
  );
};