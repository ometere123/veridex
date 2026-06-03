/**
 * local-projects.ts
 * Client-side localStorage cache for submitted project IDs.
 * Used as a fallback when Supabase tables are not yet created.
 */

export interface LocalProject {
  project_id: string;
  name: string;
  category: string;
  website: string;
  description: string;
  owner: string;
  status: string;
  created_at: string;
}

const KEY = 'alpharank_projects';

export function saveProjectLocally(project: LocalProject): void {
  try {
    const existing = getLocalProjects();
    const updated = [project, ...existing.filter((p) => p.project_id !== project.project_id)];
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch { /* localStorage might not be available */ }
}

export function getLocalProjects(): LocalProject[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalProject[];
  } catch { return []; }
}

export function getLocalProjectsByOwner(owner: string): LocalProject[] {
  return getLocalProjects().filter(
    (p) => p.owner.toLowerCase() === owner.toLowerCase()
  );
}
