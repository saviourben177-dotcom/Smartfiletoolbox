import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/primitives';
import { ToolResultFooter } from '@/components/ToolResultFooter';
import { useAsyncTask } from '@/hooks/useAsyncTask';
import { useColors } from '@/hooks/useColors';
import { useToast } from '@/context/ToastContext';
import { pickZip, listZipContents, extractZip, type ExtractZipResult } from '@/services/zipService';
import { importedDir } from '@/services/fileSystemService';
import { formatBytes } from '@/utils/formatBytes';
import type { PickedZipSource, ZipEntryInfo } from '@/types/zip';

export default function ZipExtractScreen() {
  const colors = useColors();
  const [zip, setZip] = useState<PickedZipSource | null>(null);
  const [entries, setEntries] = useState<ZipEntryInfo[]>([]);
  const contentsTask = useAsyncTask<ZipEntryInfo[]>();
  const extractTask = useAsyncTask<ExtractZipResult>();
  const toast = useToast();

  const handlePick = async () => {
    const picked = await pickZip();
    if (!picked) return;
    setZip(picked);
    const result = await contentsTask.run(() => listZipContents(picked.uri));
    if (result) setEntries(result);
  };

  const handleExtract = async () => {
    if (!zip) return;
    const destDir = `${importedDir()}${zip.name.replace(/\.zip$/i, '')}-extracted/`;
    const result = await extractTask.run(() => extractZip(zip.uri, destDir));
    if (result) {
      const { extractedCount, skippedUnsafeCount } = result;
      const base = `Extracted ${extractedCount} file${extractedCount === 1 ? '' : 's'} to My Files`;
      if (skippedUnsafeCount > 0) {
        toast.show(
          `${base}. Skipped ${skippedUnsafeCount} entr${skippedUnsafeCount === 1 ? 'y' : 'ies'} with an unsafe path.`,
          'error',
        );
      } else {
        toast.show(base, 'success');
      }
    }
  };

  return (
    <Screen scroll={false}>
      <FlatList
        data={entries}
        keyExtractor={(item, index) => `${item.path}-${index}`}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          !zip ? (
            <>
              <EmptyState icon="folder-minus" title="Pick a ZIP to browse" message="View and extract the contents of any ZIP archive." />
              <Button label="Choose ZIP" icon="archive" onPress={handlePick} />
            </>
          ) : (
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={[styles.name, { color: colors.cardForeground }]}>{zip.name}</Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {entries.filter((e) => !e.isDirectory).length} files
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Feather name={item.isDirectory ? 'folder' : 'file'} size={18} color={colors.mutedForeground} />
            <Text numberOfLines={1} style={[styles.rowName, { color: colors.cardForeground }]}>{item.name}</Text>
            {!item.isDirectory && item.size > 0 ? (
              <Text style={[styles.rowSize, { color: colors.mutedForeground }]}>{formatBytes(item.size)}</Text>
            ) : null}
          </View>
        )}
        ListFooterComponent={
          zip ? (
            <>
              <Button
                label="Extract All to My Files"
                icon="download"
                onPress={handleExtract}
                loading={extractTask.isProcessing}
                style={styles.spacer}
              />
              <Button label="Choose Another ZIP" variant="secondary" onPress={() => { setZip(null); setEntries([]); }} style={styles.spacer} />
              <ToolResultFooter status={extractTask.status} progress={extractTask.progress} errorMessage={extractTask.error} />
            </>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 8,
  },
  summaryCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 4,
    marginBottom: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  rowName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  rowSize: {
    fontSize: 12,
  },
  spacer: {
    marginTop: 8,
    marginBottom: 8,
  },
});
