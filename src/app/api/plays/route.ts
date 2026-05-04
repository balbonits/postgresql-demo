  // POST /api/plays
  // Body: { video_id: number }                                                                                                                   
  // 1. Parse video_id from request body                                                                                                          
  // 2. Run both queries inside sql.begin() (see guide: Transactions)
  // 3. Return the new play row   

import { sql } from '@/lib/db';

export const POST = async (request: Request) => {
    try {
        const { video_id } = await request.json();
        if (!video_id) {
            return new Response('Missing video_id', { status: 400 });
        }

        const result = await sql.begin(async (sql) => {
            const play = await sql`
                INSERT INTO plays (video_id, played_at)
                VALUES (${video_id}, NOW())
                RETURNING *
            `;

            await sql`
                UPDATE videos
                SET view_count = view_count + 1
                WHERE id = ${video_id}
            `;

            return play[0];
        });

        return Response.json(result);
    } catch (error) {
        console.error('Failed to record play', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}   