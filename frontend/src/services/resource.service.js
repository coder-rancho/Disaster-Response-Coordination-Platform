/* Copilot generated this */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const resourceService = {
  // Get all resources for a specific disaster
  async getDisasterResources(disasterId) {
    const response = await fetch(`${API_URL}/disasters/${disasterId}/resources`);
    if (!response.ok) throw new Error('Failed to fetch disaster resources');
    return response.json();
  },

  // Create a resource for a specific disaster
  async createResource(disasterId, resource) {
    const response = await fetch(`${API_URL}/disasters/${disasterId}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resource)
    });
    if (!response.ok) throw new Error('Failed to create resource');
    return response.json();
  },

  // Get nearby resources (disaster-independent)
  async getNearbyResources({ latitude, longitude, location_name, distance, type }) {
    const params = new URLSearchParams();
    if (latitude && longitude) {
      params.append('latitude', latitude);
      params.append('longitude', longitude);
    }
    if (location_name) params.append('location_name', location_name);
    if (distance) params.append('distance', distance);
    if (type) params.append('type', type);

    const response = await fetch(`${API_URL}/resources/nearby?${params}`);
    if (!response.ok) throw new Error('Failed to fetch nearby resources');
    return response.json();
  },

  // Delete a resource
  async deleteResource(disasterId, resourceId) {
    const response = await fetch(`${API_URL}/disasters/${disasterId}/resources/${resourceId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete resource');
    return response.json();
  }
};
