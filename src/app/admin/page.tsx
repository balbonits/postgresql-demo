'use client';

import { useState, useEffect } from "react";
import { Video, TopVideo, DailyStats } from "@/types";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard";
import { VideoForm } from "../components/VideoForm";
import { Pencil, Trash2, Plus } from "lucide-react";
import { formatDate, formatDuration } from "../utils";

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [topVideos, setTopVideos] = useState<TopVideo[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  const fetchAll = () => {
    Promise.all([
      fetch('/api/videos').then(res => res.json()),
      fetch('/api/analytics/top').then(res => res.json()),
      fetch('/api/analytics/daily').then(res => res.json()),
    ])
    .then(([videosData, topVideosData, dailyStatsData]) => {
      setVideos(videosData);
      setTopVideos(topVideosData);
      setDailyStats(dailyStatsData);
    })
    .catch(err => console.error('Failed to fetch data', err))
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authenticated) {
      const password = window.prompt("Enter admin password:");
      if (password === 'demo123') {
        setAuthenticated(true);
      } else {
        alert("Incorrect password. Access denied.");
      }
    } else {
      fetchAll();
    }
  }, [authenticated]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this video?')) return;
    await fetch(`/api/videos/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingVideo(undefined);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingVideo(undefined);
  };

  if (!authenticated) {
    return <div className="p-8 text-zinc-500">Access denied.</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8" data-page="admin">
      {showForm && (
        <VideoForm
          video={editingVideo}
          onClose={handleFormClose}
          onSave={fetchAll}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-10" data-heading="admin">Admin Dashboard</h1>

        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <>
            <section data-section="analytics" className="mb-12">
              <AnalyticsDashboard topVideos={topVideos} dailyStats={dailyStats} />
            </section>

            <section data-section="videos">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Videos</h2>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
                >
                  <Plus className="h-4 w-4" />
                  Add Video
                </button>
              </div>

              <div className="overflow-hidden rounded-3xl border border-zinc-800">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-900 text-zinc-400">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">Title</th>
                      <th className="px-6 py-3 text-left font-medium">Category</th>
                      <th className="px-6 py-3 text-left font-medium">Duration</th>
                      <th className="px-6 py-3 text-left font-medium">Views</th>
                      <th className="px-6 py-3 text-left font-medium">Added</th>
                      <th className="px-6 py-3 text-left font-medium sr-only">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 bg-zinc-950">
                    {videos.map(video => (
                      <tr key={video.id} className="hover:bg-zinc-900 transition-colors">
                        <td className="px-6 py-4 font-medium">{video.title}</td>
                        <td className="px-6 py-4 text-zinc-400">{video.category ?? '—'}</td>
                        <td className="px-6 py-4 text-zinc-400">{formatDuration(video.duration)}</td>
                        <td className="px-6 py-4 text-zinc-400">{video.view_count.toLocaleString()}</td>
                        <td className="px-6 py-4 text-zinc-400">{formatDate(video.created_at)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button type="button" aria-label="Edit video" onClick={() => handleEdit(video)} className="text-zinc-400 hover:text-white">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button type="button" aria-label="Delete video" onClick={() => handleDelete(video.id)} className="text-zinc-400 hover:text-red-400">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
