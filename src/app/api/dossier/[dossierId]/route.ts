import { NextRequest, NextResponse } from 'next/server';
import {
  getDossier,
  getEvidenceManifest,
  getFactCheck,
  getProofLedger,
  getVerificationHistory,
  getVerificationReport,
} from '@/lib/genlayer';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ dossierId: string }> },
) {
  const { dossierId } = await params;

  try {
    const [dossier, evidence_manifest, fact_check, verification_report, verification_history, proof_ledger] = await Promise.all([
      getDossier(dossierId),
      getEvidenceManifest(dossierId),
      getFactCheck(dossierId),
      getVerificationReport(dossierId),
      getVerificationHistory(dossierId),
      getProofLedger(dossierId),
    ]);

    return NextResponse.json({
      dossier,
      evidence_manifest,
      fact_check,
      verification_report,
      verification_history,
      proof_ledger,
    });
  } catch (err) {
    console.error('GET /api/dossier/[dossierId] error:', err);
    return NextResponse.json({ error: 'Dossier not found' }, { status: 404 });
  }
}
