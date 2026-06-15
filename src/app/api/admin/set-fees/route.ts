import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await req.json();
    return NextResponse.json(
      { error: 'Use the owner wallet from /admin to submit set_protocol_fees on-chain.' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Error setting fees:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update fees',
      },
      { status: 500 }
    );
  }
}
