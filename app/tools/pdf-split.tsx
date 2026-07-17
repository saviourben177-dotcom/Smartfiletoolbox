import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/primitives';
import { ToolResultFooter } from '@/components/ToolResultFooter';
import { useAsyncTask } from '@/hooks/useAsyncTask';
import { useColors } from '@/hooks/useColors';
import { useToast } from '@/context/ToastContext';
import { pickPdfs, splitPdf } from '@/services/pdfService';
import { saveToOutput } from '@/services/fileSystemService';
import type { PdfDocumentRef } from '@/types/pdf';

/** Parses "1-3, 5, 8-9" into page ranges. */
function parseRanges(input: string): { from: number; to: number }[] {
  return input
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [fromRaw, toRaw] = part.split('-');
      const from = parseInt(fromRaw ?? '', 10);
      const to = toRaw ? parseInt(toRaw, 10) : from;
      return { from, to };
    })
    .filter((range) => Number.isFinite(range.from) && Number.isFinite(range.to));
}

export default function PdfSplitScreen() {
  const colors = useColors();
  const [doc, setDoc] = useState<PdfDocumentRef | null>(null);
  const [rangeInput, setRangeInput] = useState('');
  const task = useAsyncTask<string>();
  const toast = useToast();

  const handlePick = async () => {
    const picked = await pickPdfs(false);
    if (picked[0]) setDoc(picked[0]);
  };

  const ranges = parseRanges(rangeInput);
  const canSplit = !!doc && ranges.length > 0;

  const handleSplit = () => {
    if (!doc) return;
    task.run(() => splitPdf(doc.uri, ranges));
  };

  const handleSave = async () => {
    if (!task.result) return;
    await saveToOutput(task.result, 'split.pdf');
    toast.show('Saved to Output', 'success');
  };

  const handleShare = async () => {
    if (!task.result) return;
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(task.result);
  };

  return (
    <Screen>
      {!doc ? (
        <>
          <EmptyState icon="scissors" title="Pick a PDF to split" message="Extract one or more page ranges into a new PDF." />
          <Button label="Choose PDF" icon="file-text" onPress={handlePick} />
        </>
      ) : (
        <>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.name, { color: colors.cardForeground }]}>{doc.name}</Text>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>{doc.pageCount} pages</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.label, { color: colors.cardForeground }]}>Pages to extract</Text>
            <TextInput
              value={rangeInput}
              onChangeText={setRangeInput}
              placeholder="e.g. 1-3, 5, 8-9"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
            />
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Use commas to separate pages or ranges, out of {doc.pageCount}.
            </Text>
          </View>

          <ToolResultFooter
            status={task.status}
            progress={task.progress}
            errorMessage={task.error}
            onSave={handleSave}
            onShare={handleShare}
          />

          <View style={styles.actions}>
            <Button label="Extract" icon="scissors" onPress={handleSplit} disabled={!canSplit} loading={task.isProcessing} style={styles.flex} />
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
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
});
