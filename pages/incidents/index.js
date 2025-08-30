/*
Description: Incidents list with filters and links to details.
- Fetches from /api/incidents/list with query params.
- Provides status/category filters and pagination.

Pseudocode:
- Keep state for page, pageSize, status, category
- Fetch list whenever filters/page change
- Render table of incidents with link to details page
*/
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ClientLayout from '../../components/ClientLayout'

export default function IncidentsIndexPage() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (status) query.set('status', status)
    if (category) query.set('category', category)
    const res = await fetch(`/api/incidents/list?${query.toString()}`)
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
  }, [page, pageSize, status, category])

  return (
    <ClientLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Incidents</h1>
        <Link href="/incidents/new" className="rounded-full bg-indigo-600 text-white text-sm px-4 py-2">New</Link>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input
          placeholder="Filter status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
        <input
          placeholder="Filter category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm">
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Category</th>
              <th className="text-left px-4 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-3" colSpan={4}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="px-4 py-3" colSpan={4}>No incidents</td></tr>
            ) : (
              items.map((it) => (
                <tr key={it.id} className="border-t border-neutral-200">
                  <td className="px-4 py-3">
                    <Link href={`/incidents/${it.id}`} className="text-indigo-600 underline">{it.title}</Link>
                  </td>
                  <td className="px-4 py-3">{it.status}</td>
                  <td className="px-4 py-3">{it.category || '-'}</td>
                  <td className="px-4 py-3">{new Date(it.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(p - 1, 1))} className="rounded-full border px-3 py-1 text-sm disabled:opacity-50">Prev</button>
        <div className="text-sm">Page {page} of {totalPages}</div>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(p + 1, totalPages))} className="rounded-full border px-3 py-1 text-sm disabled:opacity-50">Next</button>
      </div>
    </ClientLayout>
  )
}


