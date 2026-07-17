import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { iconForCategory } from '@/constants/fileTypes';
import { formatBytes } from '@/utils/formatBytes';
import { formatRelativeDate } from '@/utils/formatDate';
import type { FileEntry } from '@/types/file';

interface FileListItemProps {
  entry: FileEntry;
  mode?: 'list' | 'grid';
  onPress?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
  trailing?: React.ReactNode;
}

export function FileListItem({ entry, mode = 'list', onPress, onLongPress, selected, trailing }: FileListItemProps) {
  const colors = useColors();
  const isImage = entry.category === 'image';

  if (mode === 'grid') {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={[
          styles.gridItem,
          {
            backgroundColor: colors.card,
            borderColor: selected ? colors.primary : colors.border,
            borderRadius: colors.radius,
            borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
          },
        ]}
      >
        {isImage ? (
          <Image source={{ uri: entry.uri }} style={styles.gridThumb} resizeMode="cover" />
        ) : (
          <View style={[styles.gridIconWrap, { backgroundColor: colors.accent }]}>
            <Feather name={iconForCategory(entry.category)} size={22} color={colors.accentForeground} />
          </View>
        )}
        <Text numberOfLines={1} style={[styles.gridName, { color: colors.cardForeground }]}>
          {entry.name}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.row,
        { backgroundColor: selected ? colors.accent : colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      {isImage ? (
        <Image source={{ uri: entry.uri }} style={styles.rowThumb} resizeMode="cover" />
      ) : (
        <View style={[styles.rowIconWrap, { backgroundColor: colors.accent }]}>
          <Feather name={entry.isDirectory ? 'folder' : iconForCategory(entry.category)} size={20} color={colors.accentForeground} />
        </View>
      )}
      <View style={styles.rowText}>
        <Text numberOfLines={1} style={[styles.rowName, { color: colors.cardForeground }]}>
          {entry.name}
        </Text>
        <Text style={[styles.rowMeta, { color: colors.mutedForeground }]}>
          {entry.isDirectory ? 'Folder' : formatBytes(entry.size)} · {formatRelativeDate(entry.modifiedAt)}
        </Text>
      </View>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  rowThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  rowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowMeta: {
    fontSize: 12,
  },
  gridItem: {
    flex: 1,
    padding: 8,
    gap: 6,
    alignItems: 'center',
  },
  gridThumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
  },
  gridIconWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridName: {
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'stretch',
    textAlign: 'center',
  },
});
