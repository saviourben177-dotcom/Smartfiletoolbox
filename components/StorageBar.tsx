import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { labelForCategory } from '@/constants/fileTypes';
import { formatBytes, formatPercent } from '@/utils/formatBytes';
import type { StorageBreakdownItem } from '@/types/file';

const CATEGORY_COLOR_ORDER = ['#16A34A', '#34D368', '#7ADB9E', '#0E7A38', '#B7EFC5', '#5BE28C', '#0B4B23'];

export function StorageBar({
  breakdown,
  totalBytes,
}: {
  breakdown: StorageBreakdownItem[];
  totalBytes: number;
}) {
  const colors = useColors();
  const safeTotal = totalBytes > 0 ? totalBytes : breakdown.reduce((sum, item) => sum + item.bytes, 0) || 1;

  return (
    <View>
      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        {breakdown.map((item, index) => (
          <View
            key={item.category}
            style={{
              width: `${Math.max((item.bytes / safeTotal) * 100, breakdown.length ? 0.5 : 0)}%`,
              backgroundColor: CATEGORY_COLOR_ORDER[index % CATEGORY_COLOR_ORDER.length],
            }}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {breakdown.map((item, index) => (
          <View key={item.category} style={styles.legendRow}>
            <View
              style={[styles.dot, { backgroundColor: CATEGORY_COLOR_ORDER[index % CATEGORY_COLOR_ORDER.length] }]}
            />
            <Text style={[styles.legendLabel, { color: colors.foreground }]}>{labelForCategory(item.category)}</Text>
            <Text style={[styles.legendValue, { color: colors.mutedForeground }]}>
              {formatBytes(item.bytes)} · {formatPercent(item.bytes / safeTotal)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 999,
    overflow: 'hidden',
  },
  legend: {
    marginTop: 14,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  legendValue: {
    fontSize: 12,
  },
});
