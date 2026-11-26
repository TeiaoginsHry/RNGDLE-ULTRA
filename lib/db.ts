import { neon } from '@neondatabase/serverless';
export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Database is not configured. Add DATABASE_URL in Vercel environment variables.');
  return neon(url);
}
