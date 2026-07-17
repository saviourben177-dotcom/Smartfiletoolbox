import { useCallback, useState } from 'react';
import * as Sharing from 'expo-sharing';
import { pickImages } from '@/services/imageService';
import { saveToOutput } from '@/services/fileSystemService';
import { saveImageToLibrary } from '@/services/mediaLibraryService';
import { useAsyncTask } from '@/hooks/useAsyncTask';
import { useToast } from '@/context/ToastContext';
import type { ImageAsset } from '@/types/image';

/**
 * Shared plumbing for every single-image tool screen (compress, resize,
 * convert, and the rotate/crop editing they share): picking a source image,
 * running a transform through useAsyncTask, and exporting the result.
 */
export function useImageTool(outputName: string) {
  const [source, setSource] = useState<ImageAsset | null>(null);
  const task = useAsyncTask<ImageAsset>();
  const toast = useToast();

  const pick = useCallback(async () => {
    const assets = await pickImages(false);
    if (assets[0]) {
      setSource(assets[0]);
      task.reset();
    }
  }, [task]);

  const process = useCallback(
    (transform: () => Promise<ImageAsset>) => {
      return task.run(() => transform());
    },
    [task],
  );

  const saveResult = useCallback(async () => {
    if (!task.result) return;
    const entry = await saveToOutput(task.result.uri, outputName);
    const savedToPhotos = await saveImageToLibrary(entry.uri).catch(() => false);
    toast.show(
      savedToPhotos ? 'Saved to Output and your Photos' : 'Saved to Output (Photos access not granted)',
      savedToPhotos ? 'success' : 'error',
    );
  }, [task.result, outputName, toast]);

  const shareResult = useCallback(async () => {
    if (!task.result) return;
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      toast.show('Sharing is not available on this device', 'error');
      return;
    }
    await Sharing.shareAsync(task.result.uri);
  }, [task.result, toast]);

  const reset = useCallback(() => {
    setSource(null);
    task.reset();
  }, [task]);

  return { source, ...task, process, saveResult, shareResult, pick, reset };
}
