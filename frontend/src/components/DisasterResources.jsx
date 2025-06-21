/* Copilot generated this */
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resourceService } from '../services/resource.service';

const RESOURCE_TYPES = ['shelter', 'food', 'medical', 'water', 'supplies'];

export default function DisasterResources() {
  const { disasterId } = useParams();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location_name: '',
    type: RESOURCE_TYPES[0]
  });

  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      const data = await resourceService.getDisasterResources(disasterId);
      setResources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [disasterId]);

  useEffect(() => {
    const fetchResources = async () => {
      await loadResources();
    };
    fetchResources();
  }, [loadResources]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await resourceService.createResource(disasterId, formData);
      setFormData({ name: '', location_name: '', type: RESOURCE_TYPES[0] });
      setShowForm(false);
      await loadResources(); // Reload the list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      setLoading(true);
      await resourceService.deleteResource(disasterId, resourceId);
      await loadResources(); // Reload the list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            ← Back to Disasters
          </Link>
          <h2 className="text-xl font-semibold">Disaster Resources</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : 'Add Resource'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              placeholder="e.g., 123 Main St, New York, NY"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            >
              {RESOURCE_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Resource'}
          </button>
        </form>
      )}

      {loading && <div className="text-center">Loading...</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resources.map(resource => (
          <div key={resource.id} className="border rounded p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{resource.name}</h3>
                <p className="text-sm text-gray-600">{resource.location_name}</p>
                <span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-gray-100">
                  {resource.type}
                </span>
              </div>
              <button
                onClick={() => handleDelete(resource.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && resources.length === 0 && (
        <p className="text-center text-gray-500">No resources found for this disaster.</p>
      )}
    </div>
  );
}
