/*
Description: Page to schedule new inspections.
- Fetches templates list and allows selection.
- Assigns user and sets scheduled date.
- Posts to /api/inspections/schedule.

Pseudocode:
- On mount: fetch templates list
- Render template selector dropdown
- Render user assignment and date picker
- On submit: POST to schedule API
- On success → redirect to inspections list
*/
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ClientLayout from '../../components/ClientLayout'

export default function NewInspectionPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [templateId, setTemplateId] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function loadTemplates() {
      const res = await fetch('/api/inspection_templates/list?pageSize=100')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.items || [])
      }
    }
    loadTemplates()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!templateId || !assignedTo || !scheduledDate) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    const res = await fetch('/api/inspections/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template_id: templateId,
        scheduled_date: scheduledDate,
        location,
        notes,
        assigned_to: assignedTo,
      }),
    })

    if (res.ok) {
      router.push("/inspections')
    } else {
      alert('Failed to schedule inspection')
    }
    setSubmitting(false)
  }

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold">Schedule Inspection</h1>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Template *
                </label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  required
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select template...</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Assigned To *
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                  placeholder="Enter user name or email"
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Scheduled Date *
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location"
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional notes..."
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Schedule Inspection'}
            </button>
          </div>
        </form>
      </div>
    </ClientLayout>
  )
}
