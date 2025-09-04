import React from 'react'
import { Eye, MousePointer, TrendingUp, ExternalLink } from 'lucide-react'

const AdVariantCard = ({ variation }) => {
  const metrics = variation.performanceMetrics || {}

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      {/* Image */}
      <div className="aspect-square bg-gray-100">
        <img
          src={variation.generatedImageURL}
          alt="Ad variation"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              variation.visualType === 'AI Generated' 
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {variation.visualType}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              variation.copyType === 'AI Generated'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {variation.copyType}
            </span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            variation.postStatus === 'published'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {variation.postStatus}
          </span>
        </div>

        {/* Ad Copy */}
        <p className="text-text-primary text-sm mb-4 line-clamp-3">
          {variation.generatedCopy}
        </p>

        {/* Platform */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-text-secondary text-sm">Platform: {variation.platform}</span>
          <ExternalLink size={16} className="text-text-secondary" />
        </div>

        {/* Performance Metrics */}
        {metrics.impressions && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Eye size={14} className="text-blue-500" />
              </div>
              <p className="text-xs text-text-secondary">Impressions</p>
              <p className="font-semibold text-text-primary">{metrics.impressions?.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <MousePointer size={14} className="text-green-500" />
              </div>
              <p className="text-xs text-text-secondary">Clicks</p>
              <p className="font-semibold text-text-primary">{metrics.clicks?.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp size={14} className="text-orange-500" />
              </div>
              <p className="text-xs text-text-secondary">CTR</p>
              <p className="font-semibold text-text-primary">{metrics.ctr}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdVariantCard