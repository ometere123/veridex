import { explorerTxUrl } from '@/lib/explorer';
import { truncateHash } from '@/utils';

export function TxLink({ hash, label = 'View transaction', className }: { hash: string; label?: string; className?: string }) {
  return (
    <a
      href={explorerTxUrl(hash)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{ color: '#8effc3', textDecoration: 'underline', textUnderlineOffset: '2px' }}
    >
      {label} ({truncateHash(hash, 10)}) ↗
    </a>
  );
}
