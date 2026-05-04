import { sql } from '@/lib/db';

export const GET = async () => {

  const plays = await sql`
    SELECT date_trunc('day', played_at) AS day, COUNT(*) AS plays
    FROM plays
    WHERE played_at >= NOW() - INTERVAL '30 days'
    GROUP BY day
    ORDER BY day DESC
  `;

  return Response.json(plays);
}