import * as ImagePicker from 'expo-image-picker';
import {
  SaveFormat,
  ImageManipulator,
  type ImageResult,
} from 'expo-image-manipulator';
import type { ImageAsset, ImageFormat } from '@/types/image';

const SAVE_FORMAT: Record<ImageFormat, SaveFormat> = {
  jpeg: SaveFormat.JPEG,
  png: SaveFormat.PNG,
  webp: SaveFormat.WEBP,
};

/**
 * Best-effort detection of an image's format from its URI extension, so
 * transform operations (resize/crop/rotate) can preserve it instead of
 * silently re-encoding everything as JPEG — which would flatten PNG
 * transparency to a solid background with no warning to the user.
 * Defaults to JPEG when the extension is missing or unrecognized (matches
 * the previous behavior for those cases).
 */
function detectFormat(uri: string): SaveFormat {
  const clean = uri.split('?')[0]?.toLowerCase() ?? '';
  if (clean.endsWith('.png')) return SaveFormat.PNG;
  if (clean.endsWith('.webp')) return SaveFormat.WEBP;
  return SaveFormat.JPEG;
}

function toImageAsset(result: ImageResult, fileName?: string): ImageAsset {
  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    fileName,
  };
}

/** Opens the system gallery picker for one or more images. */
export async function pickImages(multiple: boolean): Promise<ImageAsset[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return [];

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: multiple,
    quality: 1,
  });
  if (result.canceled) return [];
  return result.assets.map((asset) =>
    toImageAsset(
      { uri: asset.uri, width: asset.width, height: asset.height } as ImageResult,
      asset.fileName ?? undefined,
    ),
  );
}

/**
 * Compresses an image by re-encoding it at a lower quality.
 *
 * This intentionally always outputs JPEG: JPEG's lossy encoding is what
 * makes compression effective, and applying "quality" to a lossless format
 * like PNG would not shrink it. PNGs with transparency will lose their
 * alpha channel here — this is inherent to compressing into JPEG, not a
 * bug — so screens calling this should warn the user when the source is a
 * PNG, or offer convertImage(webp) as a transparency-preserving alternative.
 */
export async function compressImage(uri: string, quality: number): Promise<ImageAsset> {
  const context = ImageManipulator.manipulate(uri);
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({ compress: quality, format: SaveFormat.JPEG });
  return toImageAsset(result);
}

/** Resizes an image, preserving aspect ratio when only one dimension is given. */
export async function resizeImage(
  uri: string,
  width?: number,
  height?: number,
): Promise<ImageAsset> {
  const format = detectFormat(uri);
  const context = ImageManipulator.manipulate(uri).resize({ width, height });
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({ format, compress: format === SaveFormat.PNG ? 1 : 0.92 });
  return toImageAsset(result);
}

/** Crops an image to the given pixel rectangle. */
export async function cropImage(
  uri: string,
  crop: { originX: number; originY: number; width: number; height: number },
): Promise<ImageAsset> {
  const format = detectFormat(uri);
  const context = ImageManipulator.manipulate(uri).crop(crop);
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({ format, compress: format === SaveFormat.PNG ? 1 : 0.92 });
  return toImageAsset(result);
}

/** Rotates an image clockwise by the given number of degrees. */
export async function rotateImage(uri: string, degrees: number): Promise<ImageAsset> {
  const format = detectFormat(uri);
  const context = ImageManipulator.manipulate(uri).rotate(degrees);
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({ format, compress: format === SaveFormat.PNG ? 1 : 0.92 });
  return toImageAsset(result);
}

/** Re-encodes an image into a different container format. */
export async function convertImage(uri: string, format: ImageFormat): Promise<ImageAsset> {
  const context = ImageManipulator.manipulate(uri);
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({ format: SAVE_FORMAT[format], compress: 0.95 });
  return toImageAsset(result);
}

/** Applies rotation and/or crop together in a single pass, used by the shared editor. */
export async function applyImageEdits(
  uri: string,
  edits: { rotationDeg?: number; crop?: { originX: number; originY: number; width: number; height: number } },
): Promise<ImageAsset> {
  const format = detectFormat(uri);
  let context = ImageManipulator.manipulate(uri);
  if (edits.crop) context = context.crop(edits.crop);
  if (edits.rotationDeg) context = context.rotate(edits.rotationDeg);
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({ format, compress: format === SaveFormat.PNG ? 1 : 0.95 });
  return toImageAsset(result);
}
