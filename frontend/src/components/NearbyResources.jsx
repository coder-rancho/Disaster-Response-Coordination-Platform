/* Copilot generated this */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resourceService } from '../services/resource.service';

const RESOURCE_TYPES = ['all', 'shelter', 'food', 'medical', 'water', 'supplies'];
const DISTANCE_OPTIONS = [
  { label: '1 km', value: 1000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
  { label: '20 km', value: 20000 },
  { label: '50 km', value: 50000 }
];

export default function NearbyResources() {
  const [searchParams, setSearchParams] = useState({
    location_name: '',
    type: 'all',
    distance: 10000
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      let searchQuery = { ...searchParams };
      
      if (useCurrentLocation) {
        const position = await getCurrentPosition();
        searchQuery = {
          ...searchQuery,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        delete searchQuery.location_name;
      }

      if (searchQuery.type === 'all') {
        delete searchQuery.type;
      }

      const data = await resourceService.getNearbyResources(searchQuery);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link
          to="/"
          className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
        >
          ← Back to Home
        </Link>
        <h2 className="text-xl font-semibold">Find Nearby Resources</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSearch} className="space-y-4 bg-gray-50 p-4 rounded">
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useCurrentLocation}
              onChange={(e) => setUseCurrentLocation(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span>Use my current location</span>
          </label>

          {!useCurrentLocation && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={searchParams.location_name}
                onChange={(e) => setSearchParams({ ...searchParams, location_name: e.target.value })}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                placeholder="e.g., Manhattan, NY"
                required={!useCurrentLocation}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Resource Type</label>
            <select
              value={searchParams.type}
              onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            >
              {RESOURCE_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Distance</label>
            <select
              value={searchParams.distance}
              onChange={(e) => setSearchParams({ ...searchParams, distance: Number(e.target.value) })}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            >
              {DISTANCE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search Resources'}
        </button>
      </form>

      {results && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Search Results</h3>
            <span className="text-sm text-gray-500">
              Found {results.metadata.total} resources within {results.metadata.distance_km} km
              {results.metadata.type_filter !== 'all' && ` of type ${results.metadata.type_filter}`}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.data.map(resource => (
              <div key={resource.id} className="border rounded p-4 bg-white shadow-sm">
                <h4 className="font-semibold">{resource.name}</h4>
                <p className="text-sm text-gray-600">{resource.location_name}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100">
                    {resource.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {(resource.distance / 1000).toFixed(1)} km away
                  </span>
                </div>
              </div>
            ))}
          </div>

          {results.data.length === 0 && (
            <p className="text-center text-gray-500">No resources found matching your criteria.</p>
          )}
        </div>
      )}
    </div>
  );
}
