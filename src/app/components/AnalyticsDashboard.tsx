'use client';

import { useEffect, useState } from 'react';
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

export function AnalyticsDashboard() {
  const [topVideos, setTopVideos] = useState<TopVideo[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [topRes, dailyRes] = await Promise.all([
          fetch('/api/analytics/top').then((r) => r.json()),
          fetch('/api/analytics/daily').then((r) => r.json()),
        ]);
        setTopVideos(topRes);
        setDailyStats(dailyRes);
      } catch (error) {
        console.error('Failed to load analytics', error);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-zinc-900" />;
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Top Videos Bar Chart */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h3 className="mb-6 text-xl font-semibold">Top Performing Videos</h3>
        <Bar
          data={{
            labels: topVideos.map((v) =>
              v.title.length > 18 ? v.title.slice(0, 18) + '...' : v.title
            ),
            datasets: [
              {
                label: 'Total Plays',
                data: topVideos.map((v) => v.plays),
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
            labels: dailyStats.map((d) =>
              new Date(d.day).toLocaleDateString('en', { month: 'short', day: 'numeric' })
            ),
            datasets: [
              {
                label: 'Daily Plays',
                data: dailyStats.map((d) => d.plays),
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