import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { ProgressBar, StatusBadge } from '@/components/ui/primitives';
import { useColors } from '@/hooks/useColors';
import type { ToolStatus } from '@/types/tools';

interface ToolResultFooterProps {
  status: ToolStatus;
  progress: number;
  errorMessage?: string | null;
  onSave?: () => void;
  onShare?: () => void;
  saveLabel?: string;
}

/** Consistent processing/result footer shown at the bottom of every tool screen. */
export function ToolResultFooter({ status, progress, errorMessage, onSave, onShare, saveLabel = 'Save' }: ToolResultFooterProps) {
  const colors = useColors();
  if (status === 'idle') return null;

  return (
    <View style={styles.container}>
      <StatusBadge status={status} />
      {status === 'processing' ? <ProgressBar progress={progress} /> : null}
      {status === 'error' && errorMessage ? (
        <Text style={{ color: colors.destructive, fontSize: 13 }}>{errorMessage}</Text>
      ) : null}
      {status === 'done' ? (
        <View style={styles.actions}>
          {onSave ? <Button label={saveLabel} icon="download" onPress={onSave} style={styles.flex} /> : null}
          {onShare ? <Button label="Share" icon="share-2" variant="secondary" onPress={onShare} style={styles.flex} /> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
});
