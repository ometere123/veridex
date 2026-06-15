import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/genlayer';

export async function GET() {
  try {
    // Rankings come from GenLayer - never from Supabase or API logic
    const entries = await getLeaderboard('overall');
    return NextResponse.json({ entries });
  } catch (err) {
    console.error('GET /api/rankings error:', err);
    return NextResponse.json({ entries: [] });
  }
}
