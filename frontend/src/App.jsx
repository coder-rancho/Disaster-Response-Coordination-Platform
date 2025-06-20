import DisasterForm from './components/DisasterForm'
import DisasterList from './components/DisasterList'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Disaster Response Coordination Platform
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <DisasterForm onDisasterCreated={() => {}} />
          <DisasterList />
        </div>
      </main>
    </div>
  )
}

export default App
