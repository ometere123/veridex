import { cn } from '@/utils';

type VeridexLogoProps = {
  className?: string;
  markClassName?: string;
  size?: number;
  withWordmark?: boolean;
  subtitle?: string;
};

export function VeridexLogo({
  className,
  markClassName,
  size = 40,
  withWordmark = false,
  subtitle = 'Verified intelligence',
}: VeridexLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 56 56"
        className={markClassName}
        style={{ width: size, height: size, flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="veridex-logo-bg" x1="8" y1="6" x2="48" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0D2418" />
            <stop offset="1" stopColor="#05110C" />
          </linearGradient>
          <linearGradient id="veridex-logo-accent" x1="14" y1="14" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8EFFC3" />
            <stop offset="1" stopColor="#4DDF98" />
          </linearGradient>
        </defs>

        <rect x="2" y="2" width="52" height="52" rx="18" fill="url(#veridex-logo-bg)" />
        <rect x="2" y="2" width="52" height="52" rx="18" stroke="rgba(142,255,195,0.34)" />

        <path
          d="M28 10 40.5 17v14L28 46 15.5 31V17Z"
          fill="none"
          stroke="url(#veridex-logo-accent)"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path
          d="M19 31.5 25 25.5 29 29.5 37 21.5"
          fill="none"
          stroke="#FFB874"
          strokeWidth="3.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.5 17 28 24.5 40.5 17M15.5 31 28 24.5 40.5 31"
          fill="none"
          stroke="#8EFFC3"
          strokeOpacity="0.42"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="15.5" cy="17" r="3" fill="#8EFFC3" />
        <circle cx="40.5" cy="17" r="3" fill="#8EFFC3" />
        <circle cx="40.5" cy="31" r="3" fill="#FFB874" />
        <circle cx="28" cy="46" r="3" fill="#8EFFC3" />
      </svg>

      {withWordmark ? (
        <div className="min-w-0">
          <div
            className="text-sm font-bold uppercase tracking-[0.16em]"
            style={{
              color: '#f3fff7',
              fontFamily: 'var(--font-space-grotesk)',
              textShadow: '0 0 18px rgba(142,255,195,0.18)',
            }}
          >
            Veridex
          </div>
          <div
            className="text-[10px] uppercase tracking-[0.22em]"
            style={{ color: '#9fcbb5' }}
          >
            {subtitle}
          </div>
        </div>
      ) : null}
    </div>
  );
}
