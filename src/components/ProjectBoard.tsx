import { ProjectCard } from './ProjectCard';
import type { LeaderboardEntry } from '@/types';

interface ProjectBoardProps {
  entries: LeaderboardEntry[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ProjectBoard({ entries, columns = 3, className }: ProjectBoardProps) {
  if (entries.length === 0) {
    return (
      <div className={className} style={{ textAlign: 'center', padding: '64px 0', color: '#6b5490' }}>
        No projects to display.
      </div>
    );
  }

  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid gap-4 ${colClass} ${className ?? ''}`}>
      {entries.map((entry) => (
        <ProjectCard key={entry.project_id} entry={entry} />
      ))}
    </div>
  );
}
