/*
DESCRIPTION: Heat map widget for location-based incident visualization.
- Shows floor plan or area layout with color-coded risk levels
- Industry-standard heat map for safety dashboards
- Interactive areas with incident counts

WHAT EACH PART DOES:
1. Grid layout - Creates a grid representing different areas
2. Color coding - Red for high risk, yellow for medium, green for low
3. Incident counts - Shows number of incidents per area
4. Hover effects - Provides additional information on hover

PSEUDOCODE:
- Create grid of areas with different risk levels
- Apply color coding based on incident count
- Display incident numbers in each area
- Add hover effects for more details
*/

'use client'

import { useState } from 'react'

export default function HeatMapWidget({ title = "Heat Map" }) {
  const [hoveredArea, setHoveredArea] = useState(null)

  // Sample data for different areas
  const areas = [
    { id: 1, name: 'Production Floor', incidents: 5, risk: 'high', x: 0, y: 0, width: 2, height: 2 },
    { id: 2, name: 'Warehouse', incidents: 2, risk: 'medium', x: 2, y: 0, width: 2, height: 1 },
    { id: 3, name: 'Office Area', incidents: 0, risk: 'low', x: 2, y: 1, width: 2, height: 1 },
    { id: 4, name: 'Loading Dock', incidents: 3, risk: 'high', x: 0, y: 2, width: 1, height: 1 },
    { id: 5, name: 'Break Room', incidents: 1, risk: 'low', x: 1, y: 2, width: 1, height: 1 },
    { id: 6, name: 'Maintenance', incidents: 4, risk: 'high', x: 4, y: 0, width: 1, height: 2 }
  ]

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-300'
    }
  }

  const getRiskTextColor = (risk) => {
    switch (risk) {
      case 'high': return 'text-white'
      case 'medium': return 'text-black'
      case 'low': return 'text-white'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300" style={{
      backgroundColor: 'var(--card)',
      borderColor: 'var(--border)'
    }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      
      {/* Heat Map Grid */}
      <div className="grid grid-cols-5 gap-1 mb-4">
        {Array.from({ length: 15 }, (_, index) => {
          const area = areas.find(a => {
            const startIndex = a.y * 5 + a.x
            const endIndex = startIndex + (a.width - 1) + (a.height - 1) * 5
            return index >= startIndex && index <= endIndex
          })
          
          if (area) {
            const isFirstCell = index === (area.y * 5 + area.x)
            return (
              <div
                key={index}
                className={`aspect-square rounded-sm flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-200 ${getRiskColor(area.risk)} ${getRiskTextColor(area.risk)}`}
                onMouseEnter={() => setHoveredArea(area)}
                onMouseLeave={() => setHoveredArea(null)}
                style={{
                  gridColumn: `span ${area.width}`,
                  gridRow: `span ${area.height}`
                }}
              >
                {isFirstCell && (
                  <div className="text-center">
                    <div className="text-lg font-bold">{area.incidents}</div>
                    <div className="text-xs opacity-80">{area.name}</div>
                  </div>
                )}
              </div>
            )
          }
          
          return (
            <div
              key={index}
              className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-sm"
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span style={{ color: 'var(--muted-foreground)' }}>High Risk</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span style={{ color: 'var(--muted-foreground)' }}>Medium Risk</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span style={{ color: 'var(--muted-foreground)' }}>Low Risk</span>
        </div>
      </div>

      {/* Hover Information */}
      {hoveredArea && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm">
            <div className="font-semibold" style={{ color: 'var(--foreground)' }}>
              {hoveredArea.name}
            </div>
            <div style={{ color: 'var(--muted-foreground)' }}>
              Incidents: {hoveredArea.incidents} | Risk Level: {hoveredArea.risk}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
