/*
Description: Incident reporting form built with react-hook-form and yup.
- Captures incident type, severity, reported by, timestamps, location, description.
- Matches database schema with proper field validation.
- Validates inputs; exposes final data via onSubmit prop.

Pseudocode:
- Define validation schema with yup for all fields
- Initialize form with yupResolver
- Render form inputs with proper validation
- On submit, call onSubmit with validated data
*/
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useState } from 'react'
import ImageUpload from './ImageUpload'

const schema = yup.object({
  incidentType: yup.string().required('Incident type is required'),
  severity: yup.string().required('Severity is required'),
  reportedBy: yup.string().required('Reported by is required'),
  reporterPhone: yup.string().required('Reporter phone number is required'),
  timeOfIncident: yup.string().required('Time of incident is required'),
  location: yup.string().required('Location is required'),
  description: yup.string().required('Description is required'),
})

export default function IncidentForm({ onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) })

  // Image upload state
  const [imageUrl, setImageUrl] = useState(null)

  // Image upload handlers
  const handleImageUpload = (url) => {
    setImageUrl(url)
  }

  const handleImageRemove = () => {
    setImageUrl(null)
  }

  // Enhanced submit handler to include image URL
  const handleFormSubmit = (data) => {
    const formDataWithImage = {
      ...data,
      imageUrl: imageUrl
    }
    onSubmit(formDataWithImage)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Incident Type and Severity Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Incident Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register('incidentType')}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select incident type</option>
            <option value="Nearmiss">Nearmiss</option>
            <option value="Accident">Accident</option>
            <option value="Dangerous occurence">Dangerous occurence</option>
          </select>
          {errors.incidentType && (
            <p className="mt-1 text-xs text-rose-600">{errors.incidentType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Severity <span className="text-red-500">*</span>
          </label>
          <select
            {...register('severity')}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select severity</option>
            <option value="1">1 - Very Low</option>
            <option value="2">2 - Low</option>
            <option value="3">3 - Medium</option>
            <option value="4">4 - High</option>
            <option value="5">5 - Very High</option>
          </select>
          {errors.severity && (
            <p className="mt-1 text-xs text-rose-600">{errors.severity.message}</p>
          )}
        </div>
      </div>

      {/* Reported By and Phone Number Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Reported By <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('reportedBy')}
            placeholder="Enter reporter's name"
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.reportedBy && (
            <p className="mt-1 text-xs text-rose-600">{errors.reportedBy.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            {...register('reporterPhone')}
            placeholder="Enter phone number"
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.reporterPhone && (
            <p className="mt-1 text-xs text-rose-600">{errors.reporterPhone.message}</p>
          )}
        </div>
      </div>

      {/* Time of Incident Row */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Time of Incident <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          {...register('timeOfIncident')}
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.timeOfIncident && (
          <p className="mt-1 text-xs text-rose-600">{errors.timeOfIncident.message}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('location')}
          placeholder="Enter incident location"
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.location && (
          <p className="mt-1 text-xs text-rose-600">{errors.location.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          {...register('description')}
          placeholder="Provide detailed description of the incident"
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
        )}
      </div>

      {/* Image Upload */}
      <ImageUpload 
        onImageUpload={handleImageUpload}
        onImageRemove={handleImageRemove}
        initialImage={imageUrl}
      />

      {/* Submit Button */}
      <div className="flex justify-center sm:justify-end gap-2 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors touch-manipulation"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Incident'}
        </button>
      </div>
    </form>
  )
}
