import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchWeatherByCity } from './services/weatherService';

// Définition d'une structure pour la météo
interface Weather {
  id: number;
  city: string;
  country: string;
  temperature: number;
  description?: string;
  weather_description?: string; // Parfois l'API renvoie l'un ou l'autre
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

  // Effet pour le mode sombre - à modifier peut-être plus tard
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Basculer entre les modes
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Pour la saisie dans le champ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
  };

  // Fonction pour rechercher une ville
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); // stop le refresh de la page
    if (!city.trim()) return;
    
    setLoading(true);
    setError(null);
    // On remet à zéro pour le spinner
    setWeather(null);
    setDisplayCity(city);
    
    // Petit délai pour l'animation
    setTimeout(async () => {
      try {
        const data = await fetchWeatherByCity(city);
        console.log('Données météo récupérées:', data);
        setWeather(data);
      } catch (err) {
        setError('Impossible de trouver cette ville. Essayez une autre orthographe?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  // Chargement initial - première fois
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchWeatherByCity(displayCity);
        console.log('Données initiales:', data);
        setWeather(data);
      } catch (err) {
        setError('Impossible de récupérer les données météo. Veuillez réessayer.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []); // Pas de dépendance, juste au premier chargement

  // Pour débogage - à supprimer plus tard peut-être
  useEffect(() => {
    if (weather) {
      console.log('Weather object:', weather);
      console.log('Weather description:', weather.description);
      console.log('Weather_description:', weather.weather_description);
    }
  }, [weather]);

  // Choix de l'icône en fonction du temps
  const getWeatherIcon = (description: string) => {
    if (!description) return null;
    
    // Tout en minuscule pour comparer
    const lowerDesc = description.toLowerCase();
    
    // Cas spécial pour la pluie
    if (lowerDesc === "rain showers" || lowerDesc === "rain shower") {
      return getRainIcon();
    }
    
    // Vérifier si on parle de pluie
    const containsRain = lowerDesc.includes('rain');
    const containsShower = lowerDesc.includes('shower');
    const containsPluie = lowerDesc.includes('pluie');
    const containsPluvieux = lowerDesc.includes('pluvieux');
    const containsAverse = lowerDesc.includes('averse');
    const containsDrizzle = lowerDesc.includes('drizzle');
    
    // Tous les cas de pluie possibles
    const isRain = containsRain || 
                  containsShower || 
                  containsPluie || 
                  containsPluvieux || 
                  containsDrizzle || 
                  containsAverse;
    
    // Parce que s'il pleut, c'est plus important
    if (isRain) {
      return getRainIcon();
    }

    // Pour les nuages
    const isCloudy = lowerDesc.includes('nuage') || 
                    lowerDesc.includes('nuageux') || 
                    lowerDesc.includes('couvert') || 
                    lowerDesc.includes('cloud') || 
                    lowerDesc.includes('cloudy') || 
                    lowerDesc.includes('overcast');
    
    if (isCloudy) {
      return getCloudIcon(); // affiche nuage
    }

    // Par défaut c'est du soleil
    return getSunIcon();
  };

  // Pour afficher la pluie
  const getRainIcon = () => {
    return (
      <div className="weather-icon emoji-icon" key="rain-icon">
        🌧️
      </div>
    );
  };

  // Pour les nuages
  const getCloudIcon = () => {
    return (
      <div className="weather-icon emoji-icon" key="cloud-icon">
        ☁️
      </div>
    );
  };

  // Icône soleil
  const getSunIcon = () => {
    return (
      <div className="weather-icon emoji-icon" key="sun-icon">
        ☀️
      </div>
    );
  };

  // Cette fonction donne des conseils vestimentaires selon la météo
  const getWeatherAdvice = (description: string, temperature: number) => {
    // check si on a une description
    if (!description) return 'Bonne journée!';
    
    const lowercaseDesc = description.toLowerCase();
    
    // S'il pleut
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
    
    // S'il fait beau
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
    
    // S'il neige
    if (lowercaseDesc.includes('neige') || lowercaseDesc.includes('neigeux') ||
        lowercaseDesc.includes('snow') || lowercaseDesc.includes('snowy')) {
      return 'Habillez-vous chaudement';
    }
    
    // S'il y a du vent
    if (lowercaseDesc.includes('vent') || lowercaseDesc.includes('venteux') || 
        lowercaseDesc.includes('tempête') || lowercaseDesc.includes('rafale') ||
        lowercaseDesc.includes('wind') || lowercaseDesc.includes('windy') || 
        lowercaseDesc.includes('storm') || lowercaseDesc.includes('gust')) {
      return 'Attention au vent fort';
    }
    
    // Selon la température - j'ai ajouté mes préférences personnelles ici
    if (temperature < 5) {
      return 'Portez un manteau très chaud'; // trop froid pour moi
    }
    
    if (temperature < 10) {
      return 'Portez un manteau chaud';
    }
    
    if (temperature > 30) {
      return 'Restez hydraté et à l\'ombre'; // je déteste la chaleur
    }
    
    if (temperature > 28) {
      return 'Gardez-vous bien hydraté';
    }
    
    // Autres conditions
    if (lowercaseDesc.includes('nuage') || lowercaseDesc.includes('nuageux') || 
        lowercaseDesc.includes('couvert') || lowercaseDesc.includes('cloud') || 
        lowercaseDesc.includes('cloudy') || lowercaseDesc.includes('overcast')) {
      return 'Le temps peut changer, soyez préparé';
    }
    
    if (lowercaseDesc.includes('brouillard') || lowercaseDesc.includes('brume') ||
        lowercaseDesc.includes('fog') || lowercaseDesc.includes('mist')) {
      return 'Conduisez prudemment';
    }
    
    // Conseil par défaut
    return 'Habillez-vous selon la température';
  };

  // Icône pour le conseil (à revoir, pas très jolie)
  const getAdviceIcon = (description: string, temperature: number) => {
    // vérifier si on a une description
    if (!description) return null;
    
    const lowercaseDesc = description.toLowerCase();
    
    // Pour la pluie
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
    
    // Pour le soleil
    const isSunny = lowercaseDesc.includes('soleil') || 
                   lowercaseDesc.includes('ensoleillé') || 
                   lowercaseDesc.includes('clair') || 
                   lowercaseDesc.includes('dégagé') ||
                   lowercaseDesc.includes('sun') || 
                   lowercaseDesc.includes('sunny') || 
                   lowercaseDesc.includes('clear');
    
    const isHot = temperature > 25; // pour moi c'est chaud
    
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
    
    // Par défaut (vêtements)
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
        aria-label={darkMode ? "Mode jour" : "Mode nuit"}
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
      
      {loading && <div>Chargement en cours...</div>}

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
              
              {/* Le conseil vestimentaire */}
              <div className="weather-advice" key={`advice-${displayCity}`}>
                {/* J'ai eu un bug avec "Rain showers" alors je force l'icône */}
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
              {/* Fix pour les "Rain showers" */}
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