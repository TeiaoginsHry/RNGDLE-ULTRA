import { db } from '@/lib/db'; import { NextResponse } from 'next/server';
export async function GET(){try{const rows=await db()`SELECT username,total_rolls,best_rarity,avatar_url FROM players ORDER BY total_rolls DESC LIMIT 50`;return NextResponse.json({players:rows});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Database error'},{status:500});}}
