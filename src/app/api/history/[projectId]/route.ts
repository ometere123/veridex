import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalScores } from '@/lib/genlayer';

interface Props {
  params: Promise<{ projectId: string }>;
}

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const { projectId } = await params;
    const history = await getHistoricalScores(projectId);
    return NextResponse.json({ history, project_id: projectId });
  } catch (err) {
    console.error('GET /api/history error:', err);
    return NextResponse.json({ history: [], project_id: '' });
  }
}
