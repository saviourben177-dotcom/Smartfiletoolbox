/**
 * Domain types for browsable file/media entries used across the File
 * Browser, Storage tools, and file-picking flows.
 */

export type FileSource = 'app' | 'media' | 'imported';

export type FileCategory =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'archive'
  | 'document'
  | 'folder'
  | 'other';

/** A single browsable file or folder entry, normalized across sources. */
export interface FileEntry {
  /** Stable identifier (uri for files, uri for folders). */
  id: string;
  /** Display name (basename, no path). */
  name: string;
  /** Fully qualified uri/path usable with expo-file-system or expo-media-library. */
  uri: string;
  /** True when this entry represents a directory. */
  isDirectory: boolean;
  /** Size in bytes. 0 for folders whose size hasn't been computed. */
  size: number;
  /** Last modified time, in epoch milliseconds. */
  modifiedAt: number;
  /** Normalized category used for icon/sort grouping. */
  category: FileCategory;
  /** Where this entry came from. */
  source: FileSource;
  /** Optional media library asset id, present when source === 'media'. */
  assetId?: string;
}

export type SortKey = 'name' | 'size' | 'date' | 'type';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid';

export interface DuplicateGroup {
  key: string;
  entries: FileEntry[];
  totalWastedBytes: number;
}

export interface StorageBreakdownItem {
  category: FileCategory;
  label: string;
  bytes: number;
}

export interface StorageOverview {
  totalBytes: number;
  freeBytes: number;
  usedByAppBytes: number;
  breakdown: StorageBreakdownItem[];
}
