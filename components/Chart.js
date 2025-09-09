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

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export function BarChart({ labels = [], datasets = [], options = {} }) {
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
          }
        }
      },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: 'rgba(71, 85, 105, 0.8)',
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: 'rgba(71, 85, 105, 0.8)',
          font: {
            size: 11
          }
        }
      }
    },
    ...options,
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Incidents by Month</h3>
      <div className="h-80">
        <Bar data={data} options={baseOptions} />
      </div>
    </div>
  )
}

export function PieChart({ labels = [], datasets = [], options = {} }) {
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
          }
        }
      },
      title: { display: false },
    },
    ...options,
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Incidents by Status</h3>
      <div className="h-80">
        <Pie data={data} options={baseOptions} />
      </div>
    </div>
  )
}


