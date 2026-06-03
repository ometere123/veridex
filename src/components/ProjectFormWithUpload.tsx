'use client';

import { useState } from 'react';
import { ProjectForm } from './ProjectForm';
import { EvidenceUploadPanel } from './EvidenceUploadPanel';

export function ProjectFormWithUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number; type: string; url: string }[]>([]);

  return (
    <div className="space-y-6">
      {/* File evidence upload section */}
      <div
        className="rounded-xl p-5"
        style={{ background: '#0e0a1a', border: '1px solid rgba(230,190,247,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span style={{ color: '#e6bef7' }}>↑</span>
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#9b86b8' }}>
            Evidence Files
          </h2>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-medium ml-1"
            style={{ background: 'rgba(230,190,247,0.08)', color: '#9b86b8' }}
          >
            Optional
          </span>
        </div>
        <p className="text-xs mb-4" style={{ color: '#6b5490' }}>
          Upload your whitepaper PDF, audit reports, or architecture diagrams.
          These files are referenced in your evidence hash when you lock.
        </p>
        <EvidenceUploadPanel
          onFilesChange={setUploadedFiles}
        />
      </div>

      {/* Main project form */}
      <ProjectForm uploadedFileNames={uploadedFiles.map((f) => f.name)} />
    </div>
  );
}
