/*
Description: Small KPI/stat card showing a label, main value, and optional delta.
- Colors delta green if positive, red if negative, neutral otherwise.

Pseudocode:
- Compute deltaColor from delta sign
- Render label and optional icon in header row
- Render main value and delta side-by-side
*/
export default function KPI({ label, value, delta, icon = null }) {
  const deltaColor = delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-neutral-600'

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-500">{label}</div>
        <div className="text-neutral-400">{icon}</div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {delta !== undefined && (
          <div className={`text-xs font-medium ${deltaColor}`}>{delta > 0 ? `+${delta}` : delta}</div>
        )}
      </div>
    </div>
  )
}


