import { FC, useEffect, useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { weatherService, WeatherData } from '@/services/weather';
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
        <div className="weather-widget__header">
          <div className="weather-widget__location" onClick={() => {
            setNewCity(city);
            setIsEditing(true);
          }}>
            <span className="weather-widget__city">{weather.city}</span>
            <span className="weather-widget__edit-icon">✎</span>
          </div>
        </div>
        <div className="weather-widget__error-msg">
          ⚠️ {weather.recommendations[0] || weather.error}
        </div>
        {isEditing && (
          <div className="weather-widget__city-edit">
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
      <div className="weather-widget__header">
        <div className="weather-widget__header-left">
          {isEditing ? (
            <div className="weather-widget__city-edit">
              <Input 
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Введите город"
                autoFocus
              />
              <Button variant="chip" onClick={handleCitySubmit}>OK</Button>
              <Button variant="chip" onClick={() => setIsEditing(false)}>✕</Button>
            </div>
          ) : (
            <div className="weather-widget__location" onClick={() => {
              setNewCity(city);
              setIsEditing(true);
            }}>
              <span className="weather-widget__city">{weather.city}</span>
              <span className="weather-widget__edit-icon">✎</span>
            </div>
          )}
          {(lunarPhase || zodiacSign) && (
            <div className="weather-widget__lunar">
              {lunarPhase && <span>🌑 {lunarPhase}</span>}
              {zodiacSign && <span> • {zodiacSign}</span>}
            </div>
          )}
        </div>
        
        {currentTime && (
          <div className="weather-widget__time">
            {currentTime}
          </div>
        )}
      </div>

      <div className="weather-widget__main">
        <div className="weather-widget__temp-block">
          <img 
            src={weatherService.getWeatherIconUrl(weather.icon)} 
            alt={weather.description}
            className="weather-widget__icon"
          />
          <div className="weather-widget__temp-info">
            <span 
              className="weather-widget__temp"
              style={{ color: weatherService.getTemperatureColor(weather.temperature) }}
            >
              {weather.temperature > 0 ? '+' : ''}{weather.temperature}°
            </span>
            <span className="weather-widget__desc">{weather.description}</span>
          </div>
        </div>
        
        <div className="weather-widget__details">
          <div className="weather-widget__detail">
            <span>💧</span> {weather.humidity}%
          </div>
          <div className="weather-widget__detail">
            <span>💨</span> {weather.wind_speed} м/с
          </div>
          <div className="weather-widget__detail">
            <span>🌡️</span> Ощ. {weather.feels_like > 0 ? '+' : ''}{weather.feels_like}°
          </div>
        </div>
      </div>

      {weather.recommendations && weather.recommendations.length > 0 && (
        <div className="weather-widget__recommendations">
          {weather.recommendations.map((rec, idx) => (
            <p key={idx} className="weather-widget__rec">{rec}</p>
          ))}
        </div>
      )}

      <div className="weather-widget__forecast">
        {weather.forecast && weather.forecast.map((day, idx) => (
          <div key={idx} className="weather-widget__day">
            <span className="weather-widget__day-name">{day.day}</span>
            <img 
              src={weatherService.getWeatherIconUrl(day.icon)} 
              alt={day.description}
              className="weather-widget__day-icon"
            />
            <span className="weather-widget__day-temp">
              {day.temp > 0 ? '+' : ''}{day.temp}°
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};