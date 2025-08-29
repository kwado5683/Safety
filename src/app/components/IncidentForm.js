/*
Description: Incident reporting form built with react-hook-form and yup.
- Captures title, date, description.
- Integrates RiskMatrix to pick severity and likelihood (1-5 each).
- Validates inputs; exposes final data via onSubmit prop.

Pseudocode:
- Define validation schema with yup for all fields
- Initialize form with yupResolver
- When RiskMatrix changes, set hidden severity/likelihood fields
- Render inputs with error messages
- On submit, call onSubmit with validated data
*/
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import RiskMatrix from './RiskMatrix'

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  date: yup.string().required('Date is required'),
  severity: yup.number().min(1).max(5).required('Select severity'),
  likelihood: yup.number().min(1).max(5).required('Select likelihood'),
})

export default function IncidentForm({ onSubmit }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) })

  function handleMatrixChange(next) {
    setValue('severity', next.severity, { shouldValidate: true })
    setValue('likelihood', next.likelihood, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700">Title</label>
          <input
            type="text"
            {...register('title')}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Date</label>
          <input
            type="date"
            {...register('date')}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Description</label>
        <textarea
          rows={4}
          {...register('description')}
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>}
      </div>

      <div>
        <RiskMatrix onChange={handleMatrixChange} />
        <input type="hidden" {...register('severity')} />
        <input type="hidden" {...register('likelihood')} />
        {(errors.severity || errors.likelihood) && (
          <p className="mt-1 text-xs text-rose-600">Select severity and likelihood</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          Submit Incident
        </button>
      </div>
    </form>
  )
}


