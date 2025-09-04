import React, { useState } from 'react'
import { CreditCard, User, Bell, Zap, Check } from 'lucide-react'
import { useCampaigns } from '../context/CampaignContext'

const Settings = () => {
  const { currentUser } = useCampaigns()
  const [activeTab, setActiveTab] = useState('account')

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'subscription', label: 'Subscription', icon: Zap },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  const subscriptionPlans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      features: ['5 ad variations/month', 'Basic analytics', 'Email support'],
      current: false,
    },
    {
      name: 'Growth',
      price: '$29',
      period: '/month',
      features: ['50 ad variations/month', 'Advanced analytics', 'Auto-posting', 'Priority support'],
      current: true,
    },
    {
      name: 'Pro',
      price: '$79',
      period: '/month',
      features: ['Unlimited variations', 'Custom AI models', 'Team collaboration', 'Phone support'],
      current: false,
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/80">Manage your account and preferences</p>
      </div>

      <div className="card">
        {/* Tab Navigation */}
        <div className="border-b mb-6">
          <nav className="flex space-x-8">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'account' && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-6">Account Information</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={currentUser.email}
                    className="input w-full"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Account Created
                  </label>
                  <input
                    type="text"
                    value={new Date(currentUser.createdAt).toLocaleDateString()}
                    className="input w-full"
                    readOnly
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Current Plan
                </label>
                <div className="flex items-center space-x-2">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                    {currentUser.subscriptionTier}
                  </span>
                  <span className="text-text-secondary text-sm">
                    Active subscription
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button className="btn-primary">
                  Update Account Information
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-6">Subscription Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => (
                <div key={plan.name} className={`border rounded-lg p-6 ${
                  plan.current ? 'border-primary bg-primary/5' : 'border-gray-300'
                }`}>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-text-primary">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                      <span className="text-text-secondary">{plan.period}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check size={16} className="text-green-500" />
                        <span className="text-text-secondary text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className={`w-full py-2 px-4 rounded-lg font-medium ${
                    plan.current 
                      ? 'bg-gray-100 text-text-secondary cursor-not-allowed'
                      : 'bg-primary text-white hover:opacity-90'
                  }`}>
                    {plan.current ? 'Current Plan' : 'Upgrade'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-6">Billing Information</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-text-primary">Current Plan</span>
                  <span className="text-primary font-semibold">Growth - $29/month</span>
                </div>
                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <span>Next billing date</span>
                  <span>February 15, 2024</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-4">Payment Method</h3>
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                    <div>
                      <p className="font-medium text-text-primary">•••• •••• •••• 4242</p>
                      <p className="text-sm text-text-secondary">Expires 12/26</p>
                    </div>
                  </div>
                  <button className="btn-secondary text-sm">
                    Update
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-4">Billing History</h3>
                <div className="space-y-3">
                  {[
                    { date: 'Jan 15, 2024', amount: '$29.00', status: 'Paid' },
                    { date: 'Dec 15, 2023', amount: '$29.00', status: 'Paid' },
                    { date: 'Nov 15, 2023', amount: '$29.00', status: 'Paid' },
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium text-text-primary">{invoice.date}</p>
                        <p className="text-sm text-text-secondary">Growth Plan</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-text-primary">{invoice.amount}</p>
                        <span className="text-sm text-green-600">{invoice.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-6">Notification Preferences</h2>
            <div className="space-y-6">
              {[
                {
                  title: 'Campaign Updates',
                  description: 'Get notified when your ad variations are generated or published',
                  enabled: true,
                },
                {
                  title: 'Performance Alerts',
                  description: 'Receive alerts when your ads reach performance thresholds',
                  enabled: true,
                },
                {
                  title: 'Weekly Reports',
                  description: 'Get weekly performance summaries via email',
                  enabled: false,
                },
                {
                  title: 'Billing Notifications',
                  description: 'Receive notifications about billing and subscription changes',
                  enabled: true,
                },
                {
                  title: 'Product Updates',
                  description: 'Stay informed about new features and improvements',
                  enabled: false,
                },
              ].map((notification, index) => (
                <div key={index} className="flex items-center justify-between py-4 border-b">
                  <div>
                    <h3 className="font-medium text-text-primary">{notification.title}</h3>
                    <p className="text-sm text-text-secondary">{notification.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={notification.enabled} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings