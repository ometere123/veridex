import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_EVIDENCE_BUCKET || 'veridex-evidence';

/**
 * Issues a signed upload URL/token so the browser can PUT the file
 * directly to Supabase Storage. Keeps large files off the Vercel
 * function body (which caps request payloads around 4.5MB).
 */
export async function POST(req: NextRequest) {
  try {
    const { filename } = await req.json();
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 });
    }

    const ext = filename.includes('.') ? filename.split('.').pop() : 'bin';
    const path = `submissions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const supabase = getServiceClient();
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Could not create upload URL' }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({
      path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl: pub.publicUrl,
      bucket: BUCKET,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to prepare upload' }, { status: 500 });
  }
}
