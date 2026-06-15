import { truncateHash, formatDateTime } from '@/utils';
import type { GenLayerProof } from '@/types';

interface GenLayerProofPanelProps {
  proof: GenLayerProof;
  className?: string;
}

const STATUS_ICON = {
  complete: { icon: '✓', color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
  failed:   { icon: '✗', color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
  pending:  { icon: '○', color: '#64748b', bg: 'rgba(107,84,144,0.08)' },
};

export function GenLayerProofPanel({ proof, className }: GenLayerProofPanelProps) {
  return (
    <div
      className={className}
      style={{
        background: '#0a0f1a',
        border: '1px solid rgba(0,217,255,0.12)',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg,#00d9ff,#00d9ff)', color: '#fff' }}
        >
          ⬡
        </div>
        <h3 className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>
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
              style={{ background: i % 2 === 0 ? 'rgba(0,217,255,0.02)' : 'transparent' }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: s.bg, color: s.color }}
              >
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium" style={{ color: '#cbd5e1' }}>
                  {step.label}
                </div>
                {step.timestamp && (
                  <div className="text-[10px]" style={{ color: '#64748b' }}>
                    {formatDateTime(step.timestamp)}
                  </div>
                )}
              </div>
              {step.tx_hash && (
                <code className="text-[10px] font-mono hidden sm:block" style={{ color: '#00d9ff' }}>
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
        style={{ borderTop: '1px solid rgba(0,217,255,0.08)' }}
      >
        <div className="flex items-center justify-between">
          <span style={{ color: '#64748b' }}>Contract</span>
          <code className="font-mono" style={{ color: '#94a3b8' }}>
            {truncateHash(proof.contract_address, 7)}
          </code>
        </div>
        {proof.evidence_hash && (
          <div className="flex items-center justify-between">
            <span style={{ color: '#64748b' }}>Evidence Hash</span>
            <code className="font-mono" style={{ color: '#4ade80' }}>
              {truncateHash(proof.evidence_hash, 7)}
            </code>
          </div>
        )}
        {proof.evaluation_hash && (
          <div className="flex items-center justify-between">
            <span style={{ color: '#64748b' }}>Assessment Hash</span>
            <code className="font-mono" style={{ color: '#00d9ff' }}>
              {truncateHash(proof.evaluation_hash, 7)}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
