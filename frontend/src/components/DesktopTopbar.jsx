import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from './Toast';

function weatherIcon(code) {
  if (code === 0) return '☀️';
  if ([1, 2].includes(code)) return '🌤️';
  if (code === 3) return '☁️';
  if ([45, 48].includes(code)) return '🌫️';
  if (code >= 51 && code <= 67) return '🌦️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 95) return '⛈️';
  return '⛅';
}

export default function DesktopTopbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Listen for local storage updates to reactively update location and weather
  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };
    window.addEventListener('user-updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, []);

  useEffect(() => {
    if (!user.district || !user.state) {
      setWeather(null);
      setWeatherError(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setWeatherError(false);

    const fetchWeather = (lat, lng) => {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`)
        .then(r => {
          if (!r.ok) throw new Error('Weather fetch failed');
          return r.json();
        })
        .then(weatherData => {
          if (cancelled) return;
          if (weatherData && weatherData.current_weather) {
            setWeather(weatherData.current_weather);
            setWeatherError(false);
          } else {
            throw new Error('Weather data unavailable');
          }
        })
        .catch(err => {
          if (!cancelled) {
            console.error('Error fetching weather:', err);
            setWeather(null);
            setWeatherError(true);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    };

    // If coordinates are already stored in the user profile, use them directly
    if (user.latitude && user.longitude) {
      fetchWeather(parseFloat(user.latitude), parseFloat(user.longitude));
    } else {
      // Otherwise, resolve coordinates dynamically on the fly using the Geocoding API
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(user.district)}&count=10&language=en&format=json`;

      fetch(geoUrl)
        .then(r => {
          if (!r.ok) throw new Error('Geocoding request failed');
          return r.json();
        })
        .then(geoData => {
          if (cancelled) return;
          if (!geoData.results || geoData.results.length === 0) {
            throw new Error('No location coordinates found');
          }

          // Search for the best match in India matching the user's state, or any match in India, or the first result
          const bestMatch = geoData.results.find(res => 
            (res.country_code === 'IN' || res.country === 'India') &&
            (res.admin1?.toLowerCase() === user.state.toLowerCase())
          ) || geoData.results.find(res => res.country_code === 'IN' || res.country === 'India')
            || geoData.results[0];

          if (!bestMatch) {
            throw new Error('No suitable location coordinates resolved');
          }

          fetchWeather(bestMatch.latitude, bestMatch.longitude);
        })
        .catch(err => {
          if (!cancelled) {
            console.error('Dynamic geocoding failed:', err);
            setWeather(null);
            setWeatherError(true);
            setLoading(false);
          }
        });
    }

    return () => { cancelled = true; };
  }, [user.district, user.state, user.latitude, user.longitude]);

  const hasLocation = user.district && user.state;
  const locationLabel = hasLocation ? `${user.district}, ${user.state}` : 'Location unknown';

  return (
    <header className="desktop-topbar">
      <div className="desktop-topbar-location">
        <span className="desktop-topbar-pin">📍</span>
        <span>{locationLabel}</span>
      </div>
      <div className="desktop-topbar-right">
        <div className="desktop-topbar-weather">
          {loading ? (
            <span>⛅ Loading...</span>
          ) : weatherError || !weather ? (
            <span>🌤️ Weather unavailable</span>
          ) : (
            <>
              <span>{weatherIcon(weather.weathercode)}</span>
              <span>{Math.round(weather.temperature)}°C</span>
            </>
          )}
        </div>
        <button className="desktop-topbar-bell" onClick={() => showToast('No new notifications', 'success')}>
          🔔<span className="desktop-topbar-bell-dot" />
        </button>
        <button className="desktop-topbar-avatar" onClick={() => navigate('/profile')}>
          {initials}
        </button>
      </div>
    </header>
  );
}
