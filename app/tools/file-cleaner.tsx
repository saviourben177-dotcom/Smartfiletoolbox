import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/primitives';
import { useColors } from '@/hooks/useColors';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { clearTempFiles, findEmptyFolders } from '@/services/storageAnalysisService';
import { deleteEntry } from '@/services/fileSystemService';
import { formatBytes } from '@/utils/formatBytes';
import type { FileEntry } from '@/types/file';

export default function FileCleanerScreen() {
  const colors = useColors();
  const toast = useToast();
  const confirm = useConfirm();
  const [emptyFolders, setEmptyFolders] = useState<FileEntry[] | null>(null);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    setEmptyFolders(await findEmptyFolders());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleClearTemp = async () => {
    setClearing(true);
    try {
      const freed = await clearTempFiles();
      toast.show(freed > 0 ? `Freed ${formatBytes(freed)}` : 'Temp folder was already empty', 'success');
    } finally {
      setClearing(false);
    }
  };

  const handleClearFolders = async () => {
    if (!emptyFolders || emptyFolders.length === 0) return;
    const ok = await confirm({
      title: `Remove ${emptyFolders.length} empty folder${emptyFolders.length > 1 ? 's' : ''}?`,
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (!ok) return;

    let removed = 0;
    let failed = 0;
    for (const folder of emptyFolders) {
      try {
        await deleteEntry(folder.uri);
        removed += 1;
      } catch {
        failed += 1;
      }
    }

    if (failed === 0) {
      toast.show('Empty folders removed', 'success');
    } else if (removed > 0) {
      toast.show(`Removed ${removed}, but ${failed} couldn't be removed`, 'error');
    } else {
      toast.show("Couldn't remove empty folders", 'error');
    }
    load();
  };

  return (
    <Screen>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.title, { color: colors.cardForeground }]}>Temporary files</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Scratch files created while running tools (previews, intermediate results).
        </Text>
        <Button label="Clear Temp Files" icon="trash-2" onPress={handleClearTemp} loading={clearing} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.title, { color: colors.cardForeground }]}>Empty folders</Text>
        {emptyFolders === null ? (
          <Skeleton height={20} width="60%" />
        ) : (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {emptyFolders.length === 0
              ? 'No empty folders found in your imported and output files.'
              : `Found ${emptyFolders.length} empty folder${emptyFolders.length > 1 ? 's' : ''}.`}
          </Text>
        )}
        {emptyFolders && emptyFolders.length > 0 ? (
          <Button label="Remove Empty Folders" icon="folder-minus" variant="destructive" onPress={handleClearFolders} />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
