import axios from 'axios';

// Use direct API URL for production and a relative URL for development
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://freetestapi.com';
const API_URL = isDevelopment 
  ? '/api/v1/weathers' 
  : `${API_BASE_URL}/api/v1/weathers`;

export const fetchWeatherByCity = async (city: string) => {
  try {
    const response = await axios.get(`${API_URL}?search=${encodeURIComponent(city)}`);
    return response.data[0];
  } catch (error) {
    console.error('Erreur lors de la récupération des données météo:', error);
    throw error;
  }
}; 