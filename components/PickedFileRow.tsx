import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { formatBytes } from '@/utils/formatBytes';

interface PickedFileRowProps {
  name: string;
  subtitle?: string;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  size?: number;
  index?: number;
}

export function PickedFileRow({ name, subtitle, onRemove, onMoveUp, onMoveDown, size, index }: PickedFileRowProps) {
  const colors = useColors();
  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      {typeof index === 'number' ? (
        <View style={[styles.indexBadge, { backgroundColor: colors.accent }]}>
          <Text style={{ color: colors.accentForeground, fontSize: 12, fontWeight: '700' }}>{index + 1}</Text>
        </View>
      ) : (
        <Feather name="file" size={18} color={colors.mutedForeground} />
      )}
      <View style={styles.text}>
        <Text numberOfLines={1} style={[styles.name, { color: colors.cardForeground }]}>{name}</Text>
        {(subtitle || size !== undefined) && (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {subtitle}
            {subtitle && size !== undefined ? ' · ' : ''}
            {size !== undefined ? formatBytes(size) : ''}
          </Text>
        )}
      </View>
      {onMoveUp && (
        <Pressable onPress={onMoveUp} hitSlop={8} style={styles.iconButton}>
          <Feather name="chevron-up" size={18} color={colors.mutedForeground} />
        </Pressable>
      )}
      {onMoveDown && (
        <Pressable onPress={onMoveDown} hitSlop={8} style={styles.iconButton}>
          <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
        </Pressable>
      )}
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8} style={styles.iconButton}>
          <Feather name="x" size={18} color={colors.destructive} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  indexBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
  },
  iconButton: {
    padding: 4,
  },
});
