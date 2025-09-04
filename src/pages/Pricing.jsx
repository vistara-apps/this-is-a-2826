import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { stripeService } from '../services/stripeService'
import { Check, Zap, Crown, Star, Wand2 } from 'lucide-react'
import toast from 'react-hot-toast'

const Pricing = () => {
  const { isAuthenticated, subscribeToTier, subscriptionTier } = useAuth()
  const [loading, setLoading] = useState(null)
  const [billingCycle, setBillingCycle] = useState('monthly')

  const tiers = stripeService.getSubscriptionTiers()

  const handleSubscribe = async (tier) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to subscribe')
      return
    }

    if (tier.id === subscriptionTier) {
      toast.info('You are already on this plan')
      return
    }

    try {
      setLoading(tier.id)
      await subscribeToTier(tier.id)
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setLoading(null)
    }
  }

  const getTierIcon = (tierId) => {
    switch (tierId) {
      case 'Free':
        return <Wand2 className="w-8 h-8" />
      case 'Growth':
        return <Zap className="w-8 h-8" />
      case 'Pro':
        return <Crown className="w-8 h-8" />
      default:
        return <Star className="w-8 h-8" />
    }
  }

  const getTierColor = (tierId) => {
    switch (tierId) {
      case 'Free':
        return 'from-gray-500 to-gray-600'
      case 'Growth':
        return 'from-blue-500 to-purple-600'
      case 'Pro':
        return 'from-purple-600 to-pink-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto">
            Start creating AI-powered ad variations that convert. 
            Scale your marketing with our flexible pricing plans.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/20">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => {
            const isCurrentPlan = tier.id === subscriptionTier
            const isPopular = tier.popular
            const yearlyPrice = billingCycle === 'yearly' ? Math.round(tier.price * 0.8) : tier.price
            
            return (
              <div
                key={tier.id}
                className={`relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border transition-all duration-300 hover:scale-105 ${
                  isPopular
                    ? 'border-white/40 shadow-2xl ring-2 ring-white/20'
                    : 'border-white/20 hover:border-white/30'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Current Plan
                    </div>
                  </div>
                )}

                {/* Tier Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${getTierColor(tier.id)} mb-4`}>
                    <div className="text-white">
                      {getTierIcon(tier.id)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">
                      ${billingCycle === 'yearly' ? yearlyPrice : tier.price}
                    </span>
                    <span className="text-white/60 ml-1">
                      /{billingCycle === 'yearly' ? 'month' : 'month'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && tier.price > 0 && (
                    <p className="text-sm text-green-400 mt-1">
                      Save ${(tier.price - yearlyPrice) * 12}/year
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Usage Limits */}
                <div className="bg-white/5 rounded-xl p-4 mb-8">
                  <h4 className="text-white font-semibold mb-3">Usage Limits</h4>
                  <div className="space-y-2 text-sm text-white/70">
                    <div className="flex justify-between">
                      <span>Ad Variations/Month</span>
                      <span className="text-white font-medium">
                        {tier.limits.variationsPerMonth === -1 ? 'Unlimited' : tier.limits.variationsPerMonth}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Campaigns</span>
                      <span className="text-white font-medium">
                        {tier.limits.campaigns === -1 ? 'Unlimited' : tier.limits.campaigns}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platforms</span>
                      <span className="text-white font-medium">
                        {tier.limits.platforms === -1 ? 'All' : tier.limits.platforms}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(tier)}
                  disabled={loading === tier.id || isCurrentPlan}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    isCurrentPlan
                      ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                      : tier.id === 'Free'
                      ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                      : isPopular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
                      : 'bg-white text-purple-600 hover:bg-white/90'
                  } ${loading === tier.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading === tier.id ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : tier.id === 'Free' ? (
                    isAuthenticated ? 'Current Plan' : 'Get Started Free'
                  ) : (
                    `Upgrade to ${tier.name}`
                  )}
                </button>

                {tier.id === 'Free' && !isAuthenticated && (
                  <p className="text-center text-white/60 text-xs mt-3">
                    <Link to="/signup" className="hover:text-white underline">
                      Sign up
                    </Link>{' '}
                    to get started
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-white/70">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate any billing differences.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">
                What happens if I exceed my limits?
              </h3>
              <p className="text-white/70">
                We'll notify you when you're approaching your limits. You can upgrade anytime to continue 
                creating variations without interruption.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">
                Do you offer refunds?
              </h3>
              <p className="text-white/70">
                We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, 
                contact us for a full refund.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">
                Is there a free trial?
              </h3>
              <p className="text-white/70">
                Yes! Our Free plan gives you 5 ad variations per month to try out AdRemixr. 
                No credit card required.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Ad Creation?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Join thousands of marketers who are already creating high-converting ad variations with AI.
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors"
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/login"
                  className="bg-white/10 text-white px-8 py-3 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <Link
                to="/"
                className="inline-block bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing
