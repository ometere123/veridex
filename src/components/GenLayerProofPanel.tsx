import { truncateHash, formatDateTime } from '@/utils';
import type { GenLayerProof } from '@/types';

interface GenLayerProofPanelProps {
  proof: GenLayerProof;
  className?: string;
}

const STATUS_ICON = {
  complete: { icon: '✓', color: '#6b8e7a', bg: 'rgba(107,142,122,0.10)' },
  failed:   { icon: '✗', color: '#b8633f', bg: 'rgba(184,99,63,0.10)' },
  pending:  { icon: '○', color: '#9b938a', bg: 'rgba(107,142,122,0.06)' },
};

export function GenLayerProofPanel({ proof, className }: GenLayerProofPanelProps) {
  return (
    <div
      className={className}
      style={{
        background: '#ffffff',
        border: '1px solid rgba(107,142,122,0.12)',
        borderRadius: '20px',
        padding: '20px',
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background: 'rgba(107,142,122,0.10)', color: '#6b8e7a' }}
        >
          ⬡
        </div>
        <h3 className="font-semibold text-sm" style={{ color: '#1a1612' }}>
          GenLayer Proof Chain
        </h3>
      </div>

      <div className="space-y-px mb-5">
        {proof.steps.map((step, i) => {
          const s = STATUS_ICON[step.status];
          return (
            <div
              key={i}
              className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
              style={{ background: i % 2 === 0 ? 'rgba(107,142,122,0.03)' : 'transparent' }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: s.bg, color: s.color }}
              >
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium" style={{ color: '#1a1612' }}>
                  {step.label}
                </div>
                {step.timestamp && (
                  <div className="text-[10px]" style={{ color: '#9b938a' }}>
                    {formatDateTime(step.timestamp)}
                  </div>
                )}
              </div>
              {step.tx_hash && (
                <code className="text-[10px] font-mono hidden sm:block" style={{ color: '#6b8e7a' }}>
                  {truncateHash(step.tx_hash, 5)}
                </code>
              )}
            </div>
          );
        })}
      </div>

      <div
        className="space-y-2 text-xs pt-4"
        style={{ borderTop: '1px solid rgba(107,142,122,0.10)' }}
      >
        <div className="flex items-center justify-between">
          <span style={{ color: '#9b938a' }}>Contract</span>
          <code className="font-mono" style={{ color: '#6b6360' }}>
            {truncateHash(proof.contract_address, 7)}
          </code>
        </div>
        {proof.evidence_hash && (
          <div className="flex items-center justify-between">
            <span style={{ color: '#9b938a' }}>Source Hash</span>
            <code className="font-mono" style={{ color: '#6b8e7a' }}>
              {truncateHash(proof.evidence_hash, 7)}
            </code>
          </div>
        )}
        {proof.evaluation_hash && (
          <div className="flex items-center justify-between">
            <span style={{ color: '#9b938a' }}>Assessment Hash</span>
            <code className="font-mono" style={{ color: '#b8633f' }}>
              {truncateHash(proof.evaluation_hash, 7)}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
