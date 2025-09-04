import { loadStripe } from '@stripe/stripe-js'
import { config } from '../config/env.js'
import axios from 'axios'

class StripeService {
  constructor() {
    this.stripePromise = loadStripe(config.stripe.publishableKey)
    this.apiClient = axios.create({
      baseURL: '/api/stripe', // This would be your backend API endpoint
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Get Stripe instance
   * @returns {Promise<Stripe>} Stripe instance
   */
  async getStripe() {
    return await this.stripePromise
  }

  /**
   * Create checkout session for subscription
   * @param {Object} subscriptionData - Subscription details
   * @returns {Promise<Object>} Checkout session
   */
  async createCheckoutSession(subscriptionData) {
    try {
      const { data } = await this.apiClient.post('/create-checkout-session', {
        priceId: subscriptionData.priceId,
        userId: subscriptionData.userId,
        successUrl: subscriptionData.successUrl || `${window.location.origin}/success`,
        cancelUrl: subscriptionData.cancelUrl || `${window.location.origin}/pricing`,
        mode: 'subscription',
        metadata: {
          userId: subscriptionData.userId,
          tier: subscriptionData.tier
        }
      })

      return data
    } catch (error) {
      console.error('Stripe Checkout Error:', error)
      throw new Error(`Failed to create checkout session: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Redirect to Stripe Checkout
   * @param {string} sessionId - Checkout session ID
   * @returns {Promise<void>}
   */
  async redirectToCheckout(sessionId) {
    try {
      const stripe = await this.getStripe()
      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Stripe Redirect Error:', error)
      throw new Error(`Failed to redirect to checkout: ${error.message}`)
    }
  }

  /**
   * Create subscription checkout flow
   * @param {Object} options - Subscription options
   * @returns {Promise<void>}
   */
  async subscribeToTier(options) {
    try {
      const { tier, userId } = options
      const priceIds = this.getPriceIds()
      
      if (!priceIds[tier]) {
        throw new Error(`Invalid subscription tier: ${tier}`)
      }

      const session = await this.createCheckoutSession({
        priceId: priceIds[tier],
        userId,
        tier,
        successUrl: `${window.location.origin}/dashboard?subscription=success`,
        cancelUrl: `${window.location.origin}/pricing?subscription=cancelled`
      })

      await this.redirectToCheckout(session.id)
    } catch (error) {
      console.error('Subscription Error:', error)
      throw error
    }
  }

  /**
   * Get subscription price IDs for different tiers
   * @returns {Object} Price IDs mapping
   */
  getPriceIds() {
    return {
      'Free': null, // Free tier doesn't need a price ID
      'Growth': process.env.VITE_STRIPE_GROWTH_PRICE_ID || 'price_growth_tier',
      'Pro': process.env.VITE_STRIPE_PRO_PRICE_ID || 'price_pro_tier'
    }
  }

  /**
   * Get subscription tiers with pricing
   * @returns {Array} Subscription tiers
   */
  getSubscriptionTiers() {
    return [
      {
        id: 'Free',
        name: 'Free',
        price: 0,
        priceId: null,
        features: [
          '5 ad variations per month',
          'Basic templates',
          'Standard support',
          '1 campaign at a time'
        ],
        limits: {
          variationsPerMonth: 5,
          campaigns: 1,
          platforms: 2
        }
      },
      {
        id: 'Growth',
        name: 'Growth',
        price: 29,
        priceId: this.getPriceIds().Growth,
        features: [
          '50 ad variations per month',
          'Premium templates',
          'Priority support',
          'Unlimited campaigns',
          'Analytics dashboard',
          'A/B testing tools'
        ],
        limits: {
          variationsPerMonth: 50,
          campaigns: -1, // unlimited
          platforms: 5
        },
        popular: true
      },
      {
        id: 'Pro',
        name: 'Pro',
        price: 79,
        priceId: this.getPriceIds().Pro,
        features: [
          'Unlimited ad variations',
          'Custom templates',
          'Dedicated support',
          'Advanced analytics',
          'API access',
          'White-label options',
          'Custom integrations'
        ],
        limits: {
          variationsPerMonth: -1, // unlimited
          campaigns: -1, // unlimited
          platforms: -1 // unlimited
        }
      }
    ]
  }

  /**
   * Get current subscription status
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Subscription status
   */
  async getSubscriptionStatus(userId) {
    try {
      const { data } = await this.apiClient.get(`/subscription-status/${userId}`)
      return data
    } catch (error) {
      console.error('Get Subscription Error:', error)
      throw new Error(`Failed to get subscription status: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Cancel subscription
   * @param {string} subscriptionId - Stripe subscription ID
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelSubscription(subscriptionId) {
    try {
      const { data } = await this.apiClient.post('/cancel-subscription', {
        subscriptionId
      })
      return data
    } catch (error) {
      console.error('Cancel Subscription Error:', error)
      throw new Error(`Failed to cancel subscription: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Update subscription
   * @param {string} subscriptionId - Stripe subscription ID
   * @param {string} newPriceId - New price ID
   * @returns {Promise<Object>} Update result
   */
  async updateSubscription(subscriptionId, newPriceId) {
    try {
      const { data } = await this.apiClient.post('/update-subscription', {
        subscriptionId,
        newPriceId
      })
      return data
    } catch (error) {
      console.error('Update Subscription Error:', error)
      throw new Error(`Failed to update subscription: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Create customer portal session
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<string>} Portal URL
   */
  async createPortalSession(customerId) {
    try {
      const { data } = await this.apiClient.post('/create-portal-session', {
        customerId,
        returnUrl: `${window.location.origin}/settings`
      })
      return data.url
    } catch (error) {
      console.error('Portal Session Error:', error)
      throw new Error(`Failed to create portal session: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get usage-based billing info
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Usage information
   */
  async getUsageInfo(userId) {
    try {
      const { data } = await this.apiClient.get(`/usage/${userId}`)
      return data
    } catch (error) {
      console.error('Get Usage Error:', error)
      throw new Error(`Failed to get usage info: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Record usage for billing
   * @param {string} userId - User ID
   * @param {Object} usage - Usage data
   * @returns {Promise<void>}
   */
  async recordUsage(userId, usage) {
    try {
      await this.apiClient.post('/record-usage', {
        userId,
        ...usage,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Record Usage Error:', error)
      // Don't throw error for usage recording to avoid blocking user actions
    }
  }

  /**
   * Check if user can perform action based on subscription limits
   * @param {Object} user - User object with subscription info
   * @param {string} action - Action type (e.g., 'create_variation', 'create_campaign')
   * @param {Object} currentUsage - Current usage stats
   * @returns {Object} Permission result
   */
  checkSubscriptionLimits(user, action, currentUsage = {}) {
    const tiers = this.getSubscriptionTiers()
    const userTier = tiers.find(tier => tier.id === user.subscriptionTier) || tiers[0]
    
    const result = {
      allowed: true,
      reason: null,
      upgradeRequired: false,
      currentTier: userTier.name,
      limits: userTier.limits
    }

    switch (action) {
      case 'create_variation':
        if (userTier.limits.variationsPerMonth !== -1) {
          const monthlyUsage = currentUsage.variationsThisMonth || 0
          if (monthlyUsage >= userTier.limits.variationsPerMonth) {
            result.allowed = false
            result.reason = `Monthly limit of ${userTier.limits.variationsPerMonth} variations reached`
            result.upgradeRequired = true
          }
        }
        break
        
      case 'create_campaign':
        if (userTier.limits.campaigns !== -1) {
          const activeCampaigns = currentUsage.activeCampaigns || 0
          if (activeCampaigns >= userTier.limits.campaigns) {
            result.allowed = false
            result.reason = `Campaign limit of ${userTier.limits.campaigns} reached`
            result.upgradeRequired = true
          }
        }
        break
        
      case 'add_platform':
        if (userTier.limits.platforms !== -1) {
          const platformCount = currentUsage.platformCount || 0
          if (platformCount >= userTier.limits.platforms) {
            result.allowed = false
            result.reason = `Platform limit of ${userTier.limits.platforms} reached`
            result.upgradeRequired = true
          }
        }
        break
    }

    return result
  }

  /**
   * Get recommended upgrade tier
   * @param {string} currentTier - Current subscription tier
   * @returns {Object|null} Recommended tier or null
   */
  getRecommendedUpgrade(currentTier) {
    const tiers = this.getSubscriptionTiers()
    const currentIndex = tiers.findIndex(tier => tier.id === currentTier)
    
    if (currentIndex < tiers.length - 1) {
      return tiers[currentIndex + 1]
    }
    
    return null
  }
}

export const stripeService = new StripeService()
export default stripeService
