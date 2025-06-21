import { useState, useEffect } from 'react';
import { disasterService } from '../services/disaster.service';

export default function DisasterList() {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    loadDisasters();

    // Setup WebSocket listeners
    disasterService.socket.on('disaster_updated', handleDisasterUpdate);

    return () => {
      disasterService.socket.off('disaster_updated', handleDisasterUpdate);
    };
  }, [filter]);

  const loadDisasters = async () => {
    try {
      setLoading(true);
      const data = await disasterService.getAll(filter);
      setDisasters(data);
      setError('');
    } catch (err) {
      setError('Failed to load disasters');
      console.error('Error loading disasters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisasterUpdate = ({ action, disaster, disasterId }) => {
    switch (action) {
      case 'create':
        setDisasters(prev => [disaster, ...prev]);
        break;
      case 'update':
        setDisasters(prev => 
          prev.map(d => d.id === disaster.id ? disaster : d)
        );
        break;
      case 'delete':
        setDisasters(prev => 
          prev.filter(d => d.id !== disasterId)
        );
        break;
      default:
        break;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this disaster?')) {
      return;
    }

    try {
      await disasterService.delete(id);
      // Socket will handle the state update
    } catch (err) {
      setError('Failed to delete disaster');
      console.error('Error deleting disaster:', err);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Reported Disasters</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by tag"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <button
            onClick={() => setFilter(inputValue)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {disasters.map(disaster => (
          <div
            key={disaster.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{disaster.title}</h3>
                <p className="text-gray-600">{disaster.location_name}</p>
              </div>
            </div>
            
            <p className="mt-2 text-gray-700">{disaster.description}</p>
            
            <div className="mt-3 flex flex-wrap gap-2">
              Tags: {disaster.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag},&nbsp;
                </span>
              ))}
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              Reported by: {disaster.owner_id}
            </div>

            <button
                onClick={() => handleDelete(disaster.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
          </div>
        ))}

        {disasters.length === 0 && (
          <p className="text-center text-gray-500">
            No disasters reported yet.
          </p>
        )}
      </div>
    </div>
  );
}
