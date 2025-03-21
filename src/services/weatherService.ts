import axios from 'axios';

// Je crois que c'est plus simple de faire comme ça pour l'API
const isDevelopment = import.meta.env.DEV;
// J'ai mis ça comme ça marchait pas en local
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://freetestapi.com';
// URL différente selon l'environnement
const API_URL = isDevelopment 
  ? '/api/v1/weathers' // en dev on utilise le proxy vite
  : `${API_BASE_URL}/api/v1/weathers`;  // en prod on met l'URL complète

// Fonction pour rechercher la météo d'une ville
export const fetchWeatherByCity = async (city: string) => {
  try {
    // J'utilise l'encode pour les accents et espaces
    const response = await axios.get(`${API_URL}?search=${encodeURIComponent(city)}`);
    // Je prends seulement le premier résultat car l'API renvoie un tableau
    return response.data[0]; // Normalement y a qu'un résultat mais on sait jamais
  } catch (error) {
    console.error('Erreur lors de la récupération des données météo:', error);
    // Je relance l'erreur pour pouvoir l'attraper ailleurs
    throw error;
  }
}; 