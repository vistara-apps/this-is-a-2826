import axios from 'axios'
import { config } from '../config/env.js'

class OpenAIService {
  constructor() {
    this.apiKey = config.openai.apiKey
    this.baseURL = config.openai.baseURL
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Generate ad images using DALL-E
   * @param {string} prompt - The image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Array of generated image URLs
   */
  async generateAdImages(prompt, options = {}) {
    try {
      const {
        n = 1,
        size = '1024x1024',
        quality = 'standard',
        style = 'vivid'
      } = options

      const response = await this.client.post('/images/generations', {
        model: 'dall-e-3',
        prompt: this.enhancePromptForAds(prompt),
        n,
        size,
        quality,
        style,
      })

      return response.data.data.map(item => ({
        url: item.url,
        revisedPrompt: item.revised_prompt
      }))
    } catch (error) {
      console.error('OpenAI Image Generation Error:', error)
      throw new Error(`Failed to generate images: ${error.response?.data?.error?.message || error.message}`)
    }
  }

  /**
   * Generate image variations from an existing image
   * @param {File|string} image - Base image file or URL
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Array of image variation URLs
   */
  async generateImageVariations(image, options = {}) {
    try {
      const { n = 2, size = '1024x1024' } = options
      
      const formData = new FormData()
      if (typeof image === 'string') {
        // If image is a URL, we need to fetch it first
        const imageResponse = await fetch(image)
        const imageBlob = await imageResponse.blob()
        formData.append('image', imageBlob, 'image.png')
      } else {
        formData.append('image', image)
      }
      
      formData.append('n', n.toString())
      formData.append('size', size)

      const response = await this.client.post('/images/variations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data.data.map(item => item.url)
    } catch (error) {
      console.error('OpenAI Image Variation Error:', error)
      throw new Error(`Failed to generate image variations: ${error.response?.data?.error?.message || error.message}`)
    }
  }

  /**
   * Enhance prompt specifically for ad generation
   * @param {string} basePrompt - Base prompt from user
   * @returns {string} Enhanced prompt for better ad generation
   */
  enhancePromptForAds(basePrompt) {
    const adEnhancements = [
      'professional advertising photography',
      'high-quality commercial style',
      'clean background',
      'marketing-focused composition',
      'eye-catching and engaging',
      'suitable for social media advertising'
    ]
    
    return `${basePrompt}, ${adEnhancements.join(', ')}, 4K resolution, studio lighting`
  }

  /**
   * Generate multiple ad variations with different styles
   * @param {string} productDescription - Description of the product
   * @param {Array} stylePrompts - Array of style variations
   * @returns {Promise<Array>} Array of generated ad images
   */
  async generateAdVariations(productDescription, stylePrompts = []) {
    const defaultStyles = [
      'minimalist modern style',
      'vibrant colorful design',
      'elegant luxury aesthetic',
      'playful and fun approach'
    ]
    
    const styles = stylePrompts.length > 0 ? stylePrompts : defaultStyles
    const variations = []
    
    for (const style of styles) {
      try {
        const prompt = `${productDescription}, ${style}`
        const images = await this.generateAdImages(prompt, { n: 1 })
        variations.push({
          style,
          images,
          prompt
        })
      } catch (error) {
        console.error(`Failed to generate variation for style: ${style}`, error)
        // Continue with other styles even if one fails
      }
    }
    
    return variations
  }
}

export const openaiService = new OpenAIService()
export default openaiService
