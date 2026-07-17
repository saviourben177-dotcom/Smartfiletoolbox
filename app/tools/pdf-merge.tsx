import React, { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/primitives';
import { ToolResultFooter } from '@/components/ToolResultFooter';
import { PickedFileRow } from '@/components/PickedFileRow';
import { useAsyncTask } from '@/hooks/useAsyncTask';
import { useToast } from '@/context/ToastContext';
import { pickPdfs, mergePdfs } from '@/services/pdfService';
import { saveToOutput } from '@/services/fileSystemService';
import type { PdfDocumentRef } from '@/types/pdf';

export default function PdfMergeScreen() {
  const [docs, setDocs] = useState<PdfDocumentRef[]>([]);
  const task = useAsyncTask<string>();
  const toast = useToast();

  const handlePick = async () => {
    const picked = await pickPdfs(true);
    if (picked.length > 0) setDocs((prev) => [...prev, ...picked]);
  };

  const move = (index: number, direction: -1 | 1) => {
    setDocs((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  };

  const handleMerge = () => {
    task.run(() => mergePdfs(docs.map((doc) => doc.uri)));
  };

  const handleSave = async () => {
    if (!task.result) return;
    await saveToOutput(task.result, 'merged.pdf');
    toast.show('Saved to Output', 'success');
  };

  const handleShare = async () => {
    if (!task.result) return;
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(task.result);
  };

  return (
    <Screen scroll={false}>
      <FlatList
        data={docs}
        keyExtractor={(item, index) => `${item.uri}-${index}`}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          docs.length === 0 ? (
            <EmptyState icon="copy" title="Add PDFs to merge" message="Pick two or more PDFs, then reorder them before combining." />
          ) : null
        }
        renderItem={({ item, index }) => (
          <PickedFileRow
            name={item.name}
            subtitle={`${item.pageCount} page${item.pageCount === 1 ? '' : 's'}`}
            size={item.size}
            index={index}
            onMoveUp={index > 0 ? () => move(index, -1) : undefined}
            onMoveDown={index < docs.length - 1 ? () => move(index, 1) : undefined}
            onRemove={() => setDocs((prev) => prev.filter((_, i) => i !== index))}
          />
        )}
        ListFooterComponent={
          <>
            <Button label="Add PDFs" icon="plus" variant="secondary" onPress={handlePick} style={styles.spacer} />
            {docs.length >= 2 && (
              <Button label="Merge PDFs" icon="copy" onPress={handleMerge} loading={task.isProcessing} style={styles.spacer} />
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
  spacer: {
    marginTop: 8,
    marginBottom: 8,
  },
});
