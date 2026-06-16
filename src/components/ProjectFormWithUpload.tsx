'use client';

import { useState } from 'react';
import { ProjectForm } from './ProjectForm';
import { EvidenceUploadPanel } from './EvidenceUploadPanel';

export function ProjectFormWithUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; size: number; type: string; url: string; path: string }[]
  >([]);

  return (
    <div className="space-y-6">
      <div
        className="rounded-3xl p-6"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 50px rgba(26, 22, 18, 0.05)',
        }}
      >
        <div className="mb-4 flex items-center gap-2">
          <span style={{ color: 'var(--brand)' }}>^</span>
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
            Proof Documents
          </h2>
          <span
            className="ml-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ background: 'rgba(184, 99, 63, 0.08)', color: 'var(--brand-deep)' }}
          >
            Optional
          </span>
        </div>
        <p className="mb-4 text-xs" style={{ color: 'var(--muted-2)' }}>
          Attach whitepapers, audit reports, or architecture diagrams. GenLayer fetches these URLs directly during on-chain assessment.
        </p>
        <EvidenceUploadPanel onFilesChange={setUploadedFiles} />
      </div>

      <ProjectForm uploadedFiles={uploadedFiles} />
    </div>
  );
}
