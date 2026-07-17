import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { formatBytes } from '@/utils/formatBytes';
import type { ImageAsset } from '@/types/image';

export function ImagePreviewCard({ label, asset }: { label: string; asset: ImageAsset | null }) {
  const colors = useColors();
  if (!asset) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <Image source={{ uri: asset.uri }} style={styles.image} resizeMode="contain" />
      <View style={styles.footer}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.meta, { color: colors.cardForeground }]}>
          {asset.width}×{asset.height}
          {asset.fileSize ? ` · ${formatBytes(asset.fileSize)}` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 220,
  },
  footer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
  },
});
