import { truncateHash, formatDateTime } from '@/utils';
import type { GenLayerProof } from '@/types';

interface GenLayerProofPanelProps {
  proof: GenLayerProof;
  className?: string;
}

const STATUS_ICON = {
  complete: { icon: '✓', color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
  failed:   { icon: '✗', color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
  pending:  { icon: '○', color: '#6b5490', bg: 'rgba(107,84,144,0.08)' },
};

export function GenLayerProofPanel({ proof, className }: GenLayerProofPanelProps) {
  return (
    <div
      className={className}
      style={{
        background: '#0e0a1a',
        border: '1px solid rgba(230,190,247,0.12)',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#e6bef7)', color: '#fff' }}
        >
          ⬡
        </div>
        <h3 className="font-semibold text-sm" style={{ color: '#f5eeff' }}>
          GenLayer Proof
        </h3>
      </div>

      {/* Steps */}
      <div className="space-y-px mb-5">
        {proof.steps.map((step, i) => {
          const s = STATUS_ICON[step.status];
          return (
            <div
              key={i}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg"
              style={{ background: i % 2 === 0 ? 'rgba(230,190,247,0.02)' : 'transparent' }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: s.bg, color: s.color }}
              >
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium" style={{ color: '#ddd0f0' }}>
                  {step.label}
                </div>
                {step.timestamp && (
                  <div className="text-[10px]" style={{ color: '#6b5490' }}>
                    {formatDateTime(step.timestamp)}
                  </div>
                )}
              </div>
              {step.tx_hash && (
                <code className="text-[10px] font-mono hidden sm:block" style={{ color: '#c084fc' }}>
                  {truncateHash(step.tx_hash, 5)}
                </code>
              )}
            </div>
          );
        })}
      </div>

      {/* Metadata */}
      <div
        className="space-y-2 text-xs pt-4"
        style={{ borderTop: '1px solid rgba(230,190,247,0.08)' }}
      >
        <div className="flex items-center justify-between">
          <span style={{ color: '#6b5490' }}>Contract</span>
          <code className="font-mono" style={{ color: '#9b86b8' }}>
            {truncateHash(proof.contract_address, 7)}
          </code>
        </div>
        {proof.evidence_hash && (
          <div className="flex items-center justify-between">
            <span style={{ color: '#6b5490' }}>Evidence Hash</span>
            <code className="font-mono" style={{ color: '#4ade80' }}>
              {truncateHash(proof.evidence_hash, 7)}
            </code>
          </div>
        )}
        {proof.evaluation_hash && (
          <div className="flex items-center justify-between">
            <span style={{ color: '#6b5490' }}>Evaluation Hash</span>
            <code className="font-mono" style={{ color: '#e6bef7' }}>
              {truncateHash(proof.evaluation_hash, 7)}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
