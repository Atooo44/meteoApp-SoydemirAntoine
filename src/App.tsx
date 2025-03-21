import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchWeatherByCity } from './services/weatherService';

interface Weather {
  id: number;
  city: string;
  country: string;
  temperature: number;
  description?: string;
  weather_description?: string;
  humidity: number;
  windSpeed: number;
  date: string;
}

function App() {
  const [city, setCity] = useState('Paris');
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayCity, setDisplayCity] = useState('Paris');
  const [darkMode, setDarkMode] = useState(false);

  // Effet pour appliquer le mode sombre
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Fonction pour basculer le mode sombre
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Séparer la modification du champ input de la recherche
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire
    if (!city.trim()) return;
    
    setLoading(true);
    setError(null);
    // Réinitialiser l'état weather pour forcer un nouveau rendu
    setWeather(null);
    setDisplayCity(city);
    
    // Petit délai pour assurer que les anciennes icônes ont disparu
    setTimeout(async () => {
      try {
        const data = await fetchWeatherByCity(city);
        console.log('Weather data:', data);
        setWeather(data);
      } catch (err) {
        setError('Impossible de récupérer les données météo. Veuillez réessayer.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  // Recherche initiale au chargement de la page
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchWeatherByCity(displayCity);
        console.log('Initial weather data:', data);
        setWeather(data);
      } catch (err) {
        setError('Impossible de récupérer les données météo. Veuillez réessayer.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Effet pour afficher les données météo pour le débogage
  useEffect(() => {
    if (weather) {
      console.log('Weather object:', weather);
      console.log('Weather description:', weather.description);
      console.log('Weather_description:', weather.weather_description);
    }
  }, [weather]);

  const getWeatherIcon = (description: string) => {
    if (!description) return null;
    
    // Forcer la description en minuscules pour la comparaison
    const lowerDesc = description.toLowerCase();
    
    // Vérification explicite pour "rain showers"
    if (lowerDesc === "rain showers" || lowerDesc === "rain shower") {
      return getRainIcon();
    }
    
    // Vérifier explicitement si la description contient "rain" ou "shower"
    const containsRain = lowerDesc.includes('rain');
    const containsShower = lowerDesc.includes('shower');
    const containsPluie = lowerDesc.includes('pluie');
    const containsPluvieux = lowerDesc.includes('pluvieux');
    const containsAverse = lowerDesc.includes('averse');
    const containsDrizzle = lowerDesc.includes('drizzle');
    
    // Conditions de pluie (français et anglais)
    // Test pour la pluie
    const isRain = containsRain || 
                  containsShower || 
                  containsPluie || 
                  containsPluvieux || 
                  containsDrizzle || 
                  containsAverse;
    
    // Les conditions de pluie ont priorité
    if (isRain) {
      return getRainIcon();
    }

    // Test pour les nuages
    const isCloudy = lowerDesc.includes('nuage') || 
                    lowerDesc.includes('nuageux') || 
                    lowerDesc.includes('couvert') || 
                    lowerDesc.includes('cloud') || 
                    lowerDesc.includes('cloudy') || 
                    lowerDesc.includes('overcast');
    
    if (isCloudy) {
      return getCloudIcon();
    }

    // Par défaut, soleil
    return getSunIcon();
  };

  // Fonction pour l'icône de pluie
  const getRainIcon = () => {
    return (
      <div className="weather-icon emoji-icon" key="rain-icon">
        🌧️
      </div>
    );
  };

  // Fonction pour l'icône de nuage
  const getCloudIcon = () => {
    return (
      <div className="weather-icon emoji-icon" key="cloud-icon">
        ☁️
      </div>
    );
  };

  // Fonction pour l'icône de soleil
  const getSunIcon = () => {
    return (
      <div className="weather-icon emoji-icon" key="sun-icon">
        ☀️
      </div>
    );
  };

  const getWeatherAdvice = (description: string, temperature: number) => {
    // Vérifier si description existe
    if (!description) return 'Bonne journée!';
    
    const lowercaseDesc = description.toLowerCase();
    
    // Condition pluie (français et anglais)
    const isRain = lowercaseDesc.includes('pluie') || 
                  lowercaseDesc.includes('pluvieux') || 
                  lowercaseDesc.includes('averse') || 
                  lowercaseDesc.includes('bruine') ||
                  lowercaseDesc.includes('rain') || 
                  lowercaseDesc.includes('shower') || 
                  lowercaseDesc.includes('drizzle');
    
    if (isRain) {
      return 'Prenez votre parapluie';
    }
    
    // Conditions ensoleillées (français et anglais)
    if (lowercaseDesc.includes('soleil') || lowercaseDesc.includes('ensoleillé') || 
        lowercaseDesc.includes('clair') || lowercaseDesc.includes('dégagé') ||
        lowercaseDesc.includes('sun') || lowercaseDesc.includes('sunny') || 
        lowercaseDesc.includes('clear')) {
      if (temperature > 25) {
        return 'Pensez à votre crème solaire';
      } else {
        return 'Sortez vos lunettes de soleil';
      }
    }
    
    // Conditions neigeuses (français et anglais)
    if (lowercaseDesc.includes('neige') || lowercaseDesc.includes('neigeux') ||
        lowercaseDesc.includes('snow') || lowercaseDesc.includes('snowy')) {
      return 'Habillez-vous chaudement';
    }
    
    // Conditions venteuses (français et anglais)
    if (lowercaseDesc.includes('vent') || lowercaseDesc.includes('venteux') || 
        lowercaseDesc.includes('tempête') || lowercaseDesc.includes('rafale') ||
        lowercaseDesc.includes('wind') || lowercaseDesc.includes('windy') || 
        lowercaseDesc.includes('storm') || lowercaseDesc.includes('gust')) {
      return 'Attention au vent fort';
    }
    
    // Conseils basés sur la température
    if (temperature < 5) {
      return 'Portez un manteau très chaud';
    }
    
    if (temperature < 10) {
      return 'Portez un manteau chaud';
    }
    
    if (temperature > 30) {
      return 'Restez hydraté et à l\'ombre';
    }
    
    if (temperature > 28) {
      return 'Gardez-vous bien hydraté';
    }
    
    // Conseils par défaut pour d'autres conditions (français et anglais)
    if (lowercaseDesc.includes('nuage') || lowercaseDesc.includes('nuageux') || 
        lowercaseDesc.includes('couvert') || lowercaseDesc.includes('cloud') || 
        lowercaseDesc.includes('cloudy') || lowercaseDesc.includes('overcast')) {
      return 'Le temps peut changer, soyez préparé';
    }
    
    if (lowercaseDesc.includes('brouillard') || lowercaseDesc.includes('brume') ||
        lowercaseDesc.includes('fog') || lowercaseDesc.includes('mist')) {
      return 'Conduisez prudemment';
    }
    
    // Conseil par défaut si aucune condition spécifique n'est détectée
    return 'Habillez-vous selon la température';
  };

  // Icône pour le conseil vestimentaire
  const getAdviceIcon = (description: string, temperature: number) => {
    // Vérifier si description existe
    if (!description) return null;
    
    const lowercaseDesc = description.toLowerCase();
    
    // Icônes pour la pluie (français et anglais)
    const isRain = lowercaseDesc.includes('pluie') || 
                  lowercaseDesc.includes('pluvieux') || 
                  lowercaseDesc.includes('averse') || 
                  lowercaseDesc.includes('bruine') ||
                  lowercaseDesc.includes('rain') || 
                  lowercaseDesc.includes('shower') || 
                  lowercaseDesc.includes('drizzle');
    
    if (isRain) {
      return (
        <svg className="advice-icon" viewBox="0 0 24 24" width="16" height="16" key="rain-advice-icon">
          <path
            fill="currentColor"
            d="M12,4C6.5,4,2,8.5,2,14c0,5.5,4.5,10,10,10s10-4.5,10-10C22,8.5,17.5,4,12,4z M12,7c1.7,0,3,1.3,3,3s-1.3,3-3,3s-3-1.3-3-3 S10.3,7,12,7z M12,21c-2.8,0-5.3-1.3-7-3.4c0-2.3,4.7-3.6,7-3.6s7,1.3,7,3.6C17.3,19.7,14.8,21,12,21z"
          />
        </svg>
      );
    }
    
    // Conditions ensoleillées
    const isSunny = lowercaseDesc.includes('soleil') || 
                   lowercaseDesc.includes('ensoleillé') || 
                   lowercaseDesc.includes('clair') || 
                   lowercaseDesc.includes('dégagé') ||
                   lowercaseDesc.includes('sun') || 
                   lowercaseDesc.includes('sunny') || 
                   lowercaseDesc.includes('clear');
    
    const isHot = temperature > 25;
    
    if (isSunny || isHot) {
      return (
        <svg className="advice-icon" viewBox="0 0 24 24" width="16" height="16" key="sun-advice-icon">
          <path
            fill="currentColor"
            d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M12,17c-2.8,0-5-2.2-5-5s2.2-5,5-5s5,2.2,5,5 S14.8,17,12,17z"
          />
        </svg>
      );
    }
    
    // Icône par défaut (habillement)
    return (
      <svg className="advice-icon" viewBox="0 0 24 24" width="16" height="16" key="default-advice-icon">
        <path
          fill="currentColor"
          d="M10,3L8,9h8l-2-6H10z M12,11c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S13.1,11,12,11z M14,21v-4c0-1.1-0.9-2-2-2s-2,0.9-2,2 v4H14z"
        />
      </svg>
    );
  };

  return (
    <div className="app-container">
      <button 
        className="dark-mode-toggle" 
        onClick={toggleDarkMode}
        aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
      
      <form onSubmit={handleSearch} className="search-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          type="text"
          value={city}
          onChange={handleInputChange}
          placeholder="Rechercher une ville..."
          className="search-input"
        />
      </form>

      {error && <div className="error-message">{error}</div>}
      
      {loading && <div>Chargement...</div>}

      {weather && !loading && !error && (
        <div className="weather-card">
          <div className="location-info">
            <span className="city-name">{weather.city.toUpperCase()}</span>
            <span className="dot">·</span>
            <span className="country">{weather.country ? weather.country.toUpperCase() : 'FRANCE'}</span>
          </div>
          
          <div className="weather-display">
            <div className="temperature-section">
              <div className="temp-value">{Math.round(weather.temperature)}°C</div>
              <div className="description">{weather.weather_description || weather.description}</div>
              
              {/* Affichage du conseil vestimentaire - simplifié pour garantir l'affichage */}
              <div className="weather-advice" key={`advice-${displayCity}`}>
                {/* Forcer l'icône de conseil pour la pluie si "Rain showers" */}
                {(weather.weather_description === "Rain showers" || weather.weather_description === "Rainy") ? (
                  <>
                    <svg className="advice-icon" viewBox="0 0 24 24" width="16" height="16" key="rain-advice-icon">
                      <path
                        fill="currentColor"
                        d="M12,4C6.5,4,2,8.5,2,14c0,5.5,4.5,10,10,10s10-4.5,10-10C22,8.5,17.5,4,12,4z M12,7c1.7,0,3,1.3,3,3s-1.3,3-3,3s-3-1.3-3-3 S10.3,7,12,7z M12,21c-2.8,0-5.3-1.3-7-3.4c0-2.3,4.7-3.6,7-3.6s7,1.3,7,3.6C17.3,19.7,14.8,21,12,21z"
                      />
                    </svg>
                    <span>Prenez votre parapluie</span>
                  </>
                ) : (
                  <>
                    {getAdviceIcon(weather.weather_description || weather.description || '', weather.temperature)}
                    <span>{getWeatherAdvice(weather.weather_description || weather.description || '', weather.temperature) || 'Bonne journée!'}</span>
                  </>
                )}
              </div>
            </div>
            <div className="icon-container" key={`icon-${displayCity}`}>
              {/* Forcer l'icône de pluie pour "Rain showers" */}
              {(weather.weather_description === "Rain showers" || weather.weather_description === "Rainy") ? 
                getRainIcon() : 
                getWeatherIcon(weather.weather_description || weather.description || '')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 