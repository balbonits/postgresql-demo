import { sql } from '@/lib/db';
import { Video } from '@/types';

export const PATCH = async (
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const { id } = await params;
        const { title, description, video_url, thumbnail_url, duration, category, tags } = await request.json();

        const result = await sql<Video[]>`
            UPDATE videos SET
                title = COALESCE(${title ?? null}, title),
                description = COALESCE(${description ?? null}, description),
                video_url = COALESCE(${video_url ?? null}, video_url),
                thumbnail_url = COALESCE(${thumbnail_url ?? null}, thumbnail_url),
                duration = COALESCE(${duration ?? null}, duration),
                category = COALESCE(${category ?? null}, category),
                tags = COALESCE(${tags ?? null}, tags),
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        if (result.length === 0) {
            return new Response('Video not found', { status: 404 });
        }
        return Response.json(result[0]);
    } catch (error) {
        console.error('Failed to update video', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};

export const DELETE = async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const { id } = await params;
        await sql`DELETE FROM videos WHERE id = ${id}`;
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Failed to delete video', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
