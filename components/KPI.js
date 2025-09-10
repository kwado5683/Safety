/*
Description: Small KPI/stat card showing a label, main value, and optional delta.
- Colors delta green if positive, red if negative, neutral otherwise.

Pseudocode:
- Compute deltaColor from delta sign
- Render label and optional icon in header row
- Render main value and delta side-by-side
*/
export default function KPI({ label, value, delta, icon = null, color = 'indigo' }) {
  const deltaColor = delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-slate-600'
  
  const colorClasses = {
    indigo: 'from-indigo-500 to-blue-500 border-indigo-200 dark:border-indigo-800',
    red: 'from-red-500 to-pink-500 border-red-200 dark:border-red-800',
    green: 'from-green-500 to-emerald-500 border-green-200 dark:border-green-800',
    yellow: 'from-yellow-500 to-orange-500 border-yellow-200 dark:border-yellow-800',
    purple: 'from-purple-500 to-violet-500 border-purple-200 dark:border-purple-800'
  }

  return (
    <div className={`rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${colorClasses[color] || colorClasses.indigo}`} style={{
      backgroundColor: 'var(--card)',
      borderColor: 'var(--border)'
    }}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>{value}</div>
        {delta !== undefined && (
          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${delta > 0 ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : delta < 0 ? 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
            {delta > 0 ? `+${delta}` : delta}
          </div>
        )}
      </div>
    </div>
  )
}


