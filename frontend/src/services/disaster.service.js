import axios from 'axios';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');

export const disasterService = {
  socket,

  // Create a new disaster
  async create(disasterData) {
    const response = await axios.post(`${API_URL}/disasters`, disasterData);
    return response.data;
  },

  // Get all disasters
  async getAll(tag = '') {
    const response = await axios.get(`${API_URL}/disasters${tag ? `?tag=${tag}` : ''}`);
    return response.data;
  },

  // Get a single disaster
  async getById(id) {
    const response = await axios.get(`${API_URL}/disasters/${id}`);
    return response.data;
  },

  // Update a disaster
  async update(id, disasterData) {
    const response = await axios.put(`${API_URL}/disasters/${id}`, disasterData);
    return response.data;
  },

  // Delete a disaster
  async delete(id) {
    const response = await axios.delete(`${API_URL}/disasters/${id}`);
    return response.data;
  }
};
