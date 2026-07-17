import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import type { FileEntry } from '@/types/file';

function assetToEntry(asset: MediaLibrary.Asset): FileEntry {
  return {
    id: asset.id,
    name: asset.filename,
    uri: asset.uri,
    isDirectory: false,
    size: 0, // Populated lazily via getAssetInfoAsync where needed.
    modifiedAt: asset.modificationTime,
    category: asset.mediaType === 'video' ? 'video' : 'image',
    source: 'media',
    assetId: asset.id,
  };
}

/**
 * Lists recent photo/video assets from the device media library.
 *
 * getAssetsAsync enforces the read permission and rejects outright if it
 * hasn't been granted yet (it does not implicitly prompt or return an
 * empty page) — so on a fresh install, any screen that calls this before
 * permission has been requested would otherwise throw during its initial
 * data load. This checks the current permission first and degrades to an
 * empty list rather than surfacing that as an unhandled screen crash;
 * screens that want to prompt for access should do so explicitly via
 * usePermission + requestMediaLibraryPermission.
 */
export async function listMediaAssets(pageSize = 100): Promise<FileEntry[]> {
  if (Platform.OS === 'web') return [];
  const permission = await MediaLibrary.getPermissionsAsync();
  if (!permission.granted) return [];
  const page = await MediaLibrary.getAssetsAsync({
    first: pageSize,
    sortBy: [MediaLibrary.SortBy.creationTime],
    mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
  });
  return page.assets.map(assetToEntry);
}

/** Resolves the real file size (in bytes) for a media asset, when available. */
export async function getAssetSize(assetId: string): Promise<number> {
  try {
    const info = await MediaLibrary.getAssetInfoAsync(assetId);
    const uri = info.localUri ?? info.uri;
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.exists && 'size' in fileInfo ? fileInfo.size ?? 0 : 0;
  } catch {
    return 0;
  }
}

/**
 * Saves a file to the device's photo library, requesting write permission
 * first if it hasn't been granted yet.
 *
 * MediaLibrary.saveToLibraryAsync does not implicitly request permission —
 * calling it without a prior grant throws (or silently no-ops depending on
 * platform), so callers that swallow errors here would otherwise report a
 * false "saved to Photos" success. Returns whether the save actually
 * happened so callers can show an accurate result to the user.
 */
export async function saveImageToLibrary(uri: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const existing = await MediaLibrary.getPermissionsAsync(true);
  const permission = existing.granted
    ? existing
    : await MediaLibrary.requestPermissionsAsync(true);
  if (!permission.granted) return false;
  await MediaLibrary.saveToLibraryAsync(uri);
  return true;
}

/**
 * Deletes one or more media-library assets (photos/videos).
 *
 * On Android this prompts the system's "Allow app to delete these items?"
 * confirmation — MediaLibrary.deleteAssetsAsync's return value reflects
 * whether the user actually confirmed, so callers must check it rather
 * than assume success just because the call didn't throw.
 */
export async function deleteMediaAssets(assetIds: string[]): Promise<boolean> {
  if (Platform.OS === 'web' || assetIds.length === 0) return false;
  return MediaLibrary.deleteAssetsAsync(assetIds);
}
