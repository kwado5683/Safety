/*
Description: Enhanced KPI card with trend indicators, percentages, and industry-standard styling.
- Shows label, main value, trend indicators, and optional delta
- Supports percentage displays and trend arrows
- Industry-standard safety dashboard styling

Pseudocode:
- Compute trend indicators and colors
- Render label with optional icon
- Display main value with trend arrows
- Show percentage or delta information
*/
export default function KPI({ 
  label, 
  value, 
  delta, 
  trend, 
  percentage, 
  subtitle,
  icon = null, 
  color = 'indigo' 
}) {
  // Trend indicator logic
  const getTrendIndicator = (trend) => {
    if (trend === 'up') return { icon: '↗', color: 'text-emerald-600', bg: 'bg-emerald-100' }
    if (trend === 'down') return { icon: '↘', color: 'text-red-600', bg: 'bg-red-100' }
    if (trend === 'stable') return { icon: '→', color: 'text-gray-600', bg: 'bg-gray-100' }
    return null
  }

  const trendInfo = getTrendIndicator(trend)
  const deltaColor = delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-slate-600'
  
  const colorClasses = {
    indigo: 'from-indigo-500 to-blue-500 border-indigo-200',
    red: 'from-red-500 to-pink-500 border-red-200',
    green: 'from-green-500 to-emerald-500 border-green-200',
    yellow: 'from-yellow-500 to-orange-500 border-yellow-200',
    purple: 'from-purple-500 to-violet-500 border-purple-200'
  }

  return (
    <div className={`rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-slate-200 ${colorClasses[color] || colorClasses.indigo}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium uppercase tracking-wide text-slate-600">
            {label}
          </div>
          {subtitle && (
            <div className="text-xs text-slate-500">
              {subtitle}
            </div>
          )}
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-2 mb-2">
        <div className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </div>
        {percentage && (
          <div className="text-lg font-semibold text-slate-600">
            %
          </div>
        )}
      </div>

      {/* Trend and Delta Information */}
      <div className="flex items-center gap-2">
        {trendInfo && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trendInfo.bg}`}>
            <span className={trendInfo.color}>{trendInfo.icon}</span>
            <span className={trendInfo.color}>from last month</span>
          </div>
        )}
        {delta !== undefined && !trendInfo && (
          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${delta > 0 ? 'bg-emerald-100 text-emerald-700' : delta < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
            {delta > 0 ? `+${delta}%` : `${delta}%`}
          </div>
        )}
      </div>
    </div>
  )
}


