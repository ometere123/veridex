import { NextRequest, NextResponse } from 'next/server';
import { getProfile } from '@/lib/genlayer';

interface Props {
  params: Promise<{ wallet: string }>;
}

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const { wallet } = await params;
    const profile = await getProfile(wallet);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (err) {
    console.error('GET /api/profile error:', err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
