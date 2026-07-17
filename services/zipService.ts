import JSZip from 'jszip';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { newTempUri, readAsBase64, writeBase64, ensureAppDirectories } from '@/services/fileSystemService';
import { basename } from '@/utils/pathUtils';
import type { PickedZipSource, ZipEntryInfo } from '@/types/zip';

/** Opens the system document picker restricted to ZIP archives. */
export async function pickZip(): Promise<PickedZipSource | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/zip', 'application/x-zip-compressed'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || result.assets.length === 0) return null;
  const asset = result.assets[0]!;
  return { uri: asset.uri, name: asset.name };
}

/** Opens the system document picker for any files to include in a new archive. */
export async function pickFilesForZip(): Promise<PickedZipSource[]> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    multiple: true,
    copyToCacheDirectory: true,
  });
  if (result.canceled) return [];
  return result.assets.map((asset) => ({ uri: asset.uri, name: asset.name }));
}

/**
 * Creates a ZIP archive from the given files.
 *
 * Password protection is not implemented: this is exposed in the UI as a
 * disabled "coming soon" toggle because real ZIP encryption needs a native
 * crypto-capable zip implementation, which is out of scope for the
 * Expo-Go-compatible JS-only zip engine used here.
 */
export async function createZip(files: PickedZipSource[], zipName: string): Promise<string> {
  const zip = new JSZip();
  for (const file of files) {
    const base64 = await readAsBase64(file.uri);
    zip.file(file.name, base64, { base64: true });
  }
  const outputBase64 = await zip.generateAsync({ type: 'base64' });
  const outUri = newTempUri(zipName.endsWith('.zip') ? zipName : `${zipName}.zip`);
  await writeBase64(outUri, outputBase64);
  return outUri;
}

/** Lists the contents of a ZIP archive without extracting it. */
export async function listZipContents(zipUri: string): Promise<ZipEntryInfo[]> {
  const base64 = await readAsBase64(zipUri);
  const zip = await JSZip.loadAsync(base64, { base64: true });
  const entries: ZipEntryInfo[] = [];
  zip.forEach((relativePath, file) => {
    entries.push({
      path: relativePath,
      name: basename(relativePath),
      isDirectory: file.dir,
      size: (file as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize ?? 0,
    });
  });
  return entries;
}

/**
 * Resolves a ZIP entry's internal path to a safe relative path under the
 * extraction root, or returns null if the entry tries to escape it.
 *
 * ZIP archives are untrusted input — a malicious entry name like
 * "../../../etc/evil" or an absolute path ("/etc/evil") is a classic
 * "zip-slip" attack that can write files outside the intended destination
 * directory (potentially into the app's private storage or elsewhere).
 * Every segment is normalized and any entry that resolves outside the
 * destination root is rejected rather than written.
 */
function safeRelativeZipPath(entryName: string): string | null {
  // Normalize backslashes (Windows-authored zips) and strip a leading slash
  // (an absolute path within the archive).
  const normalized = entryName.replace(/\\/g, '/').replace(/^\/+/, '');
  const segments = normalized.split('/').filter((segment) => segment.length > 0 && segment !== '.');

  const resolved: string[] = [];
  for (const segment of segments) {
    if (segment === '..') {
      if (resolved.length === 0) return null; // Attempts to climb above the root.
      resolved.pop();
    } else {
      resolved.push(segment);
    }
  }
  if (resolved.length === 0) return null;
  // Encode each segment individually (not the joined path) so the '/'
  // separators are preserved while names with spaces or special characters
  // still produce a valid file:// URI.
  return resolved.map(encodeURIComponent).join('/');
}

export interface ExtractZipResult {
  extractedCount: number;
  /** Entries skipped because their path tried to escape the destination directory. */
  skippedUnsafeCount: number;
}

/** Extracts every entry in a ZIP archive into the given destination directory. */
export async function extractZip(zipUri: string, destDirUri: string): Promise<ExtractZipResult> {
  await ensureAppDirectories();
  await FileSystem.makeDirectoryAsync(destDirUri, { intermediates: true });
  const base64 = await readAsBase64(zipUri);
  const zip = await JSZip.loadAsync(base64, { base64: true });

  let extractedCount = 0;
  let skippedUnsafeCount = 0;
  const entries = Object.values(zip.files);
  for (const file of entries) {
    if (file.dir) continue;
    const safePath = safeRelativeZipPath(file.name);
    if (!safePath) {
      skippedUnsafeCount += 1;
      continue;
    }
    const destUri = `${destDirUri}${safePath}`;
    const parentDir = destUri.slice(0, destUri.lastIndexOf('/') + 1);
    await FileSystem.makeDirectoryAsync(parentDir, { intermediates: true }).catch(() => undefined);
    const content = await file.async('base64');
    await writeBase64(destUri, content);
    extractedCount += 1;
  }
  return { extractedCount, skippedUnsafeCount };
}
