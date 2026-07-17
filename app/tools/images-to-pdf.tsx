import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/primitives';
import { ToolResultFooter } from '@/components/ToolResultFooter';
import { PickedFileRow } from '@/components/PickedFileRow';
import { useAsyncTask } from '@/hooks/useAsyncTask';
import { useToast } from '@/context/ToastContext';
import { pickImages } from '@/services/imageService';
import { imagesToPdf } from '@/services/pdfService';
import { saveToOutput } from '@/services/fileSystemService';
import { useState } from 'react';
import type { ImageAsset } from '@/types/image';

export default function ImagesToPdfScreen() {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const task = useAsyncTask<string>();
  const toast = useToast();

  const handlePick = async () => {
    const picked = await pickImages(true);
    if (picked.length > 0) setImages((prev) => [...prev, ...picked]);
  };

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBuild = () => {
    task.run(() => imagesToPdf(images.map((image) => image.uri)));
  };

  const handleSave = async () => {
    if (!task.result) return;
    await saveToOutput(task.result, 'images.pdf');
    toast.show('Saved to Output', 'success');
  };

  const handleShare = async () => {
    if (!task.result) return;
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(task.result);
  };

  return (
    <Screen scroll={false}>
      <FlatList
        data={images}
        keyExtractor={(item, index) => `${item.uri}-${index}`}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          images.length === 0 ? (
            <EmptyState icon="image" title="Add photos to combine" message="Pick one or more photos to build a single PDF." />
          ) : null
        }
        renderItem={({ item, index }) => (
          <PickedFileRow name={item.fileName ?? `Photo ${index + 1}`} index={index} onRemove={() => handleRemove(index)} />
        )}
        ListFooterComponent={
          <>
            <Button label="Add Photos" icon="plus" variant="secondary" onPress={handlePick} style={styles.spacer} />
            {images.length > 0 && (
              <Button
                label={`Build PDF (${images.length} photo${images.length > 1 ? 's' : ''})`}
                icon="file-text"
                onPress={handleBuild}
                loading={task.isProcessing}
                style={styles.spacer}
              />
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
