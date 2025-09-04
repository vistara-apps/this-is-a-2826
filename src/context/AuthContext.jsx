import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabaseService } from '../services/supabaseService.js'
import { stripeService } from '../services/stripeService.js'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState(null)

  // Initialize auth state
  useEffect(() => {
    initializeAuth()
    
    // Listen for auth changes
    const { data: { subscription } } = supabaseService.client.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await handleUserSignIn(session.user)
        } else if (event === 'SIGNED_OUT') {
          handleUserSignOut()
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  /**
   * Initialize authentication state
   */
  const initializeAuth = async () => {
    try {
      const currentUser = await supabaseService.getCurrentUser()
      if (currentUser) {
        await handleUserSignIn(currentUser)
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle user sign in
   * @param {Object} user - User object from Supabase
   */
  const handleUserSignIn = async (user) => {
    try {
      setUser(user)
      
      // Get or create user profile
      let userProfile
      try {
        userProfile = await supabaseService.getUserProfile(user.id)
      } catch (error) {
        // Profile doesn't exist, create it
        userProfile = await supabaseService.upsertUserProfile(user.id, {
          email: user.email,
          subscriptionTier: 'Free',
          createdAt: new Date().toISOString()
        })
      }
      
      setProfile(userProfile)
      
      // Get subscription status
      try {
        const subscriptionStatus = await stripeService.getSubscriptionStatus(user.id)
        setSubscription(subscriptionStatus)
      } catch (error) {
        console.error('Failed to get subscription status:', error)
        // Set default subscription for free tier
        setSubscription({
          tier: 'Free',
          status: 'active',
          limits: stripeService.getSubscriptionTiers()[0].limits
        })
      }
      
    } catch (error) {
      console.error('Error handling user sign in:', error)
      toast.error('Failed to load user profile')
    }
  }

  /**
   * Handle user sign out
   */
  const handleUserSignOut = () => {
    setUser(null)
    setProfile(null)
    setSubscription(null)
  }

  /**
   * Sign up new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Sign up result
   */
  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true)
      const result = await supabaseService.signUp(email, password, metadata)
      
      if (result.user) {
        toast.success('Account created successfully! Please check your email to verify your account.')
      }
      
      return result
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error(error.message || 'Failed to create account')
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sign in user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Sign in result
   */
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const result = await supabaseService.signIn(email, password)
      
      if (result.user) {
        toast.success('Welcome back!')
      }
      
      return result
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error(error.message || 'Failed to sign in')
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sign out user
   */
  const signOut = async () => {
    try {
      setLoading(true)
      await supabaseService.signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated profile
   */
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in')
      
      const updatedProfile = await supabaseService.upsertUserProfile(user.id, updates)
      setProfile(updatedProfile)
      toast.success('Profile updated successfully')
      return updatedProfile
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('Failed to update profile')
      throw error
    }
  }

  /**
   * Subscribe to a tier
   * @param {string} tier - Subscription tier
   * @returns {Promise<void>}
   */
  const subscribeToTier = async (tier) => {
    try {
      if (!user) throw new Error('No user logged in')
      
      await stripeService.subscribeToTier({
        tier,
        userId: user.id
      })
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error('Failed to process subscription')
      throw error
    }
  }

  /**
   * Cancel subscription
   * @returns {Promise<void>}
   */
  const cancelSubscription = async () => {
    try {
      if (!subscription?.subscriptionId) {
        throw new Error('No active subscription found')
      }
      
      await stripeService.cancelSubscription(subscription.subscriptionId)
      
      // Update local subscription state
      setSubscription(prev => ({
        ...prev,
        status: 'cancelled',
        cancelAt: new Date().toISOString()
      }))
      
      toast.success('Subscription cancelled successfully')
    } catch (error) {
      console.error('Cancel subscription error:', error)
      toast.error('Failed to cancel subscription')
      throw error
    }
  }

  /**
   * Check if user can perform an action based on subscription limits
   * @param {string} action - Action type
   * @param {Object} currentUsage - Current usage stats
   * @returns {Object} Permission result
   */
  const checkPermission = (action, currentUsage = {}) => {
    if (!user || !subscription) {
      return {
        allowed: false,
        reason: 'Please sign in to continue',
        upgradeRequired: false
      }
    }
    
    return stripeService.checkSubscriptionLimits(
      { subscriptionTier: subscription.tier },
      action,
      currentUsage
    )
  }

  /**
   * Get current usage statistics
   * @returns {Promise<Object>} Usage statistics
   */
  const getUsageStats = async () => {
    try {
      if (!user) return {}
      
      const campaigns = await supabaseService.getUserCampaigns(user.id)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      const variationsThisMonth = campaigns.reduce((count, campaign) => {
        const campaignVariations = campaign.adVariations || []
        return count + campaignVariations.filter(variation => {
          const createdDate = new Date(variation.createdAt)
          return createdDate.getMonth() === currentMonth && 
                 createdDate.getFullYear() === currentYear
        }).length
      }, 0)
      
      const activeCampaigns = campaigns.length
      const platformCount = new Set(
        campaigns.flatMap(c => (c.adVariations || []).map(v => v.platform))
      ).size
      
      return {
        variationsThisMonth,
        activeCampaigns,
        platformCount,
        totalCampaigns: campaigns.length,
        totalVariations: campaigns.reduce((sum, c) => sum + (c.adVariations?.length || 0), 0)
      }
    } catch (error) {
      console.error('Get usage stats error:', error)
      return {}
    }
  }

  /**
   * Refresh subscription status
   */
  const refreshSubscription = async () => {
    try {
      if (!user) return
      
      const subscriptionStatus = await stripeService.getSubscriptionStatus(user.id)
      setSubscription(subscriptionStatus)
    } catch (error) {
      console.error('Refresh subscription error:', error)
    }
  }

  /**
   * Reset password
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  const resetPassword = async (email) => {
    try {
      await supabaseService.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      toast.success('Password reset email sent!')
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('Failed to send reset email')
      throw error
    }
  }

  /**
   * Update password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  const updatePassword = async (newPassword) => {
    try {
      await supabaseService.client.auth.updateUser({
        password: newPassword
      })
      toast.success('Password updated successfully')
    } catch (error) {
      console.error('Update password error:', error)
      toast.error('Failed to update password')
      throw error
    }
  }

  const value = {
    // State
    user,
    profile,
    subscription,
    loading,
    
    // Auth methods
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    
    // Subscription methods
    subscribeToTier,
    cancelSubscription,
    refreshSubscription,
    
    // Utility methods
    checkPermission,
    getUsageStats,
    
    // Computed values
    isAuthenticated: !!user,
    isEmailVerified: user?.email_confirmed_at != null,
    subscriptionTier: subscription?.tier || 'Free',
    subscriptionLimits: subscription?.limits || stripeService.getSubscriptionTiers()[0].limits
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
