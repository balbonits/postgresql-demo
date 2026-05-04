'use client';

import { useState, useEffect } from "react";

import { VideoPlayer } from "./components/VideoPlayer";
import { VideoCard } from "./components/VideoCard";
import { Video } from "@/types";
import { trackPlay } from "./utils";

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<'newest' | 'popular' | 'longest'>('newest');
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      setVideos(data);
      if (data.length > 0) {
        setCurrentVideo(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch videos', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (video: Video) => {
    setCurrentVideo(video);
    trackPlay(video.id);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const filteredVideos = videos
    .filter(v =>
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      (v.description ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'popular') return b.view_count - a.view_count;
      if (sort === 'longest') return (b.duration ?? 0) - (a.duration ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4" data-page="home">
      <div className="max-w-5xl mx-auto" data-part="player">
        <VideoPlayer video={currentVideo} />
      </div>

      <div className="max-w-5xl mx-auto mt-12" data-region="controls">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-xl bg-zinc-800 px-4 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-72"
          />
          <div className="flex gap-2" data-region="sort">
            {(['newest', 'popular', 'longest'] as const).map(option => (
              <button
                key={option}
                onClick={() => setSort(option)}
                className={`rounded-xl px-4 py-2 text-sm capitalize transition-colors ${
                  sort === option
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto" data-region="cards">
        {loading ? (
          <div className="text-center text-zinc-500">Loading...</div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center text-zinc-500">
            {search ? `No videos matching "${search}"` : 'No videos found.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map(video => (
              <VideoCard key={video.id} video={video} onPlay={handlePlay} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
