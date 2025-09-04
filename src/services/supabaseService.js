import { supabase } from '../config/supabase.js'

class SupabaseService {
  constructor() {
    this.client = supabase
  }

  // ============ AUTH METHODS ============

  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} metadata - Additional user metadata
   * @returns {Promise<Object>} Auth response
   */
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            subscriptionTier: 'Free',
            ...metadata
          }
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Supabase SignUp Error:', error)
      throw new Error(`Failed to sign up: ${error.message}`)
    }
  }

  /**
   * Sign in user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Auth response
   */
  async signIn(email, password) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Supabase SignIn Error:', error)
      throw new Error(`Failed to sign in: ${error.message}`)
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      const { error } = await this.client.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Supabase SignOut Error:', error)
      throw new Error(`Failed to sign out: ${error.message}`)
    }
  }

  /**
   * Get current user
   * @returns {Promise<Object|null>} Current user or null
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.client.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Supabase GetUser Error:', error)
      return null
    }
  }

  // ============ USER METHODS ============

  /**
   * Create or update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} User profile
   */
  async upsertUserProfile(userId, profileData) {
    try {
      const { data, error } = await this.client
        .from('users')
        .upsert({
          userId,
          ...profileData,
          updatedAt: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Supabase UpsertProfile Error:', error)
      throw new Error(`Failed to update profile: ${error.message}`)
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('userId', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Supabase GetProfile Error:', error)
      throw new Error(`Failed to get profile: ${error.message}`)
    }
  }

  // ============ CAMPAIGN METHODS ============

  /**
   * Create a new campaign
   * @param {Object} campaignData - Campaign data
   * @returns {Promise<Object>} Created campaign
   */
  async createCampaign(campaignData) {
    try {
      const { data, error } = await this.client
        .from('campaigns')
        .insert({
          ...campaignData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Supabase CreateCampaign Error:', error)
      throw new Error(`Failed to create campaign: ${error.message}`)
    }
  }

  /**
   * Get campaigns for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User campaigns
   */
  async getUserCampaigns(userId, options = {}) {
    try {
      let query = this.client
        .from('campaigns')
        .select(`
          *,
          adVariations:ad_variations(*)
        `)
        .eq('userId', userId)
        .order('createdAt', { ascending: false })

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Supabase GetCampaigns Error:', error)
      throw new Error(`Failed to get campaigns: ${error.message}`)
    }
  }

  /**
   * Update campaign
   * @param {string} campaignId - Campaign ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated campaign
   */
  async updateCampaign(campaignId, updates) {
    try {
      const { data, error } = await this.client
        .from('campaigns')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('campaignId', campaignId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Supabase UpdateCampaign Error:', error)
      throw new Error(`Failed to update campaign: ${error.message}`)
    }
  }

  /**
   * Delete campaign
   * @param {string} campaignId - Campaign ID
   * @returns {Promise<void>}
   */
  async deleteCampaign(campaignId) {
    try {
      // First delete all ad variations
      await this.client
        .from('ad_variations')
        .delete()
        .eq('campaignId', campaignId)

      // Then delete the campaign
      const { error } = await this.client
        .from('campaigns')
        .delete()
        .eq('campaignId', campaignId)

      if (error) throw error
    } catch (error) {
      console.error('Supabase DeleteCampaign Error:', error)
      throw new Error(`Failed to delete campaign: ${error.message}`)
    }
  }

  // ============ AD VARIATION METHODS ============

  /**
   * Create ad variation
   * @param {Object} variationData - Variation data
   * @returns {Promise<Object>} Created variation
   */
  async createAdVariation(variationData) {
    try {
      const { data, error } = await this.client
        .from('ad_variations')
        .insert({
          ...variationData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Supabase CreateVariation Error:', error)
      throw new Error(`Failed to create ad variation: ${error.message}`)
    }
  }

  /**
   * Get ad variations for a campaign
   * @param {string} campaignId - Campaign ID
   * @returns {Promise<Array>} Campaign variations
   */
  async getCampaignVariations(campaignId) {
    try {
      const { data, error } = await this.client
        .from('ad_variations')
        .select('*')
        .eq('campaignId', campaignId)
        .order('createdAt', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Supabase GetVariations Error:', error)
      throw new Error(`Failed to get variations: ${error.message}`)
    }
  }

  /**
   * Update ad variation
   * @param {string} variationId - Variation ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated variation
   */
  async updateAdVariation(variationId, updates) {
    try {
      const { data, error } = await this.client
        .from('ad_variations')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('variationId', variationId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Supabase UpdateVariation Error:', error)
      throw new Error(`Failed to update variation: ${error.message}`)
    }
  }

  /**
   * Update performance metrics for ad variation
   * @param {string} variationId - Variation ID
   * @param {Object} metrics - Performance metrics
   * @returns {Promise<Object>} Updated variation
   */
  async updateVariationMetrics(variationId, metrics) {
    try {
      const { data, error } = await this.client
        .from('ad_variations')
        .update({
          performanceMetrics: metrics,
          updatedAt: new Date().toISOString()
        })
        .eq('variationId', variationId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Supabase UpdateMetrics Error:', error)
      throw new Error(`Failed to update metrics: ${error.message}`)
    }
  }

  // ============ ANALYTICS METHODS ============

  /**
   * Get analytics data for user campaigns
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalyticsData(userId, options = {}) {
    try {
      const { startDate, endDate, platform } = options
      
      let query = this.client
        .from('ad_variations')
        .select(`
          *,
          campaigns!inner(userId)
        `)
        .eq('campaigns.userId', userId)

      if (startDate) {
        query = query.gte('createdAt', startDate)
      }
      
      if (endDate) {
        query = query.lte('createdAt', endDate)
      }
      
      if (platform) {
        query = query.eq('platform', platform)
      }

      const { data, error } = await query

      if (error) throw error

      // Process analytics data
      const analytics = this.processAnalyticsData(data || [])
      return analytics
    } catch (error) {
      console.error('Supabase GetAnalytics Error:', error)
      throw new Error(`Failed to get analytics: ${error.message}`)
    }
  }

  /**
   * Process raw data into analytics format
   * @param {Array} variations - Raw variation data
   * @returns {Object} Processed analytics
   */
  processAnalyticsData(variations) {
    const totalVariations = variations.length
    const totalImpressions = variations.reduce((sum, v) => sum + (v.performanceMetrics?.impressions || 0), 0)
    const totalClicks = variations.reduce((sum, v) => sum + (v.performanceMetrics?.clicks || 0), 0)
    const totalConversions = variations.reduce((sum, v) => sum + (v.performanceMetrics?.conversions || 0), 0)
    
    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0
    const avgCPC = totalClicks > 0 ? (variations.reduce((sum, v) => sum + parseFloat(v.performanceMetrics?.cpc || 0), 0) / totalVariations).toFixed(2) : 0
    
    const platformBreakdown = variations.reduce((acc, v) => {
      const platform = v.platform || 'Unknown'
      if (!acc[platform]) {
        acc[platform] = { count: 0, impressions: 0, clicks: 0, conversions: 0 }
      }
      acc[platform].count++
      acc[platform].impressions += v.performanceMetrics?.impressions || 0
      acc[platform].clicks += v.performanceMetrics?.clicks || 0
      acc[platform].conversions += v.performanceMetrics?.conversions || 0
      return acc
    }, {})

    return {
      overview: {
        totalVariations,
        totalImpressions,
        totalClicks,
        totalConversions,
        avgCTR: parseFloat(avgCTR),
        avgCPC: parseFloat(avgCPC)
      },
      platformBreakdown,
      topPerformers: variations
        .sort((a, b) => (b.performanceMetrics?.conversions || 0) - (a.performanceMetrics?.conversions || 0))
        .slice(0, 5),
      recentActivity: variations
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
    }
  }

  // ============ STORAGE METHODS ============

  /**
   * Upload file to Supabase storage
   * @param {File} file - File to upload
   * @param {string} bucket - Storage bucket name
   * @param {string} path - File path
   * @returns {Promise<string>} Public URL
   */
  async uploadFile(file, bucket = 'ad-images', path = null) {
    try {
      const fileName = path || `${Date.now()}-${file.name}`
      
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = this.client.storage
        .from(bucket)
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Supabase Upload Error:', error)
      throw new Error(`Failed to upload file: ${error.message}`)
    }
  }

  /**
   * Delete file from storage
   * @param {string} fileName - File name to delete
   * @param {string} bucket - Storage bucket name
   * @returns {Promise<void>}
   */
  async deleteFile(fileName, bucket = 'ad-images') {
    try {
      const { error } = await this.client.storage
        .from(bucket)
        .remove([fileName])

      if (error) throw error
    } catch (error) {
      console.error('Supabase Delete Error:', error)
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  }
}

export const supabaseService = new SupabaseService()
export default supabaseService
