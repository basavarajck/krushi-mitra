
import React, { useState, useEffect } from 'react';
import { getWeatherForecast } from '../services/geminiService';
import { WeatherForecast, WeatherDay } from '../types';
import { SunIcon, CloudIcon, RainIcon } from './icons/Icons';

interface WeatherWidgetProps {
  location: string;
}

const WeatherIcon: React.FC<{ condition: string }> = ({ condition }) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
        return <RainIcon className="h-8 w-8 text-blue-500" />;
    }
    if (lowerCondition.includes('cloud')) {
        return <CloudIcon className="h-8 w-8 text-gray-500" />;
    }
    return <SunIcon className="h-8 w-8 text-yellow-500" />;
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location }) => {
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const forecastString = await getWeatherForecast(location);
        const forecastData = JSON.parse(forecastString);
        if (forecastData.error) {
            setError(forecastData.error);
        } else {
            setWeather(forecastData);
        }
      } catch (e) {
        setError('Failed to parse weather data.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
      <h3 className="font-bold text-lg mb-2 text-green-700 dark:text-green-300">Weather Forecast</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{location}</p>
      
      {loading && <p>Loading weather...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {weather && (
        <div className="space-y-3">
          {weather.forecast.slice(0, 5).map((day: WeatherDay, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <WeatherIcon condition={day.condition} />
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{day.day}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{day.condition}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{day.temp_high}° / {day.temp_low}°C</p>
                <p className="text-xs text-blue-500 dark:text-blue-300">{day.precipitation_chance}% rain</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
