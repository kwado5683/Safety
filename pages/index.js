/*
Description: Dashboard page that fetches summary metrics and renders KPIs + charts.
- Uses client component to fetch from API route.
- Displays KPI cards and two charts: incidents by month (bar) and status split (pie).

Pseudocode:
- Use useEffect to fetch /api/dashboard/summary
- If unauthorized → prompt sign in
- Render KPI grid
- Render charts using BarChart and PieChart components
*/
'use client'

import { useEffect, useState } from 'react'
import ClientLayout from '../components/ClientLayout'
import KPI from '../components/KPI'
import { BarChart, PieChart } from '../components/Chart'
import Link from 'next/link'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getSummary() {
      try {
        const res = await fetch('/api/dashboard/summary')
        if (!res.ok) {
          setData({ error: res.status })
        } else {
          const result = await res.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setData({ error: 500 })
      } finally {
        setLoading(false)
      }
    }

    getSummary()
  }, [])

  if (loading) {
    return (
      <ClientLayout>
        <div className="p-6 bg-white rounded-xl border border-neutral-200">
          <p className="text-neutral-700">Loading dashboard...</p>
        </div>
      </ClientLayout>
    )
  }

  if (data?.error === 401) {
    return (
      <ClientLayout>
        <div className="p-6 bg-white rounded-xl border border-neutral-200">
          <p className="text-neutral-700">You must sign in to view the dashboard.</p>
          <Link href="/sign-in" className="text-indigo-600 underline">Sign in</Link>
        </div>
      </ClientLayout>
    )
  }

  if (data?.error) {
    return (
      <ClientLayout>
        <div className="p-6 bg-white rounded-xl border border-neutral-200">
          <p className="text-neutral-700">Error loading dashboard: {data.error}</p>
        </div>
      </ClientLayout>
    )
  }

  const { kpis = {}, charts = {} } = data || {}

  return (
    <ClientLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Open Incidents" value={kpis.openIncidents ?? 0} />
        <KPI label="Open Actions" value={kpis.openActions ?? 0} />
        <KPI label="Training Compliance" value={`${kpis.trainingCompliance ?? 0}%`} />
        <KPI label="Upcoming Inspections" value={kpis.upcomingInspections ?? 0} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.bar && (
          <BarChart labels={charts.bar.labels} datasets={charts.bar.datasets} />
        )}
        {charts.pie && (
          <PieChart labels={charts.pie.labels} datasets={charts.pie.datasets} />
        )}
      </div>
    </ClientLayout>
  )
}
