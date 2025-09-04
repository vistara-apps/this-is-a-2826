import React, { createContext, useContext, useState } from 'react'

const CampaignContext = createContext()

export const useCampaigns = () => {
  const context = useContext(CampaignContext)
  if (!context) {
    throw new Error('useCampaigns must be used within a CampaignProvider')
  }
  return context
}

export const CampaignProvider = ({ children }) => {
  const [campaigns, setCampaigns] = useState([])
  const [currentUser] = useState({
    userId: '1',
    email: 'user@example.com',
    subscriptionTier: 'Growth',
    createdAt: new Date().toISOString(),
  })

  const addCampaign = (campaign) => {
    const newCampaign = {
      ...campaign,
      campaignId: Date.now().toString(),
      userId: currentUser.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCampaigns(prev => [...prev, newCampaign])
    return newCampaign
  }

  const updateCampaign = (campaignId, updates) => {
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.campaignId === campaignId 
          ? { ...campaign, ...updates, updatedAt: new Date().toISOString() }
          : campaign
      )
    )
  }

  const addAdVariation = (campaignId, variation) => {
    const newVariation = {
      ...variation,
      variationId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      campaignId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      performanceMetrics: {
        impressions: Math.floor(Math.random() * 10000),
        clicks: Math.floor(Math.random() * 500),
        conversions: Math.floor(Math.random() * 50),
        ctr: (Math.random() * 5).toFixed(2),
        cpc: (Math.random() * 2 + 0.5).toFixed(2),
      }
    }

    setCampaigns(prev => 
      prev.map(campaign => {
        if (campaign.campaignId === campaignId) {
          return {
            ...campaign,
            adVariations: [...(campaign.adVariations || []), newVariation]
          }
        }
        return campaign
      })
    )
    
    return newVariation
  }

  return (
    <CampaignContext.Provider value={{
      campaigns,
      currentUser,
      addCampaign,
      updateCampaign,
      addAdVariation,
    }}>
      {children}
    </CampaignContext.Provider>
  )
}