import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Sidebar from './components/Sidebar'
import { tableDefinitions } from '../shared/tableDefinitions'
import './index.css'

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard')

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        tables={tableDefinitions}
        selected={activeTab}
        onSelect={setActiveTab}
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          <Dashboard activeTab={activeTab === 'Dashboard' ? null : activeTab} />
        </div>
      </main>
    </div>
  )
}

export default App


