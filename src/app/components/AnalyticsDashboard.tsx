'use client';

import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { TopVideo, DailyStats } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export function AnalyticsDashboard({ topVideos, dailyStats }: { topVideos: TopVideo[]; dailyStats: DailyStats[] }) {

    return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Top Videos Bar Chart */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h3 className="mb-6 text-xl font-semibold">Top Performing Videos</h3>
        <Bar
          data={{
            labels: topVideos.map((v) => v.title.length > 18 ? v.title.slice(0, 18) + '...' : v.title),
            datasets: [
              {
                label: 'Total Plays',
                data: topVideos.map((v) => Number(v.plays)),
                backgroundColor: '#6366f1',
                borderRadius: 8,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
          }}
        />
      </div>

      {/* Daily Trend Line Chart */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h3 className="mb-6 text-xl font-semibold">Views Last 30 Days</h3>
        <Line
          data={{
            labels: dailyStats.map((d) => new Date(d.day).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
            datasets: [
              {
                label: 'Daily Plays',
                data: dailyStats.map((d) => Number(d.plays)),
                borderColor: '#a5b4fc',
                backgroundColor: 'rgba(165, 180, 252, 0.1)',
                tension: 0.4,
                fill: true,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
          }}
        />
      </div>
    </div>
  );
}