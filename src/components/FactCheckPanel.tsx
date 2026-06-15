'use client';

import { formatPercent } from '@/utils';
import type { FactCheckReport } from '@/types';

export function FactCheckPanel({ factCheck }: { factCheck: FactCheckReport | null }) {
  if (!factCheck) {
    return (
      <div className="rounded-[28px] border p-6" style={{ background: '#ffffff', borderColor: 'rgba(107, 142, 122, 0.12)' }}>
        <p className="text-sm font-semibold" style={{ color: '#1a1612' }}>Evidence Integrity</p>
        <p className="mt-2 text-sm" style={{ color: '#6b6360' }}>
          No fact check is available yet. Evidence verification appears after `run_evaluation`.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border p-6 space-y-6" style={{ background: '#ffffff', borderColor: 'rgba(107, 142, 122, 0.12)' }}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>Fact Check</p>
          <h3 className="mt-2 text-2xl font-semibold" style={{ color: '#1a1612' }}>Evidence Integrity</h3>
          <p className="mt-2 text-sm" style={{ color: '#6b6360' }}>{factCheck.summary || 'No summary available yet.'}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Verification Score', value: formatPercent(factCheck.verification_score) },
            { label: 'Status', value: factCheck.verification_status },
            { label: 'Verified Sources', value: String(factCheck.verified_source_count) },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl p-4" style={{ background: 'rgba(107, 142, 122, 0.06)' }}>
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: '#9b938a' }}>{item.label}</p>
              <p className="mt-2 text-sm font-semibold" style={{ color: '#1a1612' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Verified Claims', items: factCheck.verified_claims },
          { label: 'Contradictions', items: factCheck.contradictions },
          { label: 'Missing Evidence', items: factCheck.missing_evidence },
        ].map((section) => (
          <div key={section.label} className="rounded-3xl border p-4" style={{ borderColor: 'rgba(107, 142, 122, 0.12)' }}>
            <p className="text-sm font-semibold" style={{ color: '#1a1612' }}>{section.label}</p>
            {section.items.length === 0 ? (
              <p className="mt-3 text-sm" style={{ color: '#6b6360' }}>No items recorded.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm" style={{ color: '#6b6360' }}>
                {section.items.map((item, index) => (
                  <li key={`${section.label}-${index}`}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div>
        <p className="text-sm font-semibold" style={{ color: '#1a1612' }}>Source Summaries</p>
        {factCheck.source_summaries.length === 0 ? (
          <p className="mt-3 text-sm" style={{ color: '#6b6360' }}>No evidence sources have been summarized yet.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {factCheck.source_summaries.map((source, index) => (
              <div key={`${source.url}-${index}`} className="rounded-3xl border p-4" style={{ borderColor: 'rgba(107, 142, 122, 0.12)', background: 'rgba(107, 142, 122, 0.03)' }}>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: '#9b938a' }}>{source.source_type}</p>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm hover:underline" style={{ color: '#6b8e7a' }}>
                      {source.url}
                    </a>
                  </div>
                  <span className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]" style={{ background: 'rgba(184, 99, 63, 0.08)', color: '#b8633f' }}>
                    {source.status}
                  </span>
                </div>
                <p className="mt-3 text-sm" style={{ color: '#6b6360' }}>{source.note || 'No additional note provided.'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
