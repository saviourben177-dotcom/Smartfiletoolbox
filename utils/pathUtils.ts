export function basename(uri: string): string {
  const clean = uri.split('?')[0]?.replace(/\/+$/, '') ?? uri;
  const segments = clean.split('/');
  return decodeURIComponent(segments[segments.length - 1] ?? clean);
}

export function stripExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx <= 0 ? name : name.slice(0, idx);
}

export function joinPath(...segments: string[]): string {
  return segments
    .map((segment, i) => (i === 0 ? segment.replace(/\/+$/, '') : segment.replace(/^\/+|\/+$/g, '')))
    .filter(Boolean)
    .join('/');
}

/**
 * Appends a timestamp suffix to keep filenames unique, and percent-encodes
 * the result so it can be safely embedded in a file:// URI (matches how
 * names are decoded back out via decodeURIComponent elsewhere in this file).
 */
export function withUniqueSuffix(name: string): string {
  const ext = name.includes('.') ? `.${name.split('.').pop()}` : '';
  const base = ext ? stripExtension(name) : name;
  return encodeURIComponent(`${base}-${Date.now()}${ext}`);
}
