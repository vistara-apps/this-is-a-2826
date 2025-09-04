import React from 'react'

const PlatformSelector = ({ selected, onChange }) => {
  const platforms = [
    { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter', color: 'bg-blue-400' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700' },
    { id: 'farcaster', name: 'Farcaster', color: 'bg-purple-600' },
  ]

  const togglePlatform = (platformId) => {
    const updated = selected.includes(platformId)
      ? selected.filter(id => id !== platformId)
      : [...selected, platformId]
    onChange(updated)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {platforms.map((platform) => (
        <button
          key={platform.id}
          onClick={() => togglePlatform(platform.id)}
          className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
            selected.includes(platform.id)
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className={`w-6 h-6 rounded ${platform.color}`}></div>
          <span className="font-medium text-text-primary">{platform.name}</span>
        </button>
      ))}
    </div>
  )
}

export default PlatformSelector