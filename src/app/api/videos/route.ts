import { sql } from '@/lib/db';
import { Video } from '@/types';

export const GET = async () => {
    const videos = await sql<Video[]>`
        SELECT * FROM videos
        ORDER BY created_at DESC
    `;
    return Response.json(videos);
};

export const POST = async (request: Request) => {
    try {
        const { title, description, video_url, thumbnail_url, duration, category, tags } = await request.json();
        if (!title || !video_url) {
            return new Response('title and video_url are required', { status: 400 });
        }
        const result = await sql<Video[]>`
            INSERT INTO videos (title, description, video_url, thumbnail_url, duration, category, tags)
            VALUES (${title}, ${description ?? null}, ${video_url}, ${thumbnail_url ?? null}, ${duration ?? null}, ${category ?? null}, ${tags ?? null})
            RETURNING *
        `;
        return Response.json(result[0], { status: 201 });
    } catch (error) {
        console.error('Failed to create video', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
