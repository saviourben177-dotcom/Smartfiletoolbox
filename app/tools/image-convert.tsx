import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Chip, EmptyState } from '@/components/ui/primitives';
import { ImagePreviewCard } from '@/components/ImagePreviewCard';
import { ToolResultFooter } from '@/components/ToolResultFooter';
import { useImageTool } from '@/hooks/useImageTool';
import { useColors } from '@/hooks/useColors';
import { convertImage } from '@/services/imageService';
import type { ImageFormat } from '@/types/image';

const FORMATS: { value: ImageFormat; label: string }[] = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WEBP' },
];

export default function ImageConvertScreen() {
  const colors = useColors();
  const tool = useImageTool('converted');
  const [format, setFormat] = useState<ImageFormat>('png');

  const handleConvert = () => {
    if (!tool.source) return;
    tool.process(() => convertImage(tool.source!.uri, format));
  };

  return (
    <Screen>
      {!tool.source ? (
        <>
          <EmptyState icon="repeat" title="Pick a photo to convert" message="Switch between JPEG, PNG and WEBP." />
          <Button label="Choose Photo" icon="image" onPress={tool.pick} />
        </>
      ) : (
        <>
          <ImagePreviewCard label="Original" asset={tool.source} />
          {tool.result ? <ImagePreviewCard label={`Converted (${format.toUpperCase()})`} asset={tool.result} /> : null}

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.label, { color: colors.cardForeground }]}>Target format</Text>
            <View style={styles.chipRow}>
              {FORMATS.map((option) => (
                <Chip key={option.value} label={option.label} active={format === option.value} onPress={() => setFormat(option.value)} />
              ))}
            </View>
          </View>

          <ToolResultFooter
            status={tool.status}
            progress={tool.progress}
            errorMessage={tool.error}
            onSave={() => tool.saveResult()}
            onShare={tool.shareResult}
          />

          <View style={styles.actions}>
            <Button label="Convert" icon="repeat" onPress={handleConvert} loading={tool.isProcessing} style={styles.flex} />
            <Button label="Choose Another" variant="secondary" onPress={tool.reset} style={styles.flex} />
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
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
});
