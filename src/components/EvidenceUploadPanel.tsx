'use client';

import { useState, useRef } from 'react';
import { cn } from '@/utils';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string; // object URL for preview
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
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(incoming: File[]) {
    const newFiles = incoming.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f),
    }));
    const merged = [...files, ...newFiles].filter(
      (f, i, arr) => arr.findIndex((x) => x.name === f.name) === i
    );
    setFiles(merged);
    onFilesChange?.(merged);
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
        className="relative rounded-xl cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-3 py-10 px-6"
        style={{
          background: dragging ? 'rgba(230,190,247,0.08)' : 'rgba(230,190,247,0.03)',
          border: `2px dashed ${dragging ? '#e6bef7' : 'rgba(230,190,247,0.15)'}`,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: 'rgba(230,190,247,0.08)', color: '#e6bef7' }}
        >
          ↑
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: '#f5eeff' }}>
            Drop evidence files here
          </p>
          <p className="text-xs mt-1" style={{ color: '#9b86b8' }}>
            PDF, Markdown, JSON, Images — max 20 MB each
          </p>
        </div>
        <div
          className="text-xs px-4 py-1.5 rounded-lg font-medium"
          style={{ background: 'rgba(230,190,247,0.1)', color: '#e6bef7', border: '1px solid rgba(230,190,247,0.2)' }}
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
          disabled={disabled}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f) => (
            <div
              key={f.name}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5"
              style={{ background: '#0e0a1a', border: '1px solid rgba(230,190,247,0.08)' }}
            >
              <span className="text-lg flex-shrink-0" style={{ color: '#e6bef7' }}>
                {f.type === 'application/pdf' ? '📄' : f.type.startsWith('image/') ? '🖼' : '📝'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#f5eeff' }}>{f.name}</p>
                <p className="text-[11px]" style={{ color: '#6b5490' }}>{formatBytes(f.size)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                  style={{ background: 'rgba(74,222,128,0.08)', color: '#4ade80' }}
                >
                  ✓ Attached
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(f.name); }}
                  className="text-sm w-5 h-5 flex items-center justify-center rounded transition-colors hover:bg-red-500/20"
                  style={{ color: '#6b5490' }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <p className="text-[11px]" style={{ color: '#6b5490' }}>
          {files.length} file{files.length > 1 ? 's' : ''} attached · Files are hashed into the evidence record when you lock.
        </p>
      )}
    </div>
  );
}
