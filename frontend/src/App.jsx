import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DisasterForm from './components/DisasterForm'
import DisasterList from './components/DisasterList'
import DisasterReports from './components/DisasterReports'
import DisasterResources from './components/DisasterResources'
import NearbyResources from './components/NearbyResources'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <div className="flex justify-between items-center">
              <Link
                to="/"
                className="text-3xl font-bold text-gray-900 no-underline hover:text-gray-700"
              >
                Disaster Response Coordination Platform
              </Link>
            </div>
            <div className="flex justify-between items-center bg-yellow-100">
              <Link
                to="/nearby-resources"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Check Nearby Resources
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route
              path="/"
              element={
                <div className="grid gap-6 md:grid-cols-2">
                  <DisasterForm />
                  <DisasterList />
                </div>
              }
            />
            <Route path="/reports/:disasterId" element={<DisasterReports />} />
            <Route path="/resources/:disasterId" element={<DisasterResources />} />
            <Route path="/nearby-resources" element={<NearbyResources />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
