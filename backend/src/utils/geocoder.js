import axios from 'axios';

/**
 * Convert a location name to geographical coordinates using Nominatim
 * @param {string} locationName - The name of the location to geocode
 * @returns {Promise<string>} A PostGIS-formatted point string
 * @throws {Error} If the location cannot be found or if the API call fails
 */
export const getCoordinates = async (locationName) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: locationName,
        format: 'jsonv2',
        limit: 1
      },
      headers: {
        'User-Agent': 'Disaster-Response-Platform/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      // Return in PostGIS format
      return `SRID=4326;POINT(${lon} ${lat})`;
    }
    throw new Error('Location not found');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode location');
  }
};
