import { sql } from '@/lib/db';
import { Video } from '@/types';

export const GET = async () => {
    const videos = await sql<Video[]>`
        SELECT * FROM videos
        ORDER BY created_at DESC
    `;
    return Response.json(videos);
}