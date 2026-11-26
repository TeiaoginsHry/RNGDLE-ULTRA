import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import Game from './ui/Game';
export const dynamic = 'force-dynamic';
export default async function Home() {
 let initial: any = { totalRolls:0, recent:[], leaderboard:[], rarities:[], profile:null, owner:false };
 try {
  const sql = db(); const session = await auth(); const clerk = session.userId ? await currentUser() : null;
  const email = clerk?.emailAddresses.find(e=>e.id===clerk.primaryEmailAddressId)?.emailAddress?.toLowerCase();
  const owner = !!session.userId && !!process.env.OWNER_CLERK_USER_ID && session.userId===process.env.OWNER_CLERK_USER_ID;
  const [stats, rarity, leaders] = await Promise.all([
   sql`SELECT COALESCE(SUM(total_rolls),0)::int AS rolls, COUNT(*)::int AS users FROM players`,
   sql`SELECT id, name, chance, color, enabled FROM rarities ORDER BY tier_order`,
   sql`SELECT username, total_rolls, best_rarity, avatar_url FROM players ORDER BY total_rolls DESC LIMIT 10`
  ]);
  if (session.userId && email) {
   await sql`INSERT INTO players (clerk_user_id,email,username,avatar_url) VALUES (${session.userId},${email},${clerk?.username || clerk?.firstName || 'Player'},${clerk?.imageUrl}) ON CONFLICT (clerk_user_id) DO UPDATE SET email=EXCLUDED.email,avatar_url=EXCLUDED.avatar_url`;
   const [p,r] = await Promise.all([sql`SELECT username,total_rolls,best_rarity FROM players WHERE clerk_user_id=${session.userId} LIMIT 1`,sql`SELECT item_name,rarity,created_at FROM rolls WHERE clerk_user_id=${session.userId} ORDER BY created_at DESC LIMIT 10`]);
   initial.profile = p[0] || null; initial.recent = r; initial.owner=owner;
  }
  initial.totalRolls=Number(stats[0]?.rolls||0); initial.users=Number(stats[0]?.users||0); initial.rarities=rarity; initial.leaderboard=leaders;
 } catch(e) { initial.setupError = e instanceof Error ? e.message : 'Database setup required'; }
 return <Game initial={initial}/>;
}
