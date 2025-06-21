import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { disasterService } from '../services/disaster.service';

export default function DisasterList() {
  const navigate = useNavigate();
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [inputValue, setInputValue] = useState('');

  const loadDisasters = useCallback(async () => {
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
  }, [filter]);

  useEffect(() => {
    loadDisasters();

    // Setup WebSocket listeners
    disasterService.socket.on('disaster_updated', handleDisasterUpdate);

    return () => {
      disasterService.socket.off('disaster_updated', handleDisasterUpdate);
    };
  }, [loadDisasters]);

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

  const navigateToReports = (disasterId) => {
    navigate(`/reports/${disasterId}`);
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
        {disasters.map((disaster) => (
          <div key={disaster.id} className="p-4 border rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">{disaster.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => navigateToReports(disaster.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  See Reports
                </button>
                <button
                  onClick={() => handleDelete(disaster.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-2">{disaster.description}</p>
            <div className="flex flex-wrap gap-2">
              {disaster.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Created: {new Date(disaster.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
