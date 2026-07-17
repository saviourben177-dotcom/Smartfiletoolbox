import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/primitives';
import { ImagePreviewCard } from '@/components/ImagePreviewCard';
import { ToolResultFooter } from '@/components/ToolResultFooter';
import { useImageTool } from '@/hooks/useImageTool';
import { useColors } from '@/hooks/useColors';
import { compressImage } from '@/services/imageService';

export default function ImageCompressScreen() {
  const colors = useColors();
  const tool = useImageTool('compressed.jpg');
  const [quality, setQuality] = useState(0.6);
  const sourceIsPng = tool.source?.uri.split('?')[0]?.toLowerCase().endsWith('.png') ?? false;

  const handleCompress = () => {
    if (!tool.source) return;
    tool.process(() => compressImage(tool.source!.uri, quality));
  };

  return (
    <Screen>
      {!tool.source ? (
        <>
          <EmptyState icon="minimize-2" title="Pick a photo to compress" message="Reduce file size while keeping visual quality." />
          <Button label="Choose Photo" icon="image" onPress={tool.pick} />
        </>
      ) : (
        <>
          <ImagePreviewCard label="Original" asset={tool.source} />
          {sourceIsPng ? (
            <Text style={[styles.warning, { color: colors.mutedForeground }]}>
              Compressing always outputs JPEG, so transparency in this PNG will be lost. Use Convert if you need to keep it.
            </Text>
          ) : null}
          {tool.result ? <ImagePreviewCard label="Compressed" asset={tool.result} /> : null}

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={styles.qualityRow}>
              <Text style={[styles.label, { color: colors.cardForeground }]}>Quality</Text>
              <Text style={[styles.value, { color: colors.mutedForeground }]}>{Math.round(quality * 100)}%</Text>
            </View>
            <Slider
              value={quality}
              onValueChange={setQuality}
              minimumValue={0.1}
              maximumValue={1}
              step={0.05}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.muted}
              thumbTintColor={colors.primary}
            />
          </View>

          <ToolResultFooter
            status={tool.status}
            progress={tool.progress}
            errorMessage={tool.error}
            onSave={tool.saveResult}
            onShare={tool.shareResult}
          />

          <View style={styles.actions}>
            <Button label="Compress" icon="minimize-2" onPress={handleCompress} loading={tool.isProcessing} style={styles.flex} />
            <Button label="Choose Another" variant="secondary" onPress={tool.reset} style={styles.flex} />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  warning: {
    fontSize: 12,
    lineHeight: 16,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 8,
  },
  qualityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
});
