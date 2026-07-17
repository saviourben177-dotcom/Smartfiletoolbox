import type { FeatherIconName } from '@/types/tools';
import type { FileCategory } from '@/types/file';

const EXTENSION_CATEGORY: Record<string, FileCategory> = {
  jpg: 'image', jpeg: 'image', png: 'image', webp: 'image', gif: 'image', heic: 'image', bmp: 'image',
  mp4: 'video', mov: 'video', mkv: 'video', avi: 'video', webm: 'video',
  mp3: 'audio', wav: 'audio', m4a: 'audio', aac: 'audio', ogg: 'audio',
  pdf: 'pdf',
  zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive',
  doc: 'document', docx: 'document', txt: 'document', rtf: 'document',
  xls: 'document', xlsx: 'document', ppt: 'document', pptx: 'document', csv: 'document',
};

const CATEGORY_ICON: Record<FileCategory, FeatherIconName> = {
  image: 'image',
  video: 'film',
  audio: 'music',
  pdf: 'file-text',
  archive: 'archive',
  document: 'file',
  folder: 'folder',
  other: 'file',
};

const CATEGORY_LABEL: Record<FileCategory, string> = {
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  pdf: 'PDF',
  archive: 'Archive',
  document: 'Document',
  folder: 'Folder',
  other: 'File',
};

export function getExtension(name: string): string {
  const parts = name.split('.');
  if (parts.length < 2) return '';
  return (parts.pop() ?? '').toLowerCase();
}

export function categoryFromName(name: string, isDirectory: boolean): FileCategory {
  if (isDirectory) return 'folder';
  const ext = getExtension(name);
  return EXTENSION_CATEGORY[ext] ?? 'other';
}

export function iconForCategory(category: FileCategory): FeatherIconName {
  return CATEGORY_ICON[category];
}

export function labelForCategory(category: FileCategory): string {
  return CATEGORY_LABEL[category];
}
