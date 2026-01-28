import { FC, useEffect, useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { weatherService, WeatherData } from '@/services/weather';
import './WeatherWidget.css';

export const WeatherWidget: FC = () => {
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

  return (
    <Card variant="glass" className="weather-widget">
      <div className="weather-widget__header">
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
        <span className="weather-widget__desc">{weather.description}</span>
      </div>

      <div className="weather-widget__main">
        <div className="weather-widget__temp-block">
          <img 
            src={weatherService.getWeatherIconUrl(weather.icon)} 
            alt={weather.description}
            className="weather-widget__icon"
          />
          <span 
            className="weather-widget__temp"
            style={{ color: weatherService.getTemperatureColor(weather.temperature) }}
          >
            {weather.temperature > 0 ? '+' : ''}{weather.temperature}°
          </span>
        </div>
        
        <div className="weather-widget__details">
          <div className="weather-widget__detail">
            <span>💧</span> {weather.humidity}%
          </div>
          <div className="weather-widget__detail">
            <span>💨</span> {weather.wind_speed} м/с, {weatherService.formatWindDirection(weather.wind_direction)}
          </div>
          <div className="weather-widget__detail">
            <span>🌡️</span> Ощущается как {weather.feels_like > 0 ? '+' : ''}{weather.feels_like}°
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
          <div key={idx} className="weather-widget__forecast-day">
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