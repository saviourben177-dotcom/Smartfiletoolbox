import * as DocumentPicker from 'expo-document-picker';
import { PDFDocument } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import { newTempUri, readAsBase64, writeBase64 } from '@/services/fileSystemService';
import type { PdfDocumentRef, PdfPageRange } from '@/types/pdf';
import { basename } from '@/utils/pathUtils';
import { base64ToUint8Array, uint8ArrayToBase64 } from '@/utils/binary';

async function loadPdfBytes(uri: string): Promise<Uint8Array> {
  const base64 = await readAsBase64(uri);
  return base64ToUint8Array(base64);
}

async function savePdfBytes(bytes: Uint8Array, suggestedName: string): Promise<string> {
  const uri = newTempUri(suggestedName);
  await writeBase64(uri, uint8ArrayToBase64(bytes));
  return uri;
}

/** Opens the system document picker restricted to PDF files. */
export async function pickPdfs(multiple: boolean): Promise<PdfDocumentRef[]> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    multiple,
    copyToCacheDirectory: true,
  });
  if (result.canceled) return [];

  const refs: PdfDocumentRef[] = [];
  for (const asset of result.assets) {
    const info = await FileSystem.getInfoAsync(asset.uri);
    const bytes = await loadPdfBytes(asset.uri);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    refs.push({
      uri: asset.uri,
      name: asset.name,
      pageCount: doc.getPageCount(),
      size: info.exists && 'size' in info ? info.size ?? 0 : 0,
    });
  }
  return refs;
}

export async function getPdfInfo(uri: string, name?: string): Promise<PdfDocumentRef> {
  const bytes = await loadPdfBytes(uri);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const info = await FileSystem.getInfoAsync(uri);
  return {
    uri,
    name: name ?? basename(uri),
    pageCount: doc.getPageCount(),
    size: info.exists && 'size' in info ? info.size ?? 0 : 0,
  };
}

/** Merges PDFs in the given order into a single new PDF. */
export async function mergePdfs(uris: string[]): Promise<string> {
  const merged = await PDFDocument.create();
  for (const uri of uris) {
    const bytes = await loadPdfBytes(uri);
    const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  const bytes = await merged.save();
  return savePdfBytes(bytes, 'merged.pdf');
}

/** Extracts one or more page ranges from a PDF into a single new PDF (1-indexed, inclusive). */
export async function splitPdf(uri: string, ranges: PdfPageRange[]): Promise<string> {
  const bytes = await loadPdfBytes(uri);
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const output = await PDFDocument.create();

  const indices: number[] = [];
  for (const range of ranges) {
    const from = Math.max(1, Math.min(range.from, source.getPageCount()));
    const to = Math.max(from, Math.min(range.to, source.getPageCount()));
    for (let page = from; page <= to; page += 1) indices.push(page - 1);
  }

  const pages = await output.copyPages(source, indices);
  pages.forEach((page) => output.addPage(page));
  const outBytes = await output.save();
  return savePdfBytes(outBytes, 'split.pdf');
}

/**
 * Optimizes a PDF's internal structure (object streams, unused object
 * pruning) to reduce file size. Because pdf-lib does not re-encode embedded
 * images, savings vary by document — this is a lossless structural
 * optimization rather than an aggressive image recompression pass.
 */
export async function compressPdf(uri: string): Promise<{ uri: string; originalSize: number; newSize: number }> {
  const bytes = await loadPdfBytes(uri);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  const outBytes = await doc.save({ useObjectStreams: true });
  const outUri = await savePdfBytes(outBytes, 'compressed.pdf');
  return { uri: outUri, originalSize: bytes.byteLength, newSize: outBytes.byteLength };
}

/**
 * Detects whether image bytes are PNG or JPEG by their magic-number header,
 * rather than trusting the source filename's extension. Gallery picker
 * assets (especially on Android) frequently have missing, generic, or
 * simply wrong extensions relative to their actual encoding — trusting the
 * extension caused embedPng/embedJpg to throw or embed corrupted image data.
 */
function isPngBytes(bytes: Uint8Array): boolean {
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  return (
    bytes.length > 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  );
}

/** Builds a new PDF with one full-page image per page. */
export async function imagesToPdf(imageUris: string[]): Promise<string> {
  const doc = await PDFDocument.create();
  for (const uri of imageUris) {
    const base64 = await readAsBase64(uri);
    const bytes = base64ToUint8Array(base64);
    let image;
    try {
      image = isPngBytes(bytes) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    } catch {
      throw new Error(
        `${basename(uri)} isn't a JPEG or PNG image. Convert it to JPEG or PNG first, then try again.`,
      );
    }
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  const bytes = await doc.save();
  return savePdfBytes(bytes, 'images.pdf');
}
