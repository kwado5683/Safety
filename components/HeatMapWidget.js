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

export default function HeatMapWidget({ title = "Heat Map", locationData = {} }) {
  const [hoveredArea, setHoveredArea] = useState(null)

  // Generate areas from real location data or use fallback
  const generateAreas = () => {
    const defaultAreas = [
      { id: 1, name: 'Production Floor', incidents: 5, risk: 'high', x: 0, y: 0, width: 2, height: 2 },
      { id: 2, name: 'Warehouse', incidents: 2, risk: 'medium', x: 2, y: 0, width: 2, height: 1 },
      { id: 3, name: 'Office Area', incidents: 0, risk: 'low', x: 2, y: 1, width: 2, height: 1 },
      { id: 4, name: 'Loading Dock', incidents: 3, risk: 'high', x: 0, y: 2, width: 1, height: 1 },
      { id: 5, name: 'Break Room', incidents: 1, risk: 'low', x: 1, y: 2, width: 1, height: 1 },
      { id: 6, name: 'Maintenance', incidents: 4, risk: 'high', x: 4, y: 0, width: 1, height: 2 }
    ]

    // If we have real location data, update the areas
    if (Object.keys(locationData).length > 0) {
      return defaultAreas.map(area => {
        const realIncidents = locationData[area.name] || 0
        let risk = 'low'
        if (realIncidents >= 5) risk = 'high'
        else if (realIncidents >= 2) risk = 'medium'
        
        return {
          ...area,
          incidents: realIncidents,
          risk
        }
      })
    }

    return defaultAreas
  }

  const areas = generateAreas()

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
    <div className="rounded-xl backdrop-blur-md bg-white/70 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20">
      <h3 className="text-lg font-semibold mb-4 text-slate-800">
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
              className="aspect-square bg-gray-100 rounded-sm"
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-slate-600">High Risk</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-slate-600">Medium Risk</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-slate-600">Low Risk</span>
        </div>
      </div>

      {/* Hover Information */}
      {hoveredArea && (
        <div className="mt-4 p-3 backdrop-blur-sm bg-white/50 rounded-lg border border-white/30 shadow-lg">
          <div className="text-sm">
            <div className="font-semibold text-slate-800">
              {hoveredArea.name}
            </div>
            <div className="text-slate-600">
              Incidents: {hoveredArea.incidents} | Risk Level: {hoveredArea.risk}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
