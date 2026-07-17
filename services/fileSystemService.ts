import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { APP_DIR_NAMES } from '@/constants/storageKeys';
import { categoryFromName } from '@/constants/fileTypes';
import type { FileEntry } from '@/types/file';
import { generateId } from '@/utils/id';
import { withUniqueSuffix } from '@/utils/pathUtils';

/**
 * Manages the app's private working directories.
 *
 * Android's scoped storage model does not allow arbitrary filesystem
 * browsing outside the app sandbox without the Storage Access Framework.
 * Smart File Toolbox works around this by giving every tool a consistent
 * private workspace: files are imported in via the system document picker
 * (which grants access to any provider the user chooses, including other
 * apps and cloud drives), processed, and written to an Output folder that
 * can be shared or saved back to the device.
 */

function root(): string {
  return `${FileSystem.documentDirectory}${APP_DIR_NAMES.root}/`;
}

export function importedDir(): string {
  return `${root()}${APP_DIR_NAMES.imported}/`;
}

export function outputDir(): string {
  return `${root()}${APP_DIR_NAMES.output}/`;
}

export function tempDir(): string {
  return `${root()}${APP_DIR_NAMES.temp}/`;
}

/**
 * expo-file-system's directory APIs are not implemented on web (only
 * partial support per Expo docs). Smart File Toolbox targets Android/iOS
 * via Expo Go; on web these helpers degrade to safe no-ops/empty results
 * instead of crashing the Replit preview.
 */
function isWebUnsupported(): boolean {
  return Platform.OS === 'web';
}

/** Creates the app's working directories if they do not exist yet. */
export async function ensureAppDirectories(): Promise<void> {
  if (isWebUnsupported()) return;
  for (const dir of [root(), importedDir(), outputDir(), tempDir()]) {
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
  }
}

async function toEntry(uri: string, isDirectory: boolean): Promise<FileEntry> {
  const info = await FileSystem.getInfoAsync(uri);
  const name = decodeURIComponent(uri.replace(/\/+$/, '').split('/').pop() ?? uri);
  const size = !isDirectory && info.exists && 'size' in info ? info.size ?? 0 : 0;
  const modifiedAt =
    info.exists && 'modificationTime' in info && info.modificationTime
      ? info.modificationTime * 1000
      : Date.now();
  return {
    id: uri,
    name,
    uri,
    isDirectory,
    size,
    modifiedAt,
    category: categoryFromName(name, isDirectory),
    source: 'app',
  };
}

/** Lists the immediate contents of an app-private directory. */
export async function listDirectory(dirUri: string): Promise<FileEntry[]> {
  if (isWebUnsupported()) return [];
  const names = await FileSystem.readDirectoryAsync(dirUri);
  const entries = await Promise.all(
    names.map(async (name) => {
      const childUri = `${dirUri}${name}`;
      const info = await FileSystem.getInfoAsync(childUri);
      return toEntry(childUri, info.isDirectory);
    }),
  );
  return entries;
}

/** Recursively walks an app-private directory, returning only files. */
export async function listFilesRecursive(dirUri: string): Promise<FileEntry[]> {
  if (isWebUnsupported()) return [];
  const results: FileEntry[] = [];
  const names = await FileSystem.readDirectoryAsync(dirUri).catch(() => []);
  for (const name of names) {
    const childUri = `${dirUri}${name}`;
    const info = await FileSystem.getInfoAsync(childUri);
    if (info.isDirectory) {
      results.push(...(await listFilesRecursive(`${childUri}/`)));
    } else {
      results.push(await toEntry(childUri, false));
    }
  }
  return results;
}

/** Opens the system document picker and copies chosen files into Imported/. */
export async function importFilesFromDevice(options?: {
  multiple?: boolean;
  mimeTypes?: string[];
}): Promise<FileEntry[]> {
  if (isWebUnsupported()) return [];
  await ensureAppDirectories();
  const result = await DocumentPicker.getDocumentAsync({
    multiple: options?.multiple ?? true,
    type: options?.mimeTypes ?? '*/*',
    copyToCacheDirectory: true,
  });
  if (result.canceled) return [];

  const imported: FileEntry[] = [];
  for (const asset of result.assets) {
    const destUri = `${importedDir()}${withUniqueSuffix(asset.name)}`;
    await FileSystem.copyAsync({ from: asset.uri, to: destUri });
    imported.push(await toEntry(destUri, false));
  }
  return imported;
}

export async function deleteEntry(uri: string): Promise<void> {
  await FileSystem.deleteAsync(uri, { idempotent: true });
}

export async function renameEntry(uri: string, newName: string): Promise<string> {
  const parent = uri.slice(0, uri.lastIndexOf('/') + 1);
  // Segments read back out of a URI are decoded (see toEntry/basename), so
  // the name written back in must be encoded to round-trip correctly —
  // otherwise spaces or non-ASCII characters produce a URI that doesn't
  // match what getInfoAsync/readDirectoryAsync expect.
  const destUri = `${parent}${encodeURIComponent(newName)}`;
  await FileSystem.moveAsync({ from: uri, to: destUri });
  return destUri;
}

export async function createFolder(parentUri: string, name: string): Promise<string> {
  const dirUri = `${parentUri}${encodeURIComponent(name)}/`;
  await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
  return dirUri;
}

/** Writes a processed result into Output/ and returns its new entry. */
export async function saveToOutput(sourceUri: string, suggestedName: string): Promise<FileEntry> {
  await ensureAppDirectories();
  const destUri = `${outputDir()}${withUniqueSuffix(suggestedName)}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  return toEntry(destUri, false);
}

export function newTempUri(suggestedName: string): string {
  return `${tempDir()}${generateId()}-${encodeURIComponent(suggestedName)}`;
}

export async function readAsBase64(uri: string): Promise<string> {
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}

export async function writeBase64(uri: string, base64: string): Promise<void> {
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
}

export async function getFreeAndTotalDiskSpace(): Promise<{ free: number; total: number }> {
  if (isWebUnsupported()) return { free: 0, total: 0 };
  const [free, total] = await Promise.all([
    FileSystem.getFreeDiskStorageAsync(),
    Platform.OS === 'web' ? Promise.resolve(0) : FileSystem.getTotalDiskCapacityAsync(),
  ]);
  return { free, total };
}

export async function clearDirectoryContents(dirUri: string): Promise<number> {
  if (isWebUnsupported()) return 0;
  const entries = await listFilesRecursive(dirUri);
  let freedBytes = 0;
  for (const entry of entries) {
    freedBytes += entry.size;
  }
  await FileSystem.deleteAsync(dirUri, { idempotent: true });
  await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
  return freedBytes;
}

/** Finds folders (recursively, under an app directory) with zero files. */
export async function findEmptyFolders(dirUri: string): Promise<FileEntry[]> {
  if (isWebUnsupported()) return [];
  const empty: FileEntry[] = [];

  // A directory counts as "empty" for this feature if it contains no files
  // anywhere beneath it — i.e. it's nothing but empty structure and is safe
  // to delete. Returns whether `current` itself is empty in that sense, and
  // along the way records every empty directory found (including nested
  // ones, e.g. both A/B and A/B/C when C is a genuinely empty leaf and B
  // contains nothing but C). Every directory — including a literal
  // zero-entry leaf — goes through the same "am I empty, then push" check
  // at the bottom, so there's no special-cased early return that could
  // skip adding a genuinely empty directory to the results.
  async function walk(current: string): Promise<boolean> {
    const names = await FileSystem.readDirectoryAsync(current).catch(() => []);
    let allChildrenEmpty = true;
    for (const name of names) {
      const childUri = `${current}${name}`;
      const info = await FileSystem.getInfoAsync(childUri);
      if (info.isDirectory) {
        const childEmpty = await walk(`${childUri}/`);
        if (!childEmpty) allChildrenEmpty = false;
      } else {
        allChildrenEmpty = false;
      }
    }
    if (allChildrenEmpty) {
      empty.push(await toEntry(current.replace(/\/$/, ''), true));
    }
    return allChildrenEmpty;
  }

  const names = await FileSystem.readDirectoryAsync(dirUri).catch(() => []);
  for (const name of names) {
    const childUri = `${dirUri}${name}`;
    const info = await FileSystem.getInfoAsync(childUri).catch(() => null);
    if (info?.isDirectory) {
      await walk(`${childUri}/`);
    }
  }
  return empty;
}
