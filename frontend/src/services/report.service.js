import { disasterService } from './disaster.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const reportService = {
  socket: disasterService.socket, // Reuse the same socket connection

  // Create a new report
  async createReport(disasterId, reportData) {
    const response = await fetch(`${API_URL}/disasters/${disasterId}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: reportData.content,
        image_url: reportData.imageUrl
      })
    });
    if (!response.ok) throw new Error('Failed to create report');
    return response.json();
  },

  // Get all reports for a disaster
  async getAllByDisasterId(disasterId) {
    const response = await fetch(`${API_URL}/disasters/${disasterId}/reports`);
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
  },

  // Update a report
  async update(disasterId, reportId, reportData) {
    const response = await fetch(`${API_URL}/disasters/${disasterId}/reports/${reportId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (!response.ok) throw new Error('Failed to update report');
    return response.json();
  },

  // Verify an image
  async verifyImage(disasterId, imageUrl) {
    const response = await fetch(`${API_URL}/disasters/${disasterId}/reports/verify-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl })
    });
    if (!response.ok) throw new Error('Failed to verify image');
    return response.json();
  },

  // Note: Image verification is now handled automatically by the backend during report creation
};
