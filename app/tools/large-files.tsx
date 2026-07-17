import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { FileListItem } from '@/components/FileListItem';
import { EmptyState, Skeleton } from '@/components/ui/primitives';
import { useColors } from '@/hooks/useColors';
import { usePermission } from '@/hooks/usePermission';
import { getMediaLibraryPermission, requestMediaLibraryPermission } from '@/services/permissionsService';
import { findLargestFiles } from '@/services/storageAnalysisService';
import type { FileEntry } from '@/types/file';

export default function LargeFilesScreen() {
  const colors = useColors();
  const mediaPermission = usePermission(getMediaLibraryPermission, requestMediaLibraryPermission);
  const [files, setFiles] = useState<FileEntry[] | null>(null);

  const load = useCallback(async () => {
    setFiles(await findLargestFiles(50));
  }, []);

  useEffect(() => {
    // Same reasoning as duplicate-finder: wait for the initial permission
    // check before loading so we don't flash an empty result, but load
    // regardless of the outcome — an app-sandbox-only scan is still useful.
    if (mediaPermission.status !== 'checking') {
      load();
    }
  }, [load, mediaPermission.status]);

  return (
    <Screen scroll={false}>
      {files === null ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(item) => String(item)}
          contentContainerStyle={styles.list}
          renderItem={() => <Skeleton height={64} radius={16} />}
        />
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
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
            <EmptyState icon="hard-drive" title="Nothing found yet" message="Import files or take photos to see your largest files here." />
          }
          renderItem={({ item }) => <FileListItem entry={item} />}
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
});
