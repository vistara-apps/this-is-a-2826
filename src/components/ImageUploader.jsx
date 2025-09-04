import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image } from 'lucide-react'

const ImageUploader = ({ onImageUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      // Create a mock URL for demo purposes
      const mockURL = `https://picsum.photos/400/400?random=${Date.now()}`
      onImageUpload(mockURL)
    }
  }, [onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: false
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-gray-300 hover:border-primary hover:bg-gray-50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-4">
        {isDragActive ? (
          <Image className="w-12 h-12 text-primary" />
        ) : (
          <Upload className="w-12 h-12 text-text-secondary" />
        )}
        <div>
          <p className="text-text-primary font-medium">
            {isDragActive ? 'Drop your image here' : 'Upload your product image'}
          </p>
          <p className="text-text-secondary text-sm mt-1">
            Drag & drop or click to select (PNG, JPG, GIF)
          </p>
        </div>
      </div>
    </div>
  )
}

export default ImageUploader