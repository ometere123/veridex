import { cn, formatScore, getScoreHex, safeNumber } from '@/utils';

interface ScoreCardProps {
  label: string;
  score: number;
  weight: string;
  icon: string;
  description: string;
  className?: string;
}

function Arc({ score }: { score: number }) {
  const value = safeNumber(score, 0);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const hex = getScoreHex(value);

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="flex-shrink-0">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(107, 142, 122, 0.12)" strokeWidth="5" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke={hex}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
        style={{ filter: `drop-shadow(0 0 4px ${hex}66)`, transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="800" fontFamily="monospace" fill={hex}>
        {Math.round(value)}
      </text>
    </svg>
  );
}

export function ScoreCard({ label, score, weight, icon, description, className }: ScoreCardProps) {
  const value = safeNumber(score, 0);
  const hex = getScoreHex(value);

  return (
    <div
      className={cn('rounded-[24px] p-5 flex items-center gap-4', className)}
      style={{ background: '#ffffff', border: '1px solid rgba(107, 142, 122, 0.1)' }}
    >
      <Arc score={value} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: '#6b8e7a' }}>{icon}</span>
          <span className="text-sm font-semibold" style={{ color: '#1a1612' }}>{label}</span>
          <span className="text-[10px] font-mono ml-auto" style={{ color: '#9b938a' }}>{weight}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(107, 142, 122, 0.1)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${value}%`,
              background: `linear-gradient(90deg, ${hex}44, ${hex})`,
              transition: 'width 0.8s ease',
            }}
          />
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: '#6b6360' }}>{description}</p>
        <p className="mt-2 text-xs font-mono" style={{ color: hex }}>{formatScore(value)}</p>
      </div>
    </div>
  );
}

export function ProtocolArchitectureCard({ score, className }: { score: number; className?: string }) {
  return (
    <ScoreCard
      label="Protocol Architecture"
      score={score}
      weight="20%"
      icon="◈"
      description="Architecture clarity, protocol design depth, and technical defensibility."
      className={className}
    />
  );
}

export function TeamGovernanceCard({ score, className }: { score: number; className?: string }) {
  return (
    <ScoreCard
      label="Team & Governance"
      score={score}
      weight="15%"
      icon="◎"
      description="Leadership credibility, governance transparency, and accountability signals."
      className={className}
    />
  );
}

export function MarketTractionCard({ score, className }: { score: number; className?: string }) {
  return (
    <ScoreCard
      label="Market Traction"
      score={score}
      weight="15%"
      icon="▷"
      description="User traction, adoption indicators, and evidence of market pull."
      className={className}
    />
  );
}

export function SecurityRiskCard({ score, className }: { score: number; className?: string }) {
  return (
    <ScoreCard
      label="Security & Risk"
      score={score}
      weight="15%"
      icon="◇"
      description="Audit posture, risk controls, and the completeness of security proof."
      className={className}
    />
  );
}

export function DeliveryProofCard({ score, className }: { score: number; className?: string }) {
  return (
    <ScoreCard
      label="Delivery Proof"
      score={score}
      weight="15%"
      icon="⬡"
      description="Roadmap execution, shipped milestones, and delivery traceability."
      className={className}
    />
  );
}

export function TokenDesignCard({ score, className }: { score: number; className?: string }) {
  return (
    <ScoreCard
      label="Token Design"
      score={score}
      weight="10%"
      icon="◉"
      description="Token utility, incentive design, and sustainability of the economic model."
      className={className}
    />
  );
}

export function EvidenceIntegrityCard({ score, className }: { score: number; className?: string }) {
  return (
    <ScoreCard
      label="Evidence Integrity"
      score={score}
      weight="10%"
      icon="✦"
      description="Source quality, evidence consistency, and fact-check reliability."
      className={className}
    />
  );
}
