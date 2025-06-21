import axios from 'axios';
import { disasterService } from './disaster.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const reportService = {
  socket: disasterService.socket, // Reuse the same socket connection

  // Create a new report
  async create(disasterId, reportData) {
    const response = await axios.post(`${API_URL}/disasters/${disasterId}/reports`, reportData);
    return response.data;
  },

  // Get all reports for a disaster
  async getAllByDisasterId(disasterId) {
    const response = await axios.get(`${API_URL}/disasters/${disasterId}/reports`);
    return response.data;
  },

  // Get a single report
  async getById(disasterId, reportId) {
    const response = await axios.get(`${API_URL}/disasters/${disasterId}/reports/${reportId}`);
    return response.data;
  },

  // Update a report
  async update(disasterId, reportId, reportData) {
    const response = await axios.put(`${API_URL}/disasters/${disasterId}/reports/${reportId}`, reportData);
    return response.data;
  },

  // Delete a report
  async delete(disasterId, reportId) {
    const response = await axios.delete(`${API_URL}/disasters/${disasterId}/reports/${reportId}`);
    return response.data;
  },

  // Fetch all reports for a disaster
  async fetchReports(disasterId) {
    const response = await fetch(`${API_URL}/disasters/${disasterId}/reports`);
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
  },

  // Create a new report
  async createReport(disasterId, reportData) {
    const response = await fetch(`${API_URL}/disasters/${disasterId}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (!response.ok) throw new Error('Failed to create report');
    return response.json();
  },

  // Verify an image for a report
  async verifyImage(disasterId, imageUrl) {
    const response = await fetch(`${API_URL}/disasters/${disasterId}/verify-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl })
    });
    if (!response.ok) throw new Error('Failed to verify image');
    return response.json();
  }
};
