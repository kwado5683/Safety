/*
Description: Interactive 5x5 risk matrix to choose severity × likelihood.
- Each cell color represents risk score (severity*likelihood).
- Clicking a cell updates internal state and calls onChange.

Pseudocode:
- Track selected { severity, likelihood } in state (defaults to none)
- For each severity row and likelihood column, render a button cell
- Compute background color by score thresholds
- On click, update state and emit onChange
*/
import { useState } from 'react'

const SEVERITY_LEVELS = [1, 2, 3, 4, 5]
const LIKELIHOOD_LEVELS = [1, 2, 3, 4, 5]

export default function RiskMatrix({ value, onChange }) {
  const [selected, setSelected] = useState(() => value || { severity: 0, likelihood: 0 })

  function handleSelect(severity, likelihood) {
    const next = { severity, likelihood }
    setSelected(next)
    onChange && onChange(next)
  }

  function cellColor(severity, likelihood) {
    const score = severity * likelihood
    if (score >= 16) return 'bg-rose-500/20'
    if (score >= 9) return 'bg-amber-400/20'
    if (score >= 4) return 'bg-yellow-300/20'
    return 'bg-emerald-400/20'
  }

  return (
    <div className="inline-block">
      <div className="text-sm font-medium mb-2">Risk Matrix</div>
      <div className="grid grid-cols-6 gap-1">
        <div></div>
        {LIKELIHOOD_LEVELS.map((l) => (
          <div key={`lh-${l}`} className="text-xs text-neutral-500 text-center">{l}</div>
        ))}

        {SEVERITY_LEVELS.map((s) => (
          <>
            <div key={`sv-label-${s}`} className="text-xs text-neutral-500 text-center self-center">{s}</div>
            {LIKELIHOOD_LEVELS.map((l) => {
              const isActive = selected.severity === s && selected.likelihood === l
              return (
                <button
                  key={`cell-${s}-${l}`}
                  type="button"
                  onClick={() => handleSelect(s, l)}
                  className={`h-10 w-10 rounded border border-neutral-300 ${cellColor(s, l)} ${
                    isActive ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  aria-label={`Severity ${s}, Likelihood ${l}`}
                />
              )
            })}
          </>
        ))}
      </div>

      <div className="mt-3 text-sm text-neutral-700">
        Selected: Severity {selected.severity || '-'}, Likelihood {selected.likelihood || '-'}
      </div>
    </div>
  )
}


