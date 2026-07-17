import type { FileEntry, SortKey, SortOrder } from '@/types/file';

export function sortEntries(
  entries: FileEntry[],
  key: SortKey,
  order: SortOrder,
): FileEntry[] {
  const sorted = [...entries].sort((a, b) => {
    // Folders always float to the top, regardless of sort key.
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;

    let comparison = 0;
    switch (key) {
      case 'name':
        comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'date':
        comparison = a.modifiedAt - b.modifiedAt;
        break;
      case 'type':
        comparison = a.category.localeCompare(b.category);
        break;
    }
    return order === 'asc' ? comparison : -comparison;
  });
  return sorted;
}

export function filterBySearch(entries: FileEntry[], query: string): FileEntry[] {
  if (!query.trim()) return entries;
  const needle = query.trim().toLowerCase();
  return entries.filter((entry) => entry.name.toLowerCase().includes(needle));
}
