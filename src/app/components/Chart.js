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
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    ...options,
  }
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <Bar data={data} options={baseOptions} />
    </div>
  )
}

export function PieChart({ labels = [], datasets = [], options = {} }) {
  const data = { labels, datasets }
  const baseOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    ...options,
  }
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <Pie data={data} options={baseOptions} />
    </div>
  )
}


