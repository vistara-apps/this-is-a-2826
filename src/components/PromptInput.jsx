import React from 'react'
import { Plus, X } from 'lucide-react'

const PromptInput = ({ prompts, onChange, placeholder }) => {
  const addPrompt = () => {
    onChange([...prompts, ''])
  }

  const removePrompt = (index) => {
    if (prompts.length > 1) {
      onChange(prompts.filter((_, i) => i !== index))
    }
  }

  const updatePrompt = (index, value) => {
    const updated = prompts.map((prompt, i) => i === index ? value : prompt)
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {prompts.map((prompt, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="flex-1">
            <textarea
              value={prompt}
              onChange={(e) => updatePrompt(index, e.target.value)}
              placeholder={placeholder}
              className="input w-full h-20 resize-none"
            />
          </div>
          {prompts.length > 1 && (
            <button
              onClick={() => removePrompt(index)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      ))}
      
      <button
        onClick={addPrompt}
        className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
      >
        <Plus size={20} />
        <span>Add another prompt</span>
      </button>
    </div>
  )
}

export default PromptInput