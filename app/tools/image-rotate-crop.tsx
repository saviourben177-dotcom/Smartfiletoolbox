import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/primitives';
import { ImagePreviewCard } from '@/components/ImagePreviewCard';
import { ToolResultFooter } from '@/components/ToolResultFooter';
import { useImageTool } from '@/hooks/useImageTool';
import { useColors } from '@/hooks/useColors';
import { cropImage, rotateImage } from '@/services/imageService';

/**
 * Rotate & Crop tool. Rotation is a straightforward 90-degree stepper.
 * Cropping is offered as centered aspect-ratio presets (square / original)
 * rather than a freeform drag-crop UI, since the underlying image pipeline
 * (imageService.cropImage) only needs a pixel rectangle, not interactive
 * gesture handling.
 */
export default function ImageRotateCropScreen() {
  const colors = useColors();
  const tool = useImageTool('edited.jpg');

  const activeAsset = tool.result ?? tool.source;

  const handleRotate = (direction: 1 | -1) => {
    if (!activeAsset) return;
    tool.process(() => rotateImage(activeAsset.uri, direction * 90));
  };

  const handleCropSquare = () => {
    if (!activeAsset) return;
    const { width, height } = activeAsset;
    const size = Math.min(width, height);
    tool.process(() =>
      cropImage(activeAsset.uri, {
        originX: Math.round((width - size) / 2),
        originY: Math.round((height - size) / 2),
        width: size,
        height: size,
      }),
    );
  };

  return (
    <Screen>
      {!tool.source ? (
        <>
          <EmptyState icon="crop" title="Pick a photo to rotate or crop" message="Rotate in 90° steps or crop to a centered square." />
          <Button label="Choose Photo" icon="image" onPress={tool.pick} />
        </>
      ) : (
        <>
          <ImagePreviewCard label={tool.result ? 'Edited' : 'Original'} asset={activeAsset!} />

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.label, { color: colors.cardForeground }]}>Rotate</Text>
            <View style={styles.actionRow}>
              <Button
                label="Rotate Left"
                icon="rotate-ccw"
                variant="secondary"
                onPress={() => handleRotate(-1)}
                loading={tool.isProcessing}
                style={styles.flex}
              />
              <Button
                label="Rotate Right"
                icon="rotate-cw"
                variant="secondary"
                onPress={() => handleRotate(1)}
                loading={tool.isProcessing}
                style={styles.flex}
              />
            </View>

            <Text style={[styles.label, { color: colors.cardForeground, marginTop: 8 }]}>Crop</Text>
            <Button
              label="Crop to Centered Square"
              icon="crop"
              variant="secondary"
              onPress={handleCropSquare}
              loading={tool.isProcessing}
            />
          </View>

          <ToolResultFooter
            status={tool.status}
            progress={tool.progress}
            errorMessage={tool.error}
            onSave={tool.saveResult}
            onShare={tool.shareResult}
          />

          <Button label="Choose Another" variant="secondary" onPress={tool.reset} />
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
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
});
