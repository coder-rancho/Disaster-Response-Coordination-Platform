import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DisasterForm from './components/DisasterForm'
import DisasterList from './components/DisasterList'
import DisasterReports from './components/DisasterReports'
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
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
