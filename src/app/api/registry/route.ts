import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/genlayer';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'overall';
    const entries = await getRegistry(category);

    return NextResponse.json({ entries, category });
  } catch (err) {
    console.error('GET /api/registry error:', err);
    return NextResponse.json({ entries: [], category: 'overall' });
  }
}
