import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is missing from .env.local');

export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
});
