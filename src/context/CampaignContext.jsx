import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext.jsx'
import { supabaseService } from '../services/supabaseService.js'
import { openaiService } from '../services/openaiService.js'
import { anthropicService } from '../services/anthropicService.js'
import { socialMediaService } from '../services/socialMediaService.js'
import { stripeService } from '../services/stripeService.js'
import toast from 'react-hot-toast'

const CampaignContext = createContext()

export const useCampaigns = () => {
  const context = useContext(CampaignContext)
  if (!context) {
    throw new Error('useCampaigns must be used within a CampaignProvider')
  }
  return context
}

export const CampaignProvider = ({ children }) => {
  const { user, checkPermission, getUsageStats } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(false)
  const [generatingVariations, setGeneratingVariations] = useState(false)

  // Load campaigns when user changes
  useEffect(() => {
    if (user) {
      loadCampaigns()
    } else {
      setCampaigns([])
    }
  }, [user])

  /**
   * Load campaigns from database
   */
  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const userCampaigns = await supabaseService.getUserCampaigns(user.id)
      setCampaigns(userCampaigns)
    } catch (error) {
      console.error('Failed to load campaigns:', error)
      toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Create a new campaign
   * @param {Object} campaignData - Campaign data
   * @returns {Promise<Object>} Created campaign
   */
  const createCampaign = async (campaignData) => {
    try {
      if (!user) throw new Error('User not authenticated')

      // Check subscription limits
      const usageStats = await getUsageStats()
      const permission = checkPermission('create_campaign', usageStats)
      
      if (!permission.allowed) {
        toast.error(permission.reason)
        if (permission.upgradeRequired) {
          // Could trigger upgrade modal here
        }
        throw new Error(permission.reason)
      }

      const campaign = await supabaseService.createCampaign({
        ...campaignData,
        userId: user.id,
        campaignId: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })

      setCampaigns(prev => [campaign, ...prev])
      toast.success('Campaign created successfully!')
      return campaign
    } catch (error) {
      console.error('Failed to create campaign:', error)
      toast.error(error.message || 'Failed to create campaign')
      throw error
    }
  }

  /**
   * Update campaign
   * @param {string} campaignId - Campaign ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated campaign
   */
  const updateCampaign = async (campaignId, updates) => {
    try {
      const updatedCampaign = await supabaseService.updateCampaign(campaignId, updates)
      
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.campaignId === campaignId ? updatedCampaign : campaign
        )
      )
      
      return updatedCampaign
    } catch (error) {
      console.error('Failed to update campaign:', error)
      toast.error('Failed to update campaign')
      throw error
    }
  }

  /**
   * Delete campaign
   * @param {string} campaignId - Campaign ID
   * @returns {Promise<void>}
   */
  const deleteCampaign = async (campaignId) => {
    try {
      await supabaseService.deleteCampaign(campaignId)
      setCampaigns(prev => prev.filter(c => c.campaignId !== campaignId))
      toast.success('Campaign deleted successfully')
    } catch (error) {
      console.error('Failed to delete campaign:', error)
      toast.error('Failed to delete campaign')
      throw error
    }
  }

  /**
   * Generate AI-powered ad variations
   * @param {string} campaignId - Campaign ID
   * @param {Object} generationOptions - Generation options
   * @returns {Promise<Array>} Generated variations
   */
  const generateAdVariations = async (campaignId, generationOptions) => {
    try {
      if (!user) throw new Error('User not authenticated')

      setGeneratingVariations(true)
      
      const {
        productDescription,
        visualPrompts = [],
        copyPrompts = [],
        platforms = ['Instagram'],
        generateImages = true,
        generateCopy = true
      } = generationOptions

      const variations = []

      // Check subscription limits for each variation
      const usageStats = await getUsageStats()
      const totalVariationsToGenerate = (generateImages ? visualPrompts.length : 0) + 
                                       (generateCopy ? copyPrompts.length : 0)

      for (let i = 0; i < totalVariationsToGenerate; i++) {
        const permission = checkPermission('create_variation', {
          ...usageStats,
          variationsThisMonth: usageStats.variationsThisMonth + i
        })
        
        if (!permission.allowed) {
          toast.error(`${permission.reason}. Generated ${i} variations before hitting limit.`)
          break
        }
      }

      // Generate image variations
      if (generateImages && visualPrompts.length > 0) {
        for (const prompt of visualPrompts) {
          try {
            const images = await openaiService.generateAdImages(
              `${productDescription}, ${prompt}`,
              { n: 1, size: '1024x1024' }
            )

            if (images.length > 0) {
              const variation = await supabaseService.createAdVariation({
                campaignId,
                variationId: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                visualType: 'AI Generated',
                copyType: 'Original',
                visualPrompt: prompt,
                copyPrompt: '',
                generatedImageURL: images[0].url,
                generatedCopy: `Discover ${productDescription} with ${prompt.toLowerCase()}. Transform your experience today!`,
                platform: platforms[0] || 'Instagram',
                postStatus: 'draft',
                performanceMetrics: {
                  impressions: 0,
                  clicks: 0,
                  conversions: 0,
                  ctr: 0,
                  cpc: 0
                }
              })

              variations.push(variation)
            }
          } catch (error) {
            console.error(`Failed to generate image for prompt: ${prompt}`, error)
          }
        }
      }

      // Generate copy variations
      if (generateCopy && copyPrompts.length > 0) {
        for (const platform of platforms) {
          try {
            const copyVariations = await anthropicService.generateCopyVariations(
              productDescription,
              [platform]
            )

            for (const platformCopy of copyVariations) {
              for (const copy of platformCopy.copies) {
                const variation = await supabaseService.createAdVariation({
                  campaignId,
                  variationId: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  visualType: 'Original',
                  copyType: 'AI Generated',
                  visualPrompt: '',
                  copyPrompt: copy.type,
                  generatedImageURL: '', // Would use original campaign image
                  generatedCopy: copy.text,
                  platform: platform,
                  postStatus: 'draft',
                  performanceMetrics: {
                    impressions: 0,
                    clicks: 0,
                    conversions: 0,
                    ctr: 0,
                    cpc: 0
                  }
                })

                variations.push(variation)
              }
            }
          } catch (error) {
            console.error(`Failed to generate copy for platform: ${platform}`, error)
          }
        }
      }

      // Update local campaign state
      setCampaigns(prev => 
        prev.map(campaign => {
          if (campaign.campaignId === campaignId) {
            return {
              ...campaign,
              adVariations: [...(campaign.adVariations || []), ...variations]
            }
          }
          return campaign
        })
      )

      // Record usage for billing
      if (variations.length > 0) {
        await stripeService.recordUsage(user.id, {
          type: 'ad_variations_generated',
          count: variations.length,
          campaignId
        })
      }

      toast.success(`Generated ${variations.length} ad variations successfully!`)
      return variations

    } catch (error) {
      console.error('Failed to generate variations:', error)
      toast.error(error.message || 'Failed to generate variations')
      throw error
    } finally {
      setGeneratingVariations(false)
    }
  }

  /**
   * Post ad variations to social media platforms
   * @param {Array} variationIds - Variation IDs to post
   * @param {Array} platforms - Target platforms
   * @param {Object} credentials - Platform credentials
   * @returns {Promise<Array>} Post results
   */
  const postVariations = async (variationIds, platforms, credentials = {}) => {
    try {
      const results = []
      
      for (const variationId of variationIds) {
        // Find the variation
        const variation = campaigns
          .flatMap(c => c.adVariations || [])
          .find(v => v.variationId === variationId)
        
        if (!variation) {
          results.push({
            variationId,
            success: false,
            error: 'Variation not found'
          })
          continue
        }

        // Post to platforms
        const postResults = await socialMediaService.postToMultiplePlatforms(
          variation,
          platforms,
          credentials
        )

        // Update variation status
        await supabaseService.updateAdVariation(variationId, {
          postStatus: 'published',
          publishedAt: new Date().toISOString(),
          publishResults: postResults
        })

        results.push({
          variationId,
          success: true,
          postResults
        })
      }

      // Update local state
      await loadCampaigns()

      const successCount = results.filter(r => r.success).length
      toast.success(`Posted ${successCount} variations successfully!`)
      
      return results
    } catch (error) {
      console.error('Failed to post variations:', error)
      toast.error('Failed to post variations')
      throw error
    }
  }

  /**
   * Update variation performance metrics
   * @param {string} variationId - Variation ID
   * @param {Object} metrics - Performance metrics
   * @returns {Promise<void>}
   */
  const updateVariationMetrics = async (variationId, metrics) => {
    try {
      await supabaseService.updateVariationMetrics(variationId, metrics)
      
      // Update local state
      setCampaigns(prev => 
        prev.map(campaign => ({
          ...campaign,
          adVariations: (campaign.adVariations || []).map(variation =>
            variation.variationId === variationId
              ? { ...variation, performanceMetrics: metrics }
              : variation
          )
        }))
      )
    } catch (error) {
      console.error('Failed to update metrics:', error)
      toast.error('Failed to update metrics')
      throw error
    }
  }

  /**
   * Get campaign analytics
   * @param {string} campaignId - Campaign ID (optional)
   * @returns {Promise<Object>} Analytics data
   */
  const getCampaignAnalytics = async (campaignId = null) => {
    try {
      if (!user) return null

      const options = campaignId ? { campaignId } : {}
      const analytics = await supabaseService.getAnalyticsData(user.id, options)
      return analytics
    } catch (error) {
      console.error('Failed to get analytics:', error)
      return null
    }
  }

  /**
   * Upload image file
   * @param {File} file - Image file
   * @returns {Promise<string>} Image URL
   */
  const uploadImage = async (file) => {
    try {
      const imageUrl = await supabaseService.uploadFile(file, 'ad-images')
      return imageUrl
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error('Failed to upload image')
      throw error
    }
  }

  const value = {
    // State
    campaigns,
    loading,
    generatingVariations,
    
    // Campaign methods
    createCampaign,
    updateCampaign,
    deleteCampaign,
    loadCampaigns,
    
    // Variation methods
    generateAdVariations,
    postVariations,
    updateVariationMetrics,
    
    // Analytics
    getCampaignAnalytics,
    
    // Utilities
    uploadImage,
    
    // Computed values
    totalCampaigns: campaigns.length,
    totalVariations: campaigns.reduce((sum, c) => sum + (c.adVariations?.length || 0), 0)
  }

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  )
}
