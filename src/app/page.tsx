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
  }

  const handlePlay = (video: Video) => {
    setCurrentVideo(video);
    trackPlay(video.id);
  }

  useEffect(() => {
    fetchVideos();
  }, []);

  return (<div className="min-h-screen bg-zinc-900 text-white p-4" data-page="home">
    <div className="max-w-5xl mx-auto" data-part="player">
      <VideoPlayer video={currentVideo} />
    </div>
    <div className="max-w-5xl mx-auto mt-12" data-region="cards">
      {loading ? 
      <div className="text-center text-zinc-500">Loading...</div> 
      : videos.length === 0 ? (
        <div className="text-center text-zinc-500">No videos found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map(video => (
            <VideoCard key={video.id} video={video} onPlay={handlePlay} />
          ))}
        </div>
      )}
    </div>
  </div>);
}