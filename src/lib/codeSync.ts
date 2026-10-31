import { getAdminToken } from './adminAuth';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  mtimeMs?: number;
  extension?: string;
  children?: FileNode[];
}

export type SyncState = 'synced' | 'syncing' | 'dirty' | 'conflict' | 'failed' | 'offline';

export interface SyncInfo {
  status: SyncState;
  branch: string;
  lastCommit?: string;
  lastSyncTime: number;
  modifiedFiles: string[];
  uncommittedCount: number;
  remoteConfigured: boolean;
  remoteUrl?: string;
  message?: string;
}

export interface SearchResult {
  file: string;
  line: number;
  content: string;
  matchIndex: number;
}

export interface CodeProposal {
  id: string;
  targetFile: string;
  startLine?: number;
  endLine?: number;
  originalContent: string;
  proposedContent: string;
  explanation: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface BackupItem {
  id: string;
  backupPath: string;
  originalPath: string;
  timestamp: number;
  dateStr: string;
  size: number;
}

const getAuthHeaders = (): Record<string, string> => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Loads the complete project file tree from backend
 */
export async function fetchFileTree(): Promise<FileNode[]> {
  const res = await fetch('/api/fs/tree', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load file tree (${res.status})`);
  const data = await res.json();
  return data.tree || [];
}

/**
 * Loads content of a specific file
 */
export async function fetchFileContent(filePath: string): Promise<{ content: string; mtimeMs?: number }> {
  const res = await fetch(`/api/fs/file?path=${encodeURIComponent(filePath)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load file: ${filePath}`);
  const data = await res.json();
  return { content: data.content ?? '', mtimeMs: data.mtimeMs };
}

/**
 * Saves content of a file directly to the project filesystem
 */
export async function saveFileContent(filePath: string, content: string): Promise<{ success: boolean; backupCreated?: string }> {
  const res = await fetch('/api/fs/file', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ path: filePath, content }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Save failed (${res.status})`);
  }
  return res.json();
}

/**
 * Creates a new file or directory
 */
export async function createFileOrDir(filePath: string, type: 'file' | 'directory', initialContent = ''): Promise<{ success: boolean }> {
  const res = await fetch('/api/fs/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ path: filePath, type, initialContent }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Create failed (${res.status})`);
  }
  return res.json();
}

/**
 * Deletes a file or directory with automated backup
 */
export async function deleteFileOrDir(filePath: string): Promise<{ success: boolean }> {
  const res = await fetch('/api/fs/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ path: filePath }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Delete failed (${res.status})`);
  }
  return res.json();
}

/**
 * Renames or moves a file or folder
 */
export async function renameFileOrDir(oldPath: string, newPath: string): Promise<{ success: boolean }> {
  const res = await fetch('/api/fs/rename', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ oldPath, newPath }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Rename failed (${res.status})`);
  }
  return res.json();
}

/**
 * Performs a global text search across all project files
 */
export async function searchProjectFiles(query: string, isCaseSensitive = false, isRegex = false): Promise<SearchResult[]> {
  const res = await fetch('/api/fs/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ query, isCaseSensitive, isRegex }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

/**
 * Gets list of backups for a file or entire project
 */
export async function fetchBackups(filePath?: string): Promise<BackupItem[]> {
  const url = filePath ? `/api/fs/backups?path=${encodeURIComponent(filePath)}` : '/api/fs/backups';
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.backups || [];
}

/**
 * Restores a file from a backup snapshot
 */
export async function restoreBackup(backupId: string): Promise<{ success: boolean }> {
  const res = await fetch('/api/fs/restore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ backupId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Restore failed (${res.status})`);
  }
  return res.json();
}

/**
 * Gets the current two-way synchronization status
 */
export async function fetchSyncStatus(): Promise<SyncInfo> {
  const res = await fetch('/api/sync/status', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    return {
      status: 'failed',
      branch: 'main',
      lastSyncTime: Date.now(),
      modifiedFiles: [],
      uncommittedCount: 0,
      remoteConfigured: false,
      message: 'Server unreachable',
    };
  }
  return res.json();
}

/**
 * Triggers an immediate verified synchronization
 */
export async function triggerSyncNow(commitMessage?: string): Promise<SyncInfo> {
  const res = await fetch('/api/sync/sync-now', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ commitMessage }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Sync failed (${res.status})`);
  }
  return res.json();
}

/**
 * Resolves a merge conflict
 */
export async function resolveConflict(filePath: string, resolution: 'keep_local' | 'accept_remote'): Promise<{ success: boolean }> {
  const res = await fetch('/api/sync/conflict-resolve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ filePath, resolution }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Conflict resolution failed (${res.status})`);
  }
  return res.json();
}

/**
 * Saves remote sync configuration (e.g. GitHub repo URL & access token)
 */
export async function saveSyncConfig(config: { remoteUrl?: string; token?: string; branch?: string }): Promise<{ success: boolean; message?: string }> {
  const res = await fetch('/api/sync/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update config (${res.status})`);
  }
  return res.json();
}

export type VyronAiWorkingMode = 'learn' | 'analyze' | 'developer';

/**
 * Vyron AI Code Assistant query supporting Learn, Analyze, and Developer modes
 */
export async function askVyronAiCodeAssistant(params: {
  question: string;
  activeFile?: string;
  selectedCode?: string;
  workingMode?: VyronAiWorkingMode;
  mode?: 'chat' | 'bug' | 'diff' | 'explain';
  languagePreference?: 'hindi' | 'english' | 'hinglish';
}): Promise<{
  reply: string;
  references?: Array<{ file: string; lineStart?: number; lineEnd?: number }>;
  proposal?: CodeProposal;
}> {
  const res = await fetch('/api/ai/code-assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `AI Assistant failed (${res.status})`);
  }
  return res.json();
}
