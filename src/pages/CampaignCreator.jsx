import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Wand2, Image, Type, Send } from 'lucide-react'
import { useCampaigns } from '../context/CampaignContext'
import ImageUploader from '../components/ImageUploader'
import PromptInput from '../components/PromptInput'
import PlatformSelector from '../components/PlatformSelector'
import AdVariantCard from '../components/AdVariantCard'

const CampaignCreator = () => {
  const navigate = useNavigate()
  const { addCampaign, addAdVariation } = useCampaigns()
  
  const [step, setStep] = useState(1)
  const [campaignData, setCampaignData] = useState({
    campaignName: '',
    originalImageURL: '',
    platforms: [],
    visualPrompts: [''],
    copyPrompts: [''],
  })
  const [generatedVariations, setGeneratedVariations] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleImageUpload = (imageURL) => {
    setCampaignData(prev => ({ ...prev, originalImageURL: imageURL }))
  }

  const handleGenerateVariations = async () => {
    setIsGenerating(true)
    
    // Create campaign first
    const campaign = addCampaign({
      campaignName: campaignData.campaignName,
      originalImageURL: campaignData.originalImageURL,
    })

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const variations = []
    
    // Generate visual variations
    for (let i = 0; i < campaignData.visualPrompts.length; i++) {
      const prompt = campaignData.visualPrompts[i]
      if (prompt.trim()) {
        const variation = addAdVariation(campaign.campaignId, {
          visualType: 'AI Generated',
          copyType: 'Original',
          visualPrompt: prompt,
          copyPrompt: '',
          generatedImageURL: `https://picsum.photos/400/400?random=${Date.now() + i}`,
          generatedCopy: `Discover amazing products with ${prompt.toLowerCase()}. Transform your style today!`,
          platform: campaignData.platforms[0] || 'Instagram',
          postStatus: 'draft',
        })
        variations.push(variation)
      }
    }

    // Generate copy variations
    for (let i = 0; i < campaignData.copyPrompts.length; i++) {
      const prompt = campaignData.copyPrompts[i]
      if (prompt.trim()) {
        const variation = addAdVariation(campaign.campaignId, {
          visualType: 'Original',
          copyType: 'AI Generated',
          visualPrompt: '',
          copyPrompt: prompt,
          generatedImageURL: campaignData.originalImageURL,
          generatedCopy: `${prompt} - Experience the difference with our premium products. Limited time offer!`,
          platform: campaignData.platforms[0] || 'TikTok',
          postStatus: 'draft',
        })
        variations.push(variation)
      }
    }

    setGeneratedVariations(variations)
    setIsGenerating(false)
    setStep(4)
  }

  const handlePublishVariations = () => {
    // Mark variations as published
    generatedVariations.forEach(variation => {
      variation.postStatus = 'published'
    })
    
    navigate('/')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Create Campaign</h1>
        <p className="text-white/80">Generate AI-powered ad variations for your products</p>
      </div>

      {/* Progress Steps */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          {[
            { num: 1, label: 'Upload & Name', icon: Upload },
            { num: 2, label: 'Visual Prompts', icon: Image },
            { num: 3, label: 'Copy Prompts', icon: Type },
            { num: 4, label: 'Generate & Review', icon: Wand2 },
          ].map(({ num, label, icon: Icon }) => (
            <div key={num} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                step >= num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > num ? '✓' : <Icon size={16} />}
              </div>
              <span className={`ml-2 ${step >= num ? 'text-text-primary' : 'text-text-secondary'}`}>
                {label}
              </span>
              {num < 4 && <div className="w-16 h-px bg-gray-300 mx-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-6">Campaign Setup</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignData.campaignName}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, campaignName: e.target.value }))}
                  className="input w-full"
                  placeholder="Enter campaign name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Product Image
                </label>
                <ImageUploader onImageUpload={handleImageUpload} />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Target Platforms
                </label>
                <PlatformSelector
                  selected={campaignData.platforms}
                  onChange={(platforms) => setCampaignData(prev => ({ ...prev, platforms }))}
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setStep(2)}
                disabled={!campaignData.campaignName || !campaignData.originalImageURL}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Visual Prompts
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-6">Visual Prompts</h2>
            <p className="text-text-secondary mb-6">
              Create prompts to generate different visual styles for your ad
            </p>
            
            <PromptInput
              prompts={campaignData.visualPrompts}
              onChange={(prompts) => setCampaignData(prev => ({ ...prev, visualPrompts: prompts }))}
              placeholder="Describe the visual style you want (e.g., 'minimalist modern design', 'vibrant summer vibes')..."
            />

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="btn-secondary">
                Back
              </button>
              <button onClick={() => setStep(3)} className="btn-primary">
                Next: Copy Prompts
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-6">Copy Prompts</h2>
            <p className="text-text-secondary mb-6">
              Create prompts to generate different copy variations for your ad
            </p>
            
            <PromptInput
              prompts={campaignData.copyPrompts}
              onChange={(prompts) => setCampaignData(prev => ({ ...prev, copyPrompts: prompts }))}
              placeholder="Describe the copy style you want (e.g., 'urgent call-to-action', 'emotional storytelling')..."
            />

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(2)} className="btn-secondary">
                Back
              </button>
              <button onClick={handleGenerateVariations} className="btn-primary">
                Generate Variations
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-6">Generated Variations</h2>
            
            {isGenerating ? (
              <div className="text-center py-12">
                <Wand2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  Generating AI variations...
                </h3>
                <p className="text-text-secondary">
                  This may take a few moments
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {generatedVariations.map((variation) => (
                    <AdVariantCard key={variation.variationId} variation={variation} />
                  ))}
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(3)} className="btn-secondary">
                    Back to Edit
                  </button>
                  <button onClick={handlePublishVariations} className="btn-primary flex items-center space-x-2">
                    <Send size={16} />
                    <span>Publish All Variations</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CampaignCreator