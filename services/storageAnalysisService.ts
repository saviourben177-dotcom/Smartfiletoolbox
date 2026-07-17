import {
  importedDir,
  outputDir,
  tempDir,
  listFilesRecursive,
  findEmptyFolders as findEmptyFoldersInDir,
  clearDirectoryContents,
  getFreeAndTotalDiskSpace,
  ensureAppDirectories,
} from '@/services/fileSystemService';
import { listMediaAssets, getAssetSize } from '@/services/mediaLibraryService';
import type { DuplicateGroup, FileEntry, StorageBreakdownItem, StorageOverview } from '@/types/file';

/** Returns all files Smart File Toolbox can see: app-sandbox files + device media. */
export async function getAllKnownFiles(): Promise<FileEntry[]> {
  await ensureAppDirectories();
  const [imported, output, media] = await Promise.all([
    listFilesRecursive(importedDir()),
    listFilesRecursive(outputDir()),
    listMediaAssets(200),
  ]);
  return [...imported, ...output, ...media];
}

/** Builds a device storage summary plus a breakdown by file category. */
export async function getStorageOverview(): Promise<StorageOverview> {
  const [{ free, total }, files] = await Promise.all([
    getFreeAndTotalDiskSpace(),
    getAllKnownFiles(),
  ]);

  // Media asset sizes are not returned by the fast listing call; resolve
  // them lazily (capped) so the overview stays responsive.
  const sized = await Promise.all(
    files.map(async (entry) => {
      if (entry.source === 'media' && entry.size === 0 && entry.assetId) {
        const size = await getAssetSize(entry.assetId);
        return { ...entry, size };
      }
      return entry;
    }),
  );

  const totals = new Map<string, number>();
  let usedByApp = 0;
  for (const entry of sized) {
    totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.size);
    if (entry.source !== 'media') usedByApp += entry.size;
  }

  const breakdown: StorageBreakdownItem[] = Array.from(totals.entries())
    .map(([category, bytes]) => ({ category: category as FileEntry['category'], label: category, bytes }))
    .sort((a, b) => b.bytes - a.bytes);

  return { totalBytes: total, freeBytes: free, usedByAppBytes: usedByApp, breakdown };
}

/** Returns files sorted largest-first, limited to a reasonable page size. */
export async function findLargestFiles(limit = 50): Promise<FileEntry[]> {
  const files = await getAllKnownFiles();
  const sized = await Promise.all(
    files.map(async (entry) => {
      if (entry.source === 'media' && entry.size === 0 && entry.assetId) {
        return { ...entry, size: await getAssetSize(entry.assetId) };
      }
      return entry;
    }),
  );
  return sized.sort((a, b) => b.size - a.size).slice(0, limit);
}

/** Groups files with matching name + size — a practical duplicate signal without hashing every byte. */
export async function findDuplicateFiles(): Promise<DuplicateGroup[]> {
  const files = await getAllKnownFiles();
  const groups = new Map<string, FileEntry[]>();
  for (const entry of files) {
    if (entry.isDirectory) continue;
    const key = `${entry.name.toLowerCase()}::${entry.size}`;
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }

  return Array.from(groups.entries())
    .filter(([, entries]) => entries.length > 1)
    .map(([key, entries]) => ({
      key,
      entries,
      totalWastedBytes: entries[0]!.size * (entries.length - 1),
    }))
    .sort((a, b) => b.totalWastedBytes - a.totalWastedBytes);
}

export async function findEmptyFolders(): Promise<FileEntry[]> {
  const [imported, output] = await Promise.all([
    findEmptyFoldersInDir(importedDir()),
    findEmptyFoldersInDir(outputDir()),
  ]);
  return [...imported, ...output];
}

/** Clears the app's temp scratch space, freeing whatever was buffered there. */
export async function clearTempFiles(): Promise<number> {
  return clearDirectoryContents(tempDir());
}
