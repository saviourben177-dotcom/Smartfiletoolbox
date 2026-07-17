import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/ui/primitives';
import { StorageBar } from '@/components/StorageBar';
import { useColors } from '@/hooks/useColors';
import { getStorageOverview } from '@/services/storageAnalysisService';
import { formatBytes, formatPercent } from '@/utils/formatBytes';
import type { StorageOverview } from '@/types/file';

export default function StorageOverviewScreen() {
  const colors = useColors();
  const [overview, setOverview] = useState<StorageOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setOverview(await getStorageOverview());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const usedBytes = overview ? overview.totalBytes - overview.freeBytes : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      {!overview ? (
        <>
          <Skeleton height={90} radius={16} />
          <Skeleton height={200} radius={16} />
        </>
      ) : (
        <>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.summaryTitle, { color: colors.mutedForeground }]}>Device storage</Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>
              {formatBytes(usedBytes)} used of {formatBytes(overview.totalBytes)}
            </Text>
            <View style={[styles.deviceBar, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  styles.deviceBarFill,
                  { width: `${Math.min(100, (usedBytes / (overview.totalBytes || 1)) * 100)}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.summaryHint, { color: colors.mutedForeground }]}>
              {formatBytes(overview.freeBytes)} free ({formatPercent(overview.freeBytes / (overview.totalBytes || 1))})
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.cardTitle, { color: colors.cardForeground }]}>Breakdown by type</Text>
            <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
              Based on files Smart File Toolbox can see: imported files, tool output, and your photo library.
            </Text>
            {overview.breakdown.length > 0 ? (
              <StorageBar breakdown={overview.breakdown} totalBytes={overview.breakdown.reduce((sum, item) => sum + item.bytes, 0)} />
            ) : (
              <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>No files scanned yet.</Text>
            )}
          </View>

          <Text style={[styles.footnote, { color: colors.mutedForeground }]}>
            Android limits apps to their own files and the shared photo/video library, so this reflects what
            Smart File Toolbox has access to rather than your device's entire filesystem.
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  deviceBar: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  deviceBarFill: {
    height: '100%',
  },
  summaryHint: {
    fontSize: 12,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  footnote: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
