import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportService } from '../services/report.service';
import { disasterService } from '../services/disaster.service';

export default function DisasterReports() {
  const { disasterId } = useParams();
  const navigate = useNavigate();
  const [disaster, setDisaster] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    imageUrl: ''
  });

  const loadDisasterAndReports = useCallback(async () => {
    try {
      setLoading(true);
      const [disasterData, reportsData] = await Promise.all([
        disasterService.getById(disasterId),
        reportService.getAllByDisasterId(disasterId)
      ]);
      setDisaster(disasterData);
      setReports(reportsData);
      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [disasterId]);

  useEffect(() => {
    loadDisasterAndReports();

    // Setup WebSocket listeners
    disasterService.socket.on('report_updated', handleReportUpdate);

    return () => {
      disasterService.socket.off('report_updated', handleReportUpdate);
    };
  }, [disasterId, loadDisasterAndReports]);

  const handleReportUpdate = ({ action, report }) => {
    if (report.disaster_id !== disasterId) return;

    switch (action) {
      case 'create':
        setReports(prev => [report, ...prev]);
        break;
      case 'update':
        setReports(prev => 
          prev.map(r => r.id === report.id ? report : r)
        );
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content) return;

    try {
      setSubmitting(true);
      setError('');

      // Create the report (image will be automatically verified in the backend)
      const report = await reportService.createReport(disasterId, formData);
      
      // If the image is still pending verification, try to verify it separately
      if (report.image_url && report.verification_status === 'pending') {
        try {
          const verification = await reportService.verifyImage(disasterId, report.image_url);
          if (verification.status !== 'pending') {
            // Update the report with the verification result
            const updatedReport = { ...report, verification_status: verification.status };
            setReports(prev => prev.map(r => r.id === report.id ? updatedReport : r));
          }
        } catch (verifyErr) {
          console.error('Additional verification failed:', verifyErr);
          // Don't show error to user since the report was created successfully
        }
      }

      setFormData({ content: '', imageUrl: '' });
      setReports(prev => [report, ...prev]);
    } catch (err) {
      setError('Failed to submit report');
      console.error('Error submitting report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!disaster) {
    return <div className="text-center text-red-600">Disaster not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Disasters
        </button>
        <h2 className="text-2xl font-bold mb-2">{disaster.title} - Reports</h2>
        <p className="text-gray-600">{disaster.description}</p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Submit Report</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Content*
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Reports</h3>
        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-gray-500">No reports yet.</p>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="p-4 border rounded-lg bg-white">
                <p className="mb-2">{report.content}</p>
                {report.image_url && (
                  <div className="mb-2">
                    <img
                      src={report.image_url}
                      alt="Report image"
                      height={200}
                      width={200}
                      className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90"
                      onClick={() => window.open(report.image_url, '_blank', 'noopener,noreferrer')}
                    />
                    <span className="ml-2 text-sm">
                      Status: {report.verification_status}
                    </span>
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  Reported: {new Date(report.created_at).toLocaleString()}
                </div>
                <hr />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
