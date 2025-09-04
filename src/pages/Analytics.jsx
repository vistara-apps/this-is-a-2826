import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Eye, MousePointer, DollarSign } from 'lucide-react'
import { useCampaigns } from '../context/CampaignContext'

const Analytics = () => {
  const { campaigns } = useCampaigns()

  const allVariations = campaigns.flatMap(campaign => 
    (campaign.adVariations || []).map(variation => ({
      ...variation,
      campaignName: campaign.campaignName
    }))
  )

  // Prepare chart data
  const performanceData = allVariations.map((variation, index) => ({
    name: `Var ${index + 1}`,
    impressions: variation.performanceMetrics?.impressions || 0,
    clicks: variation.performanceMetrics?.clicks || 0,
    conversions: variation.performanceMetrics?.conversions || 0,
    ctr: parseFloat(variation.performanceMetrics?.ctr || 0),
  }))

  const timeSeriesData = [
    { date: '2024-01-01', impressions: 1200, clicks: 45, conversions: 8 },
    { date: '2024-01-02', impressions: 1850, clicks: 72, conversions: 12 },
    { date: '2024-01-03', impressions: 2100, clicks: 89, conversions: 15 },
    { date: '2024-01-04', impressions: 1900, clicks: 76, conversions: 11 },
    { date: '2024-01-05', impressions: 2400, clicks: 98, conversions: 18 },
    { date: '2024-01-06', impressions: 2200, clicks: 87, conversions: 14 },
    { date: '2024-01-07', impressions: 2600, clicks: 105, conversions: 21 },
  ]

  const totalImpressions = allVariations.reduce((sum, v) => sum + (v.performanceMetrics?.impressions || 0), 0)
  const totalClicks = allVariations.reduce((sum, v) => sum + (v.performanceMetrics?.clicks || 0), 0)
  const totalConversions = allVariations.reduce((sum, v) => sum + (v.performanceMetrics?.conversions || 0), 0)
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0
  const avgCPC = allVariations.length > 0 ? (allVariations.reduce((sum, v) => sum + parseFloat(v.performanceMetrics?.cpc || 0), 0) / allVariations.length).toFixed(2) : 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-white/80">Track your ad performance and optimize campaigns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Impressions</p>
              <p className="text-2xl font-bold text-text-primary">{totalImpressions.toLocaleString()}</p>
              <p className="text-green-500 text-sm">+12.5% vs last week</p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Clicks</p>
              <p className="text-2xl font-bold text-text-primary">{totalClicks.toLocaleString()}</p>
              <p className="text-green-500 text-sm">+8.3% vs last week</p>
            </div>
            <MousePointer className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Conversions</p>
              <p className="text-2xl font-bold text-text-primary">{totalConversions}</p>
              <p className="text-green-500 text-sm">+15.2% vs last week</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Avg CPC</p>
              <p className="text-2xl font-bold text-text-primary">${avgCPC}</p>
              <p className="text-red-500 text-sm">-5.1% vs last week</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Performance by Variation</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="impressions" fill="hsl(240 80% 50%)" />
              <Bar dataKey="clicks" fill="hsl(180 60% 50%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Performance Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="impressions" stroke="hsl(240 80% 50%)" strokeWidth={2} />
              <Line type="monotone" dataKey="clicks" stroke="hsl(180 60% 50%)" strokeWidth={2} />
              <Line type="monotone" dataKey="conversions" stroke="hsl(120 60% 50%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing Variations */}
      <div className="card">
        <h2 className="text-xl font-semibold text-text-primary mb-6">Top Performing Variations</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Variation</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Campaign</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Platform</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">Impressions</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">Clicks</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">CTR</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">Conversions</th>
              </tr>
            </thead>
            <tbody>
              {allVariations
                .sort((a, b) => (b.performanceMetrics?.clicks || 0) - (a.performanceMetrics?.clicks || 0))
                .slice(0, 10)
                .map((variation) => (
                  <tr key={variation.variationId} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img src={variation.generatedImageURL} alt="" className="w-10 h-10 rounded object-cover" />
                        <span className="font-medium text-text-primary">{variation.visualType}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-primary">{variation.campaignName}</td>
                    <td className="py-3 px-4 text-text-secondary">{variation.platform}</td>
                    <td className="py-3 px-4 text-right text-text-primary">
                      {(variation.performanceMetrics?.impressions || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-text-primary">
                      {(variation.performanceMetrics?.clicks || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-text-primary">
                      {variation.performanceMetrics?.ctr || 0}%
                    </td>
                    <td className="py-3 px-4 text-right text-text-primary">
                      {variation.performanceMetrics?.conversions || 0}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Analytics