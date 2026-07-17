import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/primitives';
import { ToolResultFooter } from '@/components/ToolResultFooter';
import { useAsyncTask } from '@/hooks/useAsyncTask';
import { useColors } from '@/hooks/useColors';
import { useToast } from '@/context/ToastContext';
import { pickPdfs, compressPdf } from '@/services/pdfService';
import { saveToOutput } from '@/services/fileSystemService';
import { formatBytes } from '@/utils/formatBytes';
import type { PdfDocumentRef } from '@/types/pdf';

export default function PdfCompressScreen() {
  const colors = useColors();
  const [doc, setDoc] = useState<PdfDocumentRef | null>(null);
  const task = useAsyncTask<{ uri: string; originalSize: number; newSize: number }>();
  const toast = useToast();

  const handlePick = async () => {
    const picked = await pickPdfs(false);
    if (picked[0]) setDoc(picked[0]);
  };

  const handleCompress = () => {
    if (!doc) return;
    task.run(() => compressPdf(doc.uri));
  };

  const handleSave = async () => {
    if (!task.result) return;
    await saveToOutput(task.result.uri, 'compressed.pdf');
    toast.show('Saved to Output', 'success');
  };

  const handleShare = async () => {
    if (!task.result) return;
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(task.result.uri);
  };

  return (
    <Screen>
      {!doc ? (
        <>
          <EmptyState icon="file-minus" title="Pick a PDF to compress" message="Optimizes internal structure to reduce file size." />
          <Button label="Choose PDF" icon="file-text" onPress={handlePick} />
        </>
      ) : (
        <>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.name, { color: colors.cardForeground }]}>{doc.name}</Text>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {doc.pageCount} pages · {formatBytes(doc.size)}
            </Text>
          </View>

          {task.result ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={[styles.name, { color: colors.cardForeground }]}>Result</Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {formatBytes(task.result.originalSize)} → {formatBytes(task.result.newSize)}
                {task.result.newSize < task.result.originalSize
                  ? ` (${Math.round((1 - task.result.newSize / task.result.originalSize) * 100)}% smaller)`
                  : ' (already optimized)'}
              </Text>
            </View>
          ) : (
            <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
              This performs a lossless structural optimization. It will not re-compress embedded images, so
              savings vary and may be small for already-optimized PDFs.
            </Text>
          )}

          <ToolResultFooter
            status={task.status}
            progress={task.progress}
            errorMessage={task.error}
            onSave={handleSave}
            onShare={handleShare}
          />

          <View style={styles.actions}>
            <Button label="Compress" icon="file-minus" onPress={handleCompress} loading={task.isProcessing} style={styles.flex} />
            <Button label="Choose Another" variant="secondary" onPress={() => setDoc(null)} style={styles.flex} />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
});
