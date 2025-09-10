/*
Description: Thin wrappers around react-chartjs-2 for Bar and Pie charts.
- Registers needed Chart.js components once.
- Accepts labels, datasets, and options; merges sensible defaults.

Pseudocode:
- Register chart elements
- Build data = { labels, datasets }
- Merge baseOptions with incoming options
- Render <Bar/> or <Pie/> inside a styled container
*/
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import { useTheme } from '@/lib/ThemeContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export function BarChart({ labels = [], datasets = [], options = {} }) {
  const { isDark } = useTheme()
  const data = { labels, datasets }
  
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '600'
          },
          color: isDark ? 'rgba(248, 250, 252, 0.8)' : 'rgba(71, 85, 105, 0.8)'
        }
      },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: isDark ? 'rgba(248, 250, 252, 0.8)' : 'rgba(71, 85, 105, 0.8)',
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: isDark ? 'rgba(248, 250, 252, 0.8)' : 'rgba(71, 85, 105, 0.8)',
          font: {
            size: 11
          }
        }
      }
    },
    ...options,
  }
  
  return (
    <div className="rounded-xl border backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300" style={{
      backgroundColor: 'var(--card)',
      borderColor: 'var(--border)'
    }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Incidents by Month</h3>
      <div className="h-80">
        <Bar data={data} options={baseOptions} />
      </div>
    </div>
  )
}

export function PieChart({ labels = [], datasets = [], options = {} }) {
  const { isDark } = useTheme()
  const data = { labels, datasets }
  
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '600'
          },
          color: isDark ? 'rgba(248, 250, 252, 0.8)' : 'rgba(71, 85, 105, 0.8)'
        }
      },
      title: { display: false },
    },
    ...options,
  }
  
  return (
    <div className="rounded-xl border backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300" style={{
      backgroundColor: 'var(--card)',
      borderColor: 'var(--border)'
    }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Incidents by Status</h3>
      <div className="h-80">
        <Pie data={data} options={baseOptions} />
      </div>
    </div>
  )
}


