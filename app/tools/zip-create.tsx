import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Feather } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/primitives';
import { ToolResultFooter } from '@/components/ToolResultFooter';
import { PickedFileRow } from '@/components/PickedFileRow';
import { useAsyncTask } from '@/hooks/useAsyncTask';
import { useColors } from '@/hooks/useColors';
import { useToast } from '@/context/ToastContext';
import { pickFilesForZip, createZip } from '@/services/zipService';
import { saveToOutput } from '@/services/fileSystemService';
import type { PickedZipSource } from '@/types/zip';

export default function ZipCreateScreen() {
  const colors = useColors();
  const [files, setFiles] = useState<PickedZipSource[]>([]);
  const [zipName, setZipName] = useState('archive');
  const task = useAsyncTask<string>();
  const toast = useToast();

  const handlePick = async () => {
    const picked = await pickFilesForZip();
    if (picked.length > 0) setFiles((prev) => [...prev, ...picked]);
  };

  const handleCreate = () => {
    task.run(() => createZip(files, zipName || 'archive'));
  };

  const handleSave = async () => {
    if (!task.result) return;
    await saveToOutput(task.result, `${zipName || 'archive'}.zip`);
    toast.show('Saved to Output', 'success');
  };

  const handleShare = async () => {
    if (!task.result) return;
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(task.result);
  };

  return (
    <Screen scroll={false}>
      <FlatList
        data={files}
        keyExtractor={(item, index) => `${item.uri}-${index}`}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={[styles.label, { color: colors.cardForeground }]}>Archive name</Text>
              <View style={styles.nameRow}>
                <TextInput
                  value={zipName}
                  onChangeText={setZipName}
                  placeholder="archive"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                />
                <Text style={{ color: colors.mutedForeground }}>.zip</Text>
              </View>
              <View style={styles.passwordRow}>
                <Feather name="lock" size={14} color={colors.mutedForeground} />
                <Text style={[styles.passwordLabel, { color: colors.mutedForeground }]}>
                  Password protection — coming soon
                </Text>
              </View>
            </View>
            {files.length === 0 && (
              <EmptyState icon="folder-plus" title="Add files to bundle" message="Pick any files to include in your new ZIP archive." />
            )}
          </>
        }
        renderItem={({ item, index }) => (
          <PickedFileRow name={item.name} onRemove={() => setFiles((prev) => prev.filter((_, i) => i !== index))} />
        )}
        ListFooterComponent={
          <>
            <Button label="Add Files" icon="plus" variant="secondary" onPress={handlePick} style={styles.spacer} />
            {files.length > 0 && (
              <Button label="Create ZIP" icon="folder-plus" onPress={handleCreate} loading={task.isProcessing} style={styles.spacer} />
            )}
            <ToolResultFooter
              status={task.status}
              progress={task.progress}
              errorMessage={task.error}
              onSave={handleSave}
              onShare={handleShare}
            />
          </>
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
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passwordLabel: {
    fontSize: 12,
  },
  spacer: {
    marginTop: 8,
    marginBottom: 8,
  },
});
