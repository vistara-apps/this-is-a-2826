import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import CampaignCreator from './pages/CampaignCreator'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import { CampaignProvider } from './context/CampaignContext'

function App() {
  return (
    <CampaignProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
        <Navbar />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CampaignCreator />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </CampaignProvider>
  )
}

export default App