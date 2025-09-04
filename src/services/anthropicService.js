import axios from 'axios'
import { config } from '../config/env.js'

class AnthropicService {
  constructor() {
    this.apiKey = config.anthropic.apiKey
    this.baseURL = config.anthropic.baseURL
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
    })
  }

  /**
   * Generate ad copy using Claude
   * @param {string} prompt - The copywriting prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated ad copy
   */
  async generateAdCopy(prompt, options = {}) {
    try {
      const {
        maxTokens = 1000,
        temperature = 0.7,
        platform = 'Instagram'
      } = options

      const systemPrompt = this.getSystemPromptForPlatform(platform)
      const enhancedPrompt = this.enhancePromptForCopy(prompt, platform)

      const response = await this.client.post('/messages', {
        model: 'claude-3-sonnet-20240229',
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ]
      })

      return response.data.content[0].text.trim()
    } catch (error) {
      console.error('Anthropic Copy Generation Error:', error)
      throw new Error(`Failed to generate ad copy: ${error.response?.data?.error?.message || error.message}`)
    }
  }

  /**
   * Generate multiple copy variations for different platforms
   * @param {string} productDescription - Description of the product
   * @param {Array} platforms - Target platforms
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Array of copy variations
   */
  async generateCopyVariations(productDescription, platforms = ['Instagram', 'TikTok'], options = {}) {
    const variations = []
    
    for (const platform of platforms) {
      try {
        // Generate multiple variations per platform
        const copyPromises = [
          this.generateAdCopy(`Create an engaging ${platform} ad for: ${productDescription}`, { ...options, platform }),
          this.generateAdCopy(`Write a compelling ${platform} post about: ${productDescription}`, { ...options, platform }),
          this.generateAdCopy(`Generate a trendy ${platform} caption for: ${productDescription}`, { ...options, platform })
        ]
        
        const copies = await Promise.all(copyPromises)
        
        variations.push({
          platform,
          copies: copies.map((copy, index) => ({
            variation: index + 1,
            text: copy,
            type: ['engaging', 'compelling', 'trendy'][index]
          }))
        })
      } catch (error) {
        console.error(`Failed to generate copy for platform: ${platform}`, error)
        // Continue with other platforms even if one fails
      }
    }
    
    return variations
  }

  /**
   * Analyze ad performance and suggest improvements
   * @param {Object} adData - Ad performance data
   * @returns {Promise<Object>} Analysis and suggestions
   */
  async analyzeAdPerformance(adData) {
    try {
      const prompt = `
        Analyze this ad performance data and provide actionable insights:
        
        Ad Copy: "${adData.copy}"
        Platform: ${adData.platform}
        Impressions: ${adData.impressions}
        Clicks: ${adData.clicks}
        Conversions: ${adData.conversions}
        CTR: ${adData.ctr}%
        CPC: $${adData.cpc}
        
        Please provide:
        1. Performance assessment
        2. Areas for improvement
        3. Specific copy suggestions
        4. Platform-specific recommendations
      `

      const response = await this.client.post('/messages', {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        temperature: 0.3,
        system: 'You are an expert digital marketing analyst specializing in social media advertising optimization.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      return this.parseAnalysisResponse(response.data.content[0].text)
    } catch (error) {
      console.error('Anthropic Analysis Error:', error)
      throw new Error(`Failed to analyze ad performance: ${error.response?.data?.error?.message || error.message}`)
    }
  }

  /**
   * Get system prompt optimized for specific platform
   * @param {string} platform - Target platform
   * @returns {string} System prompt
   */
  getSystemPromptForPlatform(platform) {
    const platformPrompts = {
      Instagram: `You are an expert Instagram marketing copywriter. Create engaging, visually-focused ad copy that works well with images. Use relevant hashtags, emojis, and Instagram-native language. Keep it concise but impactful.`,
      TikTok: `You are a TikTok marketing expert. Create trendy, authentic ad copy that resonates with Gen Z and millennial audiences. Use current slang, trending phrases, and a casual, relatable tone. Focus on entertainment value and viral potential.`,
      Facebook: `You are a Facebook advertising specialist. Create compelling ad copy that drives conversions. Use clear value propositions, social proof, and strong calls-to-action. Target a broader demographic with professional yet approachable language.`,
      Twitter: `You are a Twitter marketing expert. Create concise, witty ad copy that fits the platform's character limit and conversational nature. Use trending topics, relevant hashtags, and engaging questions or statements.`,
      LinkedIn: `You are a LinkedIn advertising professional. Create business-focused ad copy that appeals to professionals and decision-makers. Use industry terminology, focus on ROI and business benefits, and maintain a professional tone.`
    }
    
    return platformPrompts[platform] || platformPrompts.Instagram
  }

  /**
   * Enhance prompt with platform-specific context
   * @param {string} basePrompt - Base prompt from user
   * @param {string} platform - Target platform
   * @returns {string} Enhanced prompt
   */
  enhancePromptForCopy(basePrompt, platform) {
    const platformContext = {
      Instagram: 'Focus on visual storytelling, use 3-5 relevant hashtags, include emojis strategically',
      TikTok: 'Make it trendy and authentic, use current slang, focus on entertainment and relatability',
      Facebook: 'Include clear value proposition, social proof elements, and strong call-to-action',
      Twitter: 'Keep it under 280 characters, make it conversational and engaging',
      LinkedIn: 'Professional tone, focus on business benefits and ROI, target decision-makers'
    }
    
    const context = platformContext[platform] || platformContext.Instagram
    return `${basePrompt}\n\nPlatform-specific requirements: ${context}\n\nGenerate compelling ad copy that follows these guidelines.`
  }

  /**
   * Parse analysis response into structured format
   * @param {string} analysisText - Raw analysis text from Claude
   * @returns {Object} Structured analysis object
   */
  parseAnalysisResponse(analysisText) {
    // Simple parsing - in production, you might want more sophisticated parsing
    const sections = analysisText.split(/\d+\.\s+/)
    
    return {
      fullAnalysis: analysisText,
      assessment: sections[1] || '',
      improvements: sections[2] || '',
      copySuggestions: sections[3] || '',
      platformRecommendations: sections[4] || '',
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Generate trending hashtags for a product/campaign
   * @param {string} productDescription - Product description
   * @param {string} platform - Target platform
   * @returns {Promise<Array>} Array of suggested hashtags
   */
  async generateHashtags(productDescription, platform = 'Instagram') {
    try {
      const prompt = `Generate 10-15 relevant and trending hashtags for this product on ${platform}: ${productDescription}. 
      Include a mix of:
      - Popular general hashtags
      - Niche-specific hashtags
      - Branded hashtags
      - Trending hashtags
      
      Return only the hashtags, one per line, with # symbol.`

      const response = await this.client.post('/messages', {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        temperature: 0.5,
        system: `You are a social media hashtag expert with deep knowledge of ${platform} trends.`,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      return response.data.content[0].text
        .split('\n')
        .filter(line => line.trim().startsWith('#'))
        .map(hashtag => hashtag.trim())
    } catch (error) {
      console.error('Hashtag Generation Error:', error)
      throw new Error(`Failed to generate hashtags: ${error.response?.data?.error?.message || error.message}`)
    }
  }
}

export const anthropicService = new AnthropicService()
export default anthropicService
