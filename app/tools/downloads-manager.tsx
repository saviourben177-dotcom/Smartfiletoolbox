import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Screen } from '@/components/Screen';
import { FileListItem } from '@/components/FileListItem';
import { EmptyState, Skeleton } from '@/components/ui/primitives';
import { useConfirm } from '@/context/ConfirmContext';
import { useToast } from '@/context/ToastContext';
import { importedDir, outputDir, listDirectory, deleteEntry, ensureAppDirectories } from '@/services/fileSystemService';
import type { FileEntry } from '@/types/file';

export default function DownloadsManagerScreen() {
  const [entries, setEntries] = useState<FileEntry[] | null>(null);
  const confirm = useConfirm();
  const toast = useToast();

  const load = useCallback(async () => {
    await ensureAppDirectories();
    const [imported, output] = await Promise.all([listDirectory(importedDir()), listDirectory(outputDir())]);
    setEntries([...imported, ...output].sort((a, b) => b.modifiedAt - a.modifiedAt));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleShare = async (entry: FileEntry) => {
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(entry.uri);
  };

  const handleDelete = async (entry: FileEntry) => {
    const ok = await confirm({ title: `Delete "${entry.name}"?`, confirmLabel: 'Delete', destructive: true });
    if (!ok) return;
    await deleteEntry(entry.uri);
    toast.show('Deleted', 'success');
    load();
  };

  return (
    <Screen scroll={false}>
      {entries === null ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(item) => String(item)}
          contentContainerStyle={styles.list}
          renderItem={() => <Skeleton height={64} radius={16} />}
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={load}
          refreshing={false}
          ListEmptyComponent={
            <EmptyState icon="download" title="Nothing imported or saved yet" message="Files you import or that tools produce will show up here." />
          }
          renderItem={({ item }) => (
            <FileListItem entry={item} onPress={() => handleShare(item)} onLongPress={() => handleDelete(item)} />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 8,
  },
});
