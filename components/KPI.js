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
    indigo: 'from-indigo-500 to-blue-500 border-indigo-200',
    red: 'from-red-500 to-pink-500 border-red-200',
    green: 'from-green-500 to-emerald-500 border-green-200',
    yellow: 'from-yellow-500 to-orange-500 border-yellow-200',
    purple: 'from-purple-500 to-violet-500 border-purple-200'
  }

  return (
    <div className={`rounded-xl border bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${colorClasses[color] || colorClasses.indigo}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">{label}</div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">{value}</div>
        {delta !== undefined && (
          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${delta > 0 ? 'bg-emerald-100 text-emerald-700' : delta < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
            {delta > 0 ? `+${delta}` : delta}
          </div>
        )}
      </div>
    </div>
  )
}


