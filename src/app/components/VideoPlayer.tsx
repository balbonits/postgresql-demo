'use client';

import { Video } from '@/types';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  video: Video | null;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  if (!video) {
    return (
      <div className="aspect-video bg-zinc-900 rounded-3xl flex items-center justify-center">
        <div className="text-center">
          <Play className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-500">Select a video to start watching</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="aspect-video bg-black rounded-3xl overflow-hidden">
        <video
          key={video.id}
          src={video.video_url}
          controls
          autoPlay
          className="w-full h-full object-contain"
          poster={video.thumbnail_url || undefined}
        />
      </div>

      {/* Title + metadata below the player */}
      <div className="mt-6 px-2">
        <h1 className="text-3xl font-semibold tracking-tight">{video.title}</h1>
        <p className="mt-2 text-zinc-400">{video.description}</p>
      </div>
    </div>
  );
}