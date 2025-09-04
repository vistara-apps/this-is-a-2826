import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BarChart3, PlusCircle, Settings, Home } from 'lucide-react'

const Navbar = () => {
  const location = useLocation()
  
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/create', icon: PlusCircle, label: 'Create' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-white">
              AdRemixr
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === path
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
              Growth Plan
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-medium">
              U
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar