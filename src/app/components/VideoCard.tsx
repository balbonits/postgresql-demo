'use client';

import { Video } from '@/types';
import { Play, Eye } from 'lucide-react';
import { formatDuration } from '@/app/utils';
import Image from 'next/image';
interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
}

export function VideoCard({ video, onPlay }: VideoCardProps) {
  return (
    <div 
      onClick={() => onPlay(video)}
      className="video-card group cursor-pointer overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={video.thumbnail_url || `https://picsum.photos/id/${(video.id % 100) + 10}/640/360`}
          alt={video.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="rounded-full bg-white/90 p-4">
            <Play className="h-8 w-8 text-black" />
          </div>
        </div>

        <div className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-0.5 text-xs font-medium text-white">
          {formatDuration(video.duration)}
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold tracking-tight">{video.title}</h3>
        
        <div className="mt-3 flex items-center justify-between text-sm text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>{video.view_count.toLocaleString()}</span>
          </div>
          <div className="text-xs text-zinc-500">
            {video.category}
          </div>
        </div>
      </div>
    </div>
  );
}