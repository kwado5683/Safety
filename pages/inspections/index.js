/*
Description: Mobile-friendly inspections list with filters and completion links.
- Fetches inspections with pagination and status filters.
- Links to complete individual inspections.
- Responsive design for mobile field work.

Pseudocode:
- Keep state for page, pageSize, status filters
- Fetch inspections list on mount/filter change
- Render mobile-friendly cards with status badges
- Link each to completion page
*/
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ClientLayout from '../../components/ClientLayout'

export default function InspectionsIndexPage() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [status, setStatus] = useState('')
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (status) query.set('status', status)
    const res = await fetch(`/api/inspections/list?${query.toString()}`)
    if (res.ok) {
      const data = await res.json()
      setItems(data.items || [])
      setTotalPages(data.totalPages || 1)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status])

  function getStatusColor(status) {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <ClientLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Inspections</h1>
        <Link href="/inspections/new" className="rounded-full bg-indigo-600 text-white text-sm px-4 py-2">
          Schedule
        </Link>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm flex-1"
        >
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-neutral-600">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">No inspections found</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    {item.inspection_templates && (
                      <span className="text-sm text-neutral-600">
                        {item.inspection_templates.name}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-neutral-900 truncate">
                    {item.location || 'No location'}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {new Date(item.scheduled_date).toLocaleDateString()} at{' '}
                    {new Date(item.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {item.notes && (
                    <div className="text-sm text-neutral-600 mt-1 line-clamp-2">
                      {item.notes}
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  {item.status === 'scheduled' && (
                    <Link
                      href={`/pages/inspections/${item.id}/complete`}
                      className="rounded-full bg-indigo-600 text-white text-xs px-3 py-1.5 hover:bg-indigo-500"
                    >
                      Start
                    </Link>
                  )}
                  {item.status === 'in_progress' && (
                    <Link
                      href={`/pages/inspections/${item.id}/complete`}
                      className="rounded-full bg-yellow-600 text-white text-xs px-3 py-1.5 hover:bg-yellow-500"
                    >
                      Continue
                    </Link>
                  )}
                  {item.status === 'completed' && (
                    <span className="rounded-full bg-green-100 text-green-800 text-xs px-3 py-1.5">
                      Done
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="rounded-full border px-3 py-1 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <div className="text-sm">Page {page} of {totalPages}</div>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="rounded-full border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </ClientLayout>
  )
}
