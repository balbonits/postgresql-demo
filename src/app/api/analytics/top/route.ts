import { sql } from '@/lib/db';

export async function GET() {
  const top = await sql`
    SELECT 
      v.id, 
      v.title, 
      v.thumbnail_url,
      COUNT(p.id) as plays
    FROM videos v
    LEFT JOIN plays p ON v.id = p.video_id
    GROUP BY v.id, v.title, v.thumbnail_url
    ORDER BY plays DESC
    LIMIT 10
  `;
  return Response.json(top);
}