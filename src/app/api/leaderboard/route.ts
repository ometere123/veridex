import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/genlayer';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'overall';

    // Leaderboard always sourced from GenLayer on-chain state
    const entries = await getLeaderboard(category);
    return NextResponse.json({ entries, category });
  } catch (err) {
    console.error('GET /api/leaderboard error:', err);
    return NextResponse.json({ entries: [], category: 'overall' });
  }
}
