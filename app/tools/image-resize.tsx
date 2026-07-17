import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Chip, EmptyState } from '@/components/ui/primitives';
import { ImagePreviewCard } from '@/components/ImagePreviewCard';
import { ToolResultFooter } from '@/components/ToolResultFooter';
import { useImageTool } from '@/hooks/useImageTool';
import { useColors } from '@/hooks/useColors';
import { resizeImage } from '@/services/imageService';

const PRESETS = [
  { label: '50%', scale: 0.5 },
  { label: '25%', scale: 0.25 },
  { label: '10%', scale: 0.1 },
];

export default function ImageResizeScreen() {
  const colors = useColors();
  const tool = useImageTool('resized.jpg');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  const applyPreset = (scale: number) => {
    if (!tool.source) return;
    setWidth(String(Math.round(tool.source.width * scale)));
    setHeight(String(Math.round(tool.source.height * scale)));
  };

  const handleResize = () => {
    if (!tool.source) return;
    const w = width ? parseInt(width, 10) : undefined;
    const h = height ? parseInt(height, 10) : undefined;
    if (!w && !h) return;
    tool.process(() => resizeImage(tool.source!.uri, w, h));
  };

  return (
    <Screen>
      {!tool.source ? (
        <>
          <EmptyState icon="maximize-2" title="Pick a photo to resize" message="Scale to exact dimensions or a percentage of the original." />
          <Button label="Choose Photo" icon="image" onPress={tool.pick} />
        </>
      ) : (
        <>
          <ImagePreviewCard label="Original" asset={tool.source} />
          {tool.result ? <ImagePreviewCard label="Resized" asset={tool.result} /> : null}

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.label, { color: colors.cardForeground }]}>Quick presets</Text>
            <View style={styles.chipRow}>
              {PRESETS.map((preset) => (
                <Chip key={preset.label} label={preset.label} onPress={() => applyPreset(preset.scale)} />
              ))}
            </View>

            <Text style={[styles.label, { color: colors.cardForeground, marginTop: 8 }]}>Custom size (px)</Text>
            <View style={styles.dimensionRow}>
              <TextInput
                value={width}
                onChangeText={setWidth}
                keyboardType="number-pad"
                placeholder="Width"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
              />
              <Text style={{ color: colors.mutedForeground }}>×</Text>
              <TextInput
                value={height}
                onChangeText={setHeight}
                keyboardType="number-pad"
                placeholder="Height"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
              />
            </View>
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Leave one blank to preserve aspect ratio.
            </Text>
          </View>

          <ToolResultFooter
            status={tool.status}
            progress={tool.progress}
            errorMessage={tool.error}
            onSave={tool.saveResult}
            onShare={tool.shareResult}
          />

          <View style={styles.actions}>
            <Button label="Resize" icon="maximize-2" onPress={handleResize} loading={tool.isProcessing} style={styles.flex} />
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
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
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
