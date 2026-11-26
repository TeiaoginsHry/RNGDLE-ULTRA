import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from './db';
export async function identity() {
  const session = await auth();
  if (!session.userId) return null;
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId);
  if (!clerkUser || !email?.emailAddress || !email.verification?.verifiedAt) return null;
  const sql = db();
  await sql`INSERT INTO players (clerk_user_id, email, username, avatar_url) VALUES (${session.userId}, ${email.emailAddress.toLowerCase()}, ${clerkUser.username || clerkUser.firstName || 'Player'}, ${clerkUser.imageUrl}) ON CONFLICT (clerk_user_id) DO UPDATE SET email = EXCLUDED.email, avatar_url = EXCLUDED.avatar_url`;
  const state = await sql`SELECT banned FROM players WHERE clerk_user_id=${session.userId} LIMIT 1`;
  if (state[0]?.banned) return null;
  return { id: session.userId, email: email.emailAddress.toLowerCase(), isOwner: !!process.env.OWNER_CLERK_USER_ID && session.userId === process.env.OWNER_CLERK_USER_ID };
}
export async function requireOwner() {
  const user = await identity();
  if (!user) return { user: null, response: Response.json({ error: 'Sign in with a verified account.' }, { status: 401 }) };
  if (!user.isOwner) return { user: null, response: Response.json({ error: 'Owner access only.' }, { status: 403 }) };
  return { user, response: null };
}
