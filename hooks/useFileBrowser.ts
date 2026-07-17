import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  importedDir,
  outputDir,
  ensureAppDirectories,
  listDirectory,
} from '@/services/fileSystemService';
import { listMediaAssets } from '@/services/mediaLibraryService';
import { sortEntries, filterBySearch } from '@/utils/sorting';
import type { FileEntry, SortKey, SortOrder, ViewMode } from '@/types/file';

export type BrowserSource = 'my-files' | 'photos';

export function useFileBrowser() {
  const [source, setSource] = useState<BrowserSource>('my-files');
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (source === 'my-files') {
        await ensureAppDirectories();
        const [imported, output] = await Promise.all([
          listDirectory(importedDir()),
          listDirectory(outputDir()),
        ]);
        setEntries([...imported, ...output]);
      } else {
        setEntries(await listMediaAssets(200));
      }
    } finally {
      setLoading(false);
    }
  }, [source]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleEntries = useMemo(
    () => sortEntries(filterBySearch(entries, search), sortKey, sortOrder),
    [entries, search, sortKey, sortOrder],
  );

  return {
    source,
    setSource,
    entries: visibleEntries,
    loading,
    refresh: load,
    search,
    setSearch,
    sortKey,
    setSortKey,
    sortOrder,
    setSortOrder,
    viewMode,
    setViewMode,
  };
}
