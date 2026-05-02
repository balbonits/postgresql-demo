export interface Video {
  id: number;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration: number | null;
  category: string | null;
  tags: string[] | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Play {
  id: number;
  video_id: number;
  played_at: string;
  user_agent: string | null;
}

export interface TopVideo {
  id: number;
  title: string;
  plays: number;
  thumbnail_url: string | null;
}

export interface DailyStats {
  day: string;
  plays: number;
}