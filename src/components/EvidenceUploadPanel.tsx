'use client';

import { useState, useRef } from 'react';
import { cn } from '@/utils';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
}

interface EvidenceUploadPanelProps {
  onFilesChange?: (files: UploadedFile[]) => void;
  disabled?: boolean;
  className?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt', '.md'],
  'application/json': ['.json'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
};

export function EvidenceUploadPanel({ onFilesChange, disabled, className }: EvidenceUploadPanelProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  async function addFiles(incoming: File[]) {
    setUploading(true);
    setError('');
    const uploaded: UploadedFile[] = [];

    try {
      for (const file of incoming) {
        const body = new FormData();
        body.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Upload failed');
        uploaded.push({ name: file.name, size: file.size, type: file.type, url: json.url, path: json.path });
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Evidence upload failed');
      setUploading(false);
      return;
    }

    const merged = [...files, ...uploaded].filter(
      (f, i, arr) => arr.findIndex((x) => x.name === f.name) === i
    );
    setFiles(merged);
    onFilesChange?.(merged);
    setUploading(false);
  }

  function removeFile(name: string) {
    const merged = files.filter((f) => f.name !== name);
    setFiles(merged);
    onFilesChange?.(merged);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    addFiles(Array.from(e.dataTransfer.files));
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className="relative rounded-3xl cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-3 py-10 px-6"
        style={{
          background: dragging ? 'rgba(107, 142, 122, 0.08)' : 'rgba(107, 142, 122, 0.04)',
          border: `2px dashed ${dragging ? 'var(--brand)' : 'rgba(107, 142, 122, 0.25)'}`,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: 'rgba(107, 142, 122, 0.15)', color: 'var(--brand-deep)' }}
        >
          ↑
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Upload evidence files to hosted storage
          </p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            PDF, Markdown, JSON, Images - max 20 MB each. Only hosted URLs are sent on-chain.
          </p>
        </div>
        <div
          className="text-xs px-4 py-1.5 rounded-2xl font-medium"
          style={{ background: 'rgba(107, 142, 122, 0.12)', color: 'var(--brand-deep)', border: '1px solid rgba(107, 142, 122, 0.18)' }}
        >
          Browse Files
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={Object.values(ACCEPTED).flat().join(',')}
          className="hidden"
          onChange={onInputChange}
          disabled={disabled || uploading}
        />
      </div>

      {uploading && (
        <div className="rounded-2xl px-4 py-3 text-xs" style={{ background: 'rgba(107, 142, 122, 0.08)', color: 'var(--brand-deep)' }}>
          Uploading files to storage...
        </div>
      )}

      {error && (
        <div className="rounded-2xl px-4 py-3 text-xs" style={{ background: 'rgba(168, 92, 74, 0.08)', color: '#a85c4a' }}>
          {error}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f) => (
            <div
              key={f.name}
              className="flex items-center gap-3 rounded-3xl px-3 py-3"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <span className="text-lg flex-shrink-0" style={{ color: 'var(--brand)' }}>
                {f.type === 'application/pdf' ? '📄' : f.type.startsWith('image/') ? '🖼' : '📝'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{f.name}</p>
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{formatBytes(f.size)}</p>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] break-all hover:underline"
                  style={{ color: 'var(--brand-deep)' }}
                >
                  {f.url}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                  style={{ background: 'rgba(107, 142, 122, 0.1)', color: 'var(--brand-deep)' }}
                >
                  ✓ Attached
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(f.name); }}
                  className="text-sm w-5 h-5 flex items-center justify-center rounded transition-colors hover:bg-red-500/20"
                  style={{ color: 'var(--muted)' }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <p className="text-[11px]" style={{ color: '#64748b' }}>
          {files.length} file{files.length > 1 ? 's' : ''} uploaded. Use the hosted URL in your verification document or supporting evidence fields.
        </p>
      )}
    </div>
  );
}
