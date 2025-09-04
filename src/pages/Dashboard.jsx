import React from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, TrendingUp, Eye, MousePointer } from 'lucide-react'
import { useCampaigns } from '../context/CampaignContext'
import AdVariantCard from '../components/AdVariantCard'

const Dashboard = () => {
  const { campaigns } = useCampaigns()

  const totalVariations = campaigns.reduce((acc, campaign) => 
    acc + (campaign.adVariations?.length || 0), 0
  )

  const totalImpressions = campaigns.reduce((acc, campaign) => 
    acc + (campaign.adVariations?.reduce((sum, variation) => 
      sum + (variation.performanceMetrics?.impressions || 0), 0) || 0), 0
  )

  const totalClicks = campaigns.reduce((acc, campaign) => 
    acc + (campaign.adVariations?.reduce((sum, variation) => 
      sum + (variation.performanceMetrics?.clicks || 0), 0) || 0), 0
  )

  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0

  const allVariations = campaigns.flatMap(campaign => 
    (campaign.adVariations || []).map(variation => ({
      ...variation,
      campaignName: campaign.campaignName
    }))
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/80">Monitor your ad campaigns and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Campaigns</p>
              <p className="text-2xl font-bold text-text-primary">{campaigns.length}</p>
            </div>
            <PlusCircle className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Ad Variations</p>
              <p className="text-2xl font-bold text-text-primary">{totalVariations}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Impressions</p>
              <p className="text-2xl font-bold text-text-primary">{totalImpressions.toLocaleString()}</p>
            </div>
            <Eye className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Avg CTR</p>
              <p className="text-2xl font-bold text-text-primary">{avgCTR}%</p>
            </div>
            <MousePointer className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {campaigns.length === 0 ? (
        <div className="card text-center py-12">
          <PlusCircle className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Create Your First Campaign
          </h3>
          <p className="text-text-secondary mb-6">
            Start generating AI-powered ad variations for your products
          </p>
          <Link to="/create" className="btn-primary">
            Create Campaign
          </Link>
        </div>
      ) : (
        <>
          {/* Recent Ad Variations */}
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">Recent Ad Variations</h2>
              <Link to="/create" className="btn-primary">
                Create New Campaign
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allVariations.slice(0, 6).map((variation) => (
                <AdVariantCard key={variation.variationId} variation={variation} />
              ))}
            </div>
          </div>

          {/* Recent Campaigns */}
          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Recent Campaigns</h2>
            <div className="space-y-4">
              {campaigns.slice(0, 5).map((campaign) => (
                <div key={campaign.campaignId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-text-primary">{campaign.campaignName}</h3>
                    <p className="text-sm text-text-secondary">
                      {campaign.adVariations?.length || 0} variations • Created {new Date(campaign.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-secondary">Performance</p>
                    <p className="font-medium text-text-primary">
                      {(campaign.adVariations?.reduce((sum, v) => sum + (v.performanceMetrics?.clicks || 0), 0) || 0).toLocaleString()} clicks
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard