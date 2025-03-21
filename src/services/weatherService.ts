import axios from 'axios';

const API_URL = '/api/v1/weathers';

export const fetchWeatherByCity = async (city: string) => {
  try {
    const response = await axios.get(`${API_URL}?search=${encodeURIComponent(city)}`);
    return response.data[0];
  } catch (error) {
    console.error('Erreur lors de la récupération des données météo:', error);
    throw error;
  }
}; 