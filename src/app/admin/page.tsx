'use client';

import { useState, useEffect } from "react";
import { TopVideo, DailyStats } from "@/types";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard";

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [topVideos, setTopVideos] = useState<TopVideo[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) {
        const passwordPrompt = window.prompt("Enter admin password:");
        if (passwordPrompt === 'demo123') {
            setAuthenticated(true);
        } else {
            alert("Incorrect password. Access denied.");
        }
    } else {
        Promise.all([
            fetch('/api/analytics/top').then(res => res.json()),
            fetch('/api/analytics/daily').then(res => res.json()),
        ])
        .then(([topVideosData, dailyStatsData]) => {
            setTopVideos(topVideosData);
            setDailyStats(dailyStatsData);
        })
        .catch(err => console.error('Failed to fetch analytics data', err))
        .finally(() => setLoading(false));
}
  }, [authenticated]);
  
  return (
    <div className="p-8" data-page="admin">
      <h1 className="text-3xl font-bold mb-4" data-heading="admin">Admin Dashboard</h1>
      {(!authenticated) ? <p>Please authenticate to view analytics.</p> : 
      <div data-section="videos">
        {(loading) ? <p>Loading videos...</p> : 
        (topVideos.length === 0) ? <p>No videos found.</p> : <AnalyticsDashboard topVideos={topVideos} dailyStats={dailyStats} />}
      </div>
      }
    </div>
  );
};

export default AdminPage;