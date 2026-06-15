import { NextResponse } from 'next/server';
import { getTreasuryState } from '@/lib/genlayer';

export async function GET() {
  try {
    const state = await getTreasuryState();
    
    if (!state) {
      return NextResponse.json({
        create_project_fee: '0',
        evaluation_fee: '0',
        reevaluation_fee: '0',
        fees_enabled: false,
      });
    }

    return NextResponse.json(state);
  } catch (error) {
    console.error('Error fetching fees:', error);
    return NextResponse.json({ error: 'Failed to fetch fees' }, { status: 500 });
  }
}
