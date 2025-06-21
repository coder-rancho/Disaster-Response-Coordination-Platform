import { useState } from 'react';
import { disasterService } from '../services/disaster.service';

export default function DisasterForm({ onDisasterCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      // Convert tags string to array
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      const disaster = await disasterService.create({
        ...formData,
        tags: tagsArray,
        // Hardcoded location for now (will be replaced with geocoding)
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128] // NYC coordinates
        }
      });

      onDisasterCreated(disaster);
      
      // Reset form
      setFormData({
        title: '',
        location_name: '',
        description: '',
        tags: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create disaster');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Report New Disaster</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description (Include location details)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            placeholder="Describe the disaster and include location information, e.g., 'Heavy flooding in Manhattan, NYC has affected multiple neighborhoods...'"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="flood, urgent, evacuation"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Report Disaster
        </button>
      </form>
    </div>
  );
}
