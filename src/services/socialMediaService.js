import axios from 'axios'
import { config } from '../config/env.js'

class SocialMediaService {
  constructor() {
    this.farcasterClient = axios.create({
      baseURL: config.farcaster.baseURL,
      headers: {
        'Authorization': `Bearer ${config.farcaster.apiKey}`,
        'Content-Type': 'application/json',
      },
    })
  }

  // ============ FARCASTER METHODS ============

  /**
   * Post to Farcaster using Neynar API
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Post result
   */
  async postToFarcaster(postData) {
    try {
      const { text, imageUrl, signerUuid } = postData
      
      const castData = {
        signer_uuid: signerUuid,
        text: text,
        embeds: imageUrl ? [{ url: imageUrl }] : []
      }

      const response = await this.farcasterClient.post('/farcaster/cast', castData)
      
      return {
        success: true,
        platform: 'Farcaster',
        postId: response.data.cast.hash,
        url: `https://warpcast.com/${response.data.cast.author.username}/${response.data.cast.hash}`,
        data: response.data
      }
    } catch (error) {
      console.error('Farcaster Post Error:', error)
      return {
        success: false,
        platform: 'Farcaster',
        error: error.response?.data?.message || error.message
      }
    }
  }

  /**
   * Get Farcaster user info
   * @param {string} fid - Farcaster ID
   * @returns {Promise<Object>} User info
   */
  async getFarcasterUser(fid) {
    try {
      const response = await this.farcasterClient.get(`/farcaster/user?fid=${fid}`)
      return response.data.result.user
    } catch (error) {
      console.error('Get Farcaster User Error:', error)
      throw new Error(`Failed to get Farcaster user: ${error.response?.data?.message || error.message}`)
    }
  }

  // ============ INSTAGRAM METHODS (Mock Implementation) ============

  /**
   * Post to Instagram (Mock - requires Instagram Basic Display API)
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Post result
   */
  async postToInstagram(postData) {
    try {
      // This is a mock implementation
      // In production, you would use Instagram Basic Display API or Instagram Graph API
      const { text, imageUrl, accessToken } = postData
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful response
      const mockPostId = `ig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return {
        success: true,
        platform: 'Instagram',
        postId: mockPostId,
        url: `https://instagram.com/p/${mockPostId}`,
        data: {
          id: mockPostId,
          caption: text,
          media_url: imageUrl,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Instagram Post Error:', error)
      return {
        success: false,
        platform: 'Instagram',
        error: error.message
      }
    }
  }

  // ============ TIKTOK METHODS (Mock Implementation) ============

  /**
   * Post to TikTok (Mock - requires TikTok API for Business)
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Post result
   */
  async postToTikTok(postData) {
    try {
      // This is a mock implementation
      // In production, you would use TikTok API for Business
      const { text, videoUrl, accessToken } = postData
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock successful response
      const mockPostId = `tt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return {
        success: true,
        platform: 'TikTok',
        postId: mockPostId,
        url: `https://tiktok.com/@user/video/${mockPostId}`,
        data: {
          id: mockPostId,
          description: text,
          video_url: videoUrl,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('TikTok Post Error:', error)
      return {
        success: false,
        platform: 'TikTok',
        error: error.message
      }
    }
  }

  // ============ TWITTER/X METHODS (Mock Implementation) ============

  /**
   * Post to Twitter/X (Mock - requires Twitter API v2)
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Post result
   */
  async postToTwitter(postData) {
    try {
      // This is a mock implementation
      // In production, you would use Twitter API v2
      const { text, imageUrl, accessToken } = postData
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock successful response
      const mockPostId = `tw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return {
        success: true,
        platform: 'Twitter',
        postId: mockPostId,
        url: `https://twitter.com/user/status/${mockPostId}`,
        data: {
          id: mockPostId,
          text: text,
          media_url: imageUrl,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Twitter Post Error:', error)
      return {
        success: false,
        platform: 'Twitter',
        error: error.message
      }
    }
  }

  // ============ FACEBOOK METHODS (Mock Implementation) ============

  /**
   * Post to Facebook (Mock - requires Facebook Graph API)
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Post result
   */
  async postToFacebook(postData) {
    try {
      // This is a mock implementation
      // In production, you would use Facebook Graph API
      const { text, imageUrl, accessToken } = postData
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Mock successful response
      const mockPostId = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return {
        success: true,
        platform: 'Facebook',
        postId: mockPostId,
        url: `https://facebook.com/posts/${mockPostId}`,
        data: {
          id: mockPostId,
          message: text,
          picture: imageUrl,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Facebook Post Error:', error)
      return {
        success: false,
        platform: 'Facebook',
        error: error.message
      }
    }
  }

  // ============ UNIFIED POSTING METHODS ============

  /**
   * Post to multiple platforms
   * @param {Object} adVariation - Ad variation data
   * @param {Array} platforms - Target platforms
   * @param {Object} credentials - Platform credentials
   * @returns {Promise<Array>} Array of post results
   */
  async postToMultiplePlatforms(adVariation, platforms, credentials = {}) {
    const results = []
    
    for (const platform of platforms) {
      try {
        let result
        const postData = {
          text: adVariation.generatedCopy,
          imageUrl: adVariation.generatedImageURL,
          videoUrl: adVariation.generatedVideoURL,
          ...credentials[platform]
        }
        
        switch (platform.toLowerCase()) {
          case 'farcaster':
            result = await this.postToFarcaster(postData)
            break
          case 'instagram':
            result = await this.postToInstagram(postData)
            break
          case 'tiktok':
            result = await this.postToTikTok(postData)
            break
          case 'twitter':
          case 'x':
            result = await this.postToTwitter(postData)
            break
          case 'facebook':
            result = await this.postToFacebook(postData)
            break
          default:
            result = {
              success: false,
              platform: platform,
              error: `Unsupported platform: ${platform}`
            }
        }
        
        results.push(result)
      } catch (error) {
        console.error(`Error posting to ${platform}:`, error)
        results.push({
          success: false,
          platform: platform,
          error: error.message
        })
      }
    }
    
    return results
  }

  /**
   * Schedule posts for later
   * @param {Object} adVariation - Ad variation data
   * @param {Array} platforms - Target platforms
   * @param {Date} scheduledTime - When to post
   * @param {Object} credentials - Platform credentials
   * @returns {Promise<Object>} Scheduling result
   */
  async schedulePost(adVariation, platforms, scheduledTime, credentials = {}) {
    try {
      // In a real implementation, you would store this in a database
      // and have a background job processor handle the scheduled posts
      const scheduledPost = {
        id: `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adVariation,
        platforms,
        scheduledTime,
        credentials: this.sanitizeCredentials(credentials),
        status: 'scheduled',
        createdAt: new Date().toISOString()
      }
      
      // Mock storage (in production, save to database)
      console.log('Scheduled post:', scheduledPost)
      
      return {
        success: true,
        scheduledPostId: scheduledPost.id,
        scheduledTime: scheduledTime,
        platforms: platforms
      }
    } catch (error) {
      console.error('Schedule Post Error:', error)
      throw new Error(`Failed to schedule post: ${error.message}`)
    }
  }

  /**
   * Get posting analytics
   * @param {Array} postResults - Array of post results
   * @returns {Object} Analytics summary
   */
  getPostingAnalytics(postResults) {
    const total = postResults.length
    const successful = postResults.filter(r => r.success).length
    const failed = total - successful
    
    const platformBreakdown = postResults.reduce((acc, result) => {
      const platform = result.platform
      if (!acc[platform]) {
        acc[platform] = { total: 0, successful: 0, failed: 0 }
      }
      acc[platform].total++
      if (result.success) {
        acc[platform].successful++
      } else {
        acc[platform].failed++
      }
      return acc
    }, {})
    
    return {
      overview: {
        total,
        successful,
        failed,
        successRate: total > 0 ? ((successful / total) * 100).toFixed(2) : 0
      },
      platformBreakdown,
      errors: postResults.filter(r => !r.success).map(r => ({
        platform: r.platform,
        error: r.error
      }))
    }
  }

  /**
   * Validate platform credentials
   * @param {string} platform - Platform name
   * @param {Object} credentials - Platform credentials
   * @returns {Promise<Object>} Validation result
   */
  async validateCredentials(platform, credentials) {
    try {
      switch (platform.toLowerCase()) {
        case 'farcaster':
          if (!credentials.signerUuid) {
            return { valid: false, error: 'Signer UUID is required for Farcaster' }
          }
          // Test with a simple API call
          try {
            await this.getFarcasterUser(credentials.fid || '1')
            return { valid: true }
          } catch (error) {
            return { valid: false, error: 'Invalid Farcaster credentials' }
          }
          
        case 'instagram':
        case 'tiktok':
        case 'twitter':
        case 'facebook':
          if (!credentials.accessToken) {
            return { valid: false, error: `Access token is required for ${platform}` }
          }
          // In production, you would test the token with a simple API call
          return { valid: true }
          
        default:
          return { valid: false, error: `Unsupported platform: ${platform}` }
      }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }

  /**
   * Get supported platforms
   * @returns {Array} List of supported platforms
   */
  getSupportedPlatforms() {
    return [
      {
        id: 'farcaster',
        name: 'Farcaster',
        icon: '🟣',
        description: 'Decentralized social network',
        requiresAuth: true,
        authFields: ['signerUuid', 'fid'],
        mediaTypes: ['image', 'text'],
        maxTextLength: 320
      },
      {
        id: 'instagram',
        name: 'Instagram',
        icon: '📷',
        description: 'Photo and video sharing',
        requiresAuth: true,
        authFields: ['accessToken'],
        mediaTypes: ['image', 'video'],
        maxTextLength: 2200
      },
      {
        id: 'tiktok',
        name: 'TikTok',
        icon: '🎵',
        description: 'Short-form video content',
        requiresAuth: true,
        authFields: ['accessToken'],
        mediaTypes: ['video'],
        maxTextLength: 150
      },
      {
        id: 'twitter',
        name: 'Twitter/X',
        icon: '🐦',
        description: 'Microblogging platform',
        requiresAuth: true,
        authFields: ['accessToken'],
        mediaTypes: ['image', 'text'],
        maxTextLength: 280
      },
      {
        id: 'facebook',
        name: 'Facebook',
        icon: '👥',
        description: 'Social networking',
        requiresAuth: true,
        authFields: ['accessToken'],
        mediaTypes: ['image', 'video', 'text'],
        maxTextLength: 63206
      }
    ]
  }

  /**
   * Sanitize credentials for storage (remove sensitive data)
   * @param {Object} credentials - Raw credentials
   * @returns {Object} Sanitized credentials
   */
  sanitizeCredentials(credentials) {
    const sanitized = {}
    
    Object.keys(credentials).forEach(platform => {
      sanitized[platform] = {
        ...credentials[platform],
        // Remove or mask sensitive tokens
        accessToken: credentials[platform]?.accessToken ? '***masked***' : undefined,
        signerUuid: credentials[platform]?.signerUuid ? '***masked***' : undefined
      }
    })
    
    return sanitized
  }

  /**
   * Get platform-specific posting guidelines
   * @param {string} platform - Platform name
   * @returns {Object} Platform guidelines
   */
  getPlatformGuidelines(platform) {
    const guidelines = {
      farcaster: {
        bestTimes: ['9:00 AM', '1:00 PM', '7:00 PM'],
        hashtagLimit: 5,
        imageSpecs: { width: 1200, height: 630, format: 'jpg,png' },
        tips: [
          'Engage with the community authentically',
          'Use relevant channels for better reach',
          'Keep content concise and valuable'
        ]
      },
      instagram: {
        bestTimes: ['11:00 AM', '2:00 PM', '5:00 PM'],
        hashtagLimit: 30,
        imageSpecs: { width: 1080, height: 1080, format: 'jpg,png' },
        tips: [
          'Use high-quality visuals',
          'Include relevant hashtags',
          'Post consistently',
          'Engage with comments quickly'
        ]
      },
      tiktok: {
        bestTimes: ['6:00 AM', '10:00 AM', '7:00 PM'],
        hashtagLimit: 10,
        videoSpecs: { width: 1080, height: 1920, format: 'mp4', duration: '15-60s' },
        tips: [
          'Follow trending sounds and effects',
          'Keep videos short and engaging',
          'Use trending hashtags',
          'Post at peak hours'
        ]
      },
      twitter: {
        bestTimes: ['8:00 AM', '12:00 PM', '9:00 PM'],
        hashtagLimit: 3,
        imageSpecs: { width: 1200, height: 675, format: 'jpg,png' },
        tips: [
          'Keep tweets concise',
          'Use relevant hashtags sparingly',
          'Engage in conversations',
          'Share valuable content'
        ]
      },
      facebook: {
        bestTimes: ['9:00 AM', '1:00 PM', '3:00 PM'],
        hashtagLimit: 5,
        imageSpecs: { width: 1200, height: 630, format: 'jpg,png' },
        tips: [
          'Focus on community building',
          'Share engaging visual content',
          'Respond to comments promptly',
          'Use Facebook-specific features'
        ]
      }
    }
    
    return guidelines[platform.toLowerCase()] || null
  }
}

export const socialMediaService = new SocialMediaService()
export default socialMediaService
