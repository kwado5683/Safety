/*
Description: Dashboard page that fetches summary metrics and renders KPIs + charts.
- Uses server component fetch to call internal API route.
- Displays KPI cards and two charts: incidents by month (bar) and status split (pie).

Pseudocode:
- Fetch /api/dashboard/summary with credentials
- If unauthorized → prompt sign in
- Render KPI grid
- Render charts using BarChart and PieChart components
*/
import Layout from './components/Layout'
import KPI from './components/KPI'
import { BarChart, PieChart } from './components/Chart'
import Link from 'next/link'

async function getSummary() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/dashboard/summary`, {
    cache: 'no-store',
  })
  if (!res.ok) return { error: res.status }
  return res.json()
}

export default async function Home() {
  const data = await getSummary()

  if (data?.error === 401) {
    return (
      <Layout>
        <div className="p-6 bg-white rounded-xl border border-neutral-200">
          <p className="text-neutral-700">You must sign in to view the dashboard.</p>
          <Link href="/sign-in" className="text-indigo-600 underline">Sign in</Link>
        </div>
      </Layout>
    )
  }

  const { kpis = {}, charts = {} } = data || {}

  return (
    <Layout>
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
    </Layout>
  )
}