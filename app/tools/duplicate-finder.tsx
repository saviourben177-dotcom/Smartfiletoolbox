import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { EmptyState, Skeleton } from '@/components/ui/primitives';
import { FileListItem } from '@/components/FileListItem';
import { useColors } from '@/hooks/useColors';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { findDuplicateFiles } from '@/services/storageAnalysisService';
import { deleteEntry } from '@/services/fileSystemService';
import { deleteMediaAssets } from '@/services/mediaLibraryService';
import { usePermission } from '@/hooks/usePermission';
import { getMediaLibraryPermission, requestMediaLibraryPermission } from '@/services/permissionsService';
import { formatBytes } from '@/utils/formatBytes';
import type { DuplicateGroup } from '@/types/file';

export default function DuplicateFinderScreen() {
  const colors = useColors();
  const toast = useToast();
  const confirm = useConfirm();
  const mediaPermission = usePermission(getMediaLibraryPermission, requestMediaLibraryPermission);
  const [groups, setGroups] = useState<DuplicateGroup[] | null>(null);

  const load = useCallback(async () => {
    setGroups(await findDuplicateFiles());
  }, []);

  useEffect(() => {
    // Duplicate scanning includes the photo library, so it waits for the
    // initial permission check ('checking') before loading — this avoids a
    // flash of "no duplicates" before we actually know if photo access is
    // available. Once resolved (granted or denied), load regardless: an
    // app-sandbox-only scan is still useful if photo access is declined.
    if (mediaPermission.status !== 'checking') {
      load();
    }
  }, [load, mediaPermission.status]);

  const handleDeleteExtras = async (group: DuplicateGroup) => {
    const extras = group.entries.slice(1);
    const ok = await confirm({
      title: `Delete ${extras.length} duplicate${extras.length > 1 ? 's' : ''}?`,
      message: 'Keeps the first copy and removes the rest. This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;

    let deletedCount = 0;
    let failedCount = 0;

    for (const entry of extras) {
      if (entry.source !== 'app') continue;
      try {
        await deleteEntry(entry.uri);
        deletedCount += 1;
      } catch {
        failedCount += 1;
      }
    }

    const mediaAssetIds = extras
      .filter((entry) => entry.source === 'media' && entry.assetId)
      .map((entry) => entry.assetId as string);
    if (mediaAssetIds.length > 0) {
      // The system delete dialog covers all requested assets in one prompt;
      // if the user declines it, none of them are removed.
      const confirmed = await deleteMediaAssets(mediaAssetIds);
      if (confirmed) {
        deletedCount += mediaAssetIds.length;
      } else {
        failedCount += mediaAssetIds.length;
      }
    }

    if (deletedCount > 0 && failedCount === 0) {
      toast.show(`Deleted ${deletedCount} duplicate${deletedCount === 1 ? '' : 's'}`, 'success');
    } else if (deletedCount > 0 && failedCount > 0) {
      toast.show(`Deleted ${deletedCount}, but ${failedCount} couldn't be removed`, 'error');
    } else {
      toast.show("Couldn't delete duplicates", 'error');
    }
    load();
  };

  return (
    <Screen scroll={false}>
      {groups === null ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(item) => String(item)}
          contentContainerStyle={styles.list}
          renderItem={() => <Skeleton height={100} radius={16} />}
        />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.list}
          onRefresh={load}
          refreshing={false}
          ListHeaderComponent={
            mediaPermission.status === 'denied' ? (
              <View style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
                <Text style={[styles.bannerText, { color: colors.mutedForeground }]}>
                  Photo access isn't granted, so this only checks imported files and tool output — not your photo library.
                </Text>
                <Button label="Grant Photo Access" icon="unlock" variant="secondary" onPress={mediaPermission.request} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState icon="copy" title="No duplicates found" message="Smart File Toolbox checks imported files, tool output and your photos." />
          }
          renderItem={({ item }) => (
            <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={[styles.groupTitle, { color: colors.cardForeground }]}>{item.entries[0]?.name}</Text>
              <Text style={[styles.groupMeta, { color: colors.mutedForeground }]}>
                {item.entries.length} copies · wastes {formatBytes(item.totalWastedBytes)}
              </Text>
              {item.entries.map((entry) => (
                <FileListItem key={entry.id} entry={entry} />
              ))}
              <Button label="Delete Duplicates" icon="trash-2" variant="destructive" onPress={() => handleDeleteExtras(item)} />
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 10,
    marginBottom: 8,
  },
  bannerText: {
    fontSize: 13,
    lineHeight: 18,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  group: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 8,
    marginBottom: 4,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  groupMeta: {
    fontSize: 12,
  },
});
