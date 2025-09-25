'use client'
/*
DESCRIPTION: Client-side inspection form component.
- Mobile-first design with large touch targets
- PASS/FAIL/NA buttons for each checklist item
- Note fields and photo capture
- Auto-saves draft to IndexedDB
- Submits inspection data to API

WHAT EACH PART DOES:
1. Form state management - Tracks responses for each item
2. Draft saving - Auto-saves to IndexedDB using idb-keyval
3. Photo capture - Mobile camera integration with compression
4. API submission - Submits to inspection endpoints
5. Mobile optimization - Large buttons, touch-friendly UI

PSEUDOCODE:
- Initialize form state from draft or empty
- Render checklist items with PASS/FAIL/NA buttons
- Handle photo capture and compression
- Auto-save draft on each change
- Submit inspection data to API
*/

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { get, set, del } from 'idb-keyval'

/**
 * Inspection form component
 */
export default function InspectionForm({ checklist }) {
  const router = useRouter()
  const [responses, setResponses] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const fileInputRefs = useRef({})
  const draftKey = `inspection_draft_${checklist.id}`

  // Load draft from IndexedDB on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await get(draftKey)
        if (draft) {
          setResponses(draft)
        }
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }
    loadDraft()
  }, [draftKey])

  // Save draft to IndexedDB on each change
  const saveDraft = async (newResponses) => {
    try {
      await set(draftKey, newResponses)
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }

  // Handle response change
  const handleResponseChange = (itemId, result) => {
    const newResponses = {
      ...responses,
      [itemId]: {
        ...responses[itemId],
        result
      }
    }
    setResponses(newResponses)
    saveDraft(newResponses)
  }

  // Handle note change
  const handleNoteChange = (itemId, note) => {
    const newResponses = {
      ...responses,
      [itemId]: {
        ...responses[itemId],
        note
      }
    }
    setResponses(newResponses)
    saveDraft(newResponses)
  }

  // Compress image
  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(resolve, 'image/jpeg', quality)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  // Handle photo capture
  const handlePhotoCapture = async (itemId, event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      // Compress image
      const compressedFile = await compressImage(file)
      
      // Convert to base64 for storage
      const reader = new FileReader()
      reader.onload = () => {
        const newResponses = {
          ...responses,
          [itemId]: {
            ...responses[itemId],
            photos: [...(responses[itemId]?.photos || []), reader.result]
          }
        }
        setResponses(newResponses)
        saveDraft(newResponses)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('Error processing photo:', error)
      setError('Failed to process photo')
    }
  }

  // Remove photo
  const removePhoto = (itemId, photoIndex) => {
    const newResponses = {
      ...responses,
      [itemId]: {
        ...responses[itemId],
        photos: responses[itemId]?.photos?.filter((_, index) => index !== photoIndex) || []
      }
    }
    setResponses(newResponses)
    saveDraft(newResponses)
  }

  // Submit inspection
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Start inspection
      const startResponse = await fetch('/api/inspections/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklistId: checklist.id })
      })

      if (!startResponse.ok) {
        throw new Error('Failed to start inspection')
      }

      const { inspection_id } = await startResponse.json()

      // Prepare responses data
      const responsesData = Object.entries(responses).map(([itemId, response]) => ({
        item_id: itemId,
        result: response.result || 'na',
        note: response.note || '',
        photos: response.photos || []
      }))

      // Submit inspection
      const submitResponse = await fetch(`/api/inspections/${inspection_id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: responsesData })
      })

      if (!submitResponse.ok) {
        throw new Error('Failed to submit inspection')
      }

      const result = await submitResponse.json()

      // Clear draft
      await del(draftKey)

      setSuccess(true)
      
      // Show success message and redirect
      setTimeout(() => {
        router.push('/admin/checklists')
      }, 2000)

    } catch (error) {
      console.error('Error submitting inspection:', error)
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get response for item
  const getItemResponse = (itemId) => {
    return responses[itemId] || { result: 'na', note: '', photos: [] }
  }

  // Check if all items have responses
  const allItemsResponded = checklist.checklist_items.every(item => 
    responses[item.id]?.result && responses[item.id].result !== 'na'
  )

  if (success) {
    return (
      <div className="p-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Inspection Submitted Successfully!
          </h3>
          <p className="text-green-600">
            Redirecting back to checklists...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Checklist Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          {checklist.name}
        </h2>
        <p className="text-sm text-slate-600">
          Category: {checklist.category}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Checklist Items */}
      <div className="space-y-4">
        {checklist.checklist_items.map((item, index) => {
          const response = getItemResponse(item.id)
          
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              {/* Item Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-slate-800 mb-1">
                    {index + 1}. {item.text}
                  </h3>
                  {item.critical && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Critical
                    </span>
                  )}
                </div>
              </div>

              {/* Response Buttons */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { value: 'pass', label: 'PASS', color: 'green' },
                  { value: 'fail', label: 'FAIL', color: 'red' },
                  { value: 'na', label: 'N/A', color: 'gray' }
                ].map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => handleResponseChange(item.id, value)}
                    className={`py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
                      response.result === value
                        ? `bg-${color}-100 text-${color}-800 border-2 border-${color}-300${color}-900/40${color}-200${color}-700`
                        : 'bg-slate-100 text-slate-600 border-2 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Note Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={response.note}
                  onChange={(e) => handleNoteChange(item.id, e.target.value)}
                  placeholder="Add any observations or notes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  rows={3}
                />
              </div>

              {/* Photo Capture */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Photos (optional)
                </label>
                
                {/* Photo Input */}
                <input
                  ref={el => fileInputRefs.current[item.id] = el}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handlePhotoCapture(item.id, e)}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRefs.current[item.id]?.click()}
                  className="w-full py-3 px-4 bg-indigo-100 text-indigo-700 border-2 border-indigo-200 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  📷 Take Photo
                </button>

                {/* Photo Previews */}
                {response.photos && response.photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {response.photos.map((photo, photoIndex) => (
                      <div key={photoIndex} className="relative">
                        <img
                          src={photo}
                          alt={`Photo ${photoIndex + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removePhoto(item.id, photoIndex)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-4">
        <button
          onClick={handleSubmit}
          disabled={!allItemsResponded || isSubmitting}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
            allItemsResponded && !isSubmitting
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Inspection'}
        </button>
        
        {!allItemsResponded && (
          <p className="text-center text-sm text-slate-500 mt-2">
            Please respond to all items before submitting
          </p>
        )}
      </div>
    </div>
  )
}
