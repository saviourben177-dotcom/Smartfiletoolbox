import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { useColors } from '@/hooks/useColors';
import { useFileBrowser } from '@/hooks/useFileBrowser';
import { usePermission } from '@/hooks/usePermission';
import { getMediaLibraryPermission, requestMediaLibraryPermission } from '@/services/permissionsService';
import { importFilesFromDevice, deleteEntry } from '@/services/fileSystemService';
import { PermissionGate } from '@/components/PermissionGate';
import { FileListItem } from '@/components/FileListItem';
import { EmptyState, Chip } from '@/components/ui/primitives';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import type { FileEntry } from '@/types/file';

export default function FilesScreen() {
  const colors = useColors();
  const toast = useToast();
  const confirm = useConfirm();
  const browser = useFileBrowser();
  const mediaPermission = usePermission(getMediaLibraryPermission, requestMediaLibraryPermission);
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    setImporting(true);
    try {
      const imported = await importFilesFromDevice({ multiple: true });
      if (imported.length > 0) {
        toast.show(`Imported ${imported.length} file${imported.length > 1 ? 's' : ''}`, 'success');
        browser.refresh();
      }
    } catch {
      toast.show('Import failed', 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (entry: FileEntry) => {
    const ok = await confirm({
      title: `Delete "${entry.name}"?`,
      message: 'This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    await deleteEntry(entry.uri);
    toast.show('Deleted', 'success');
    browser.refresh();
  };

  const handleShare = async (entry: FileEntry) => {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      toast.show('Sharing is not available on this device', 'error');
      return;
    }
    await Sharing.shareAsync(entry.uri);
  };

  const content = (
    <FlatList
      data={browser.entries}
      key={browser.viewMode}
      keyExtractor={(item) => item.id}
      numColumns={browser.viewMode === 'grid' ? 3 : 1}
      columnWrapperStyle={browser.viewMode === 'grid' ? styles.gridRow : undefined}
      contentContainerStyle={styles.listContent}
      refreshing={browser.loading}
      onRefresh={browser.refresh}
      ListEmptyComponent={
        !browser.loading ? (
          <EmptyState
            icon="folder"
            title="No files here yet"
            message={
              browser.source === 'my-files'
                ? 'Import files or run a tool to see results here.'
                : 'No photos or videos found on this device.'
            }
          />
        ) : null
      }
      renderItem={({ item }) => (
        <FileListItem
          entry={item}
          mode={browser.viewMode}
          onPress={() => (item.source === 'app' ? handleShare(item) : undefined)}
          onLongPress={() => (item.source === 'app' ? handleDelete(item) : undefined)}
        />
      )}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.foreground }]}>Files</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => browser.setViewMode(browser.viewMode === 'list' ? 'grid' : 'list')}
            style={[styles.iconButton, { backgroundColor: colors.secondary }]}
          >
            <Feather name={browser.viewMode === 'list' ? 'grid' : 'list'} size={18} color={colors.secondaryForeground} />
          </Pressable>
          <Pressable
            onPress={handleImport}
            disabled={importing}
            style={[styles.iconButton, { backgroundColor: colors.primary }]}
          >
            {importing ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <Feather name="upload" size={18} color={colors.primaryForeground} />
            )}
          </Pressable>
        </View>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          value={browser.search}
          onChangeText={browser.setSearch}
          placeholder="Search files"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground }]}
        />
      </View>

      <View style={styles.chipRow}>
        <Chip label="My Files" active={browser.source === 'my-files'} onPress={() => browser.setSource('my-files')} />
        <Chip label="Photos" active={browser.source === 'photos'} onPress={() => browser.setSource('photos')} />
      </View>

      {browser.source === 'photos' ? (
        <PermissionGate
          status={mediaPermission.status}
          onRequest={mediaPermission.request}
          title="Photo access needed"
          message="Allow access to your photo library to browse images and videos here."
        >
          {content}
        </PermissionGate>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 40,
  },
  gridRow: {
    gap: 8,
  },
});
