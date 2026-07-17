import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { FeatherIconName } from '@/types/tools';

/**
 * Small, reusable UI primitives shared across every screen. Kept in one
 * file since each component is a handful of lines — splitting further
 * would add navigation overhead without improving clarity.
 */

export function Chip({
  label,
  active,
  onPress,
  tone = 'default',
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  tone?: 'default' | 'success' | 'warning' | 'error';
}) {
  const colors = useColors();
  const toneColor = {
    default: colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.destructive,
  }[tone];

  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? toneColor : colors.secondary,
          borderRadius: 999,
        },
      ]}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: active ? colors.primaryForeground : colors.secondaryForeground,
        }}
      >
        {label}
      </Text>
    </Wrapper>
  );
}

export function ProgressBar({ progress }: { progress: number }) {
  const colors = useColors();
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
      <View
        style={[
          styles.progressFill,
          { width: `${clamped * 100}%`, backgroundColor: colors.primary },
        ]}
      />
    </View>
  );
}

export function Skeleton({ height = 16, width = '100%' as const, radius = 8 }: { height?: number; width?: number | `${number}%`; radius?: number }) {
  const colors = useColors();
  return (
    <View
      style={{
        height,
        width,
        borderRadius: radius,
        backgroundColor: colors.muted,
      }}
    />
  );
}

export function SectionHeader({
  title,
  action,
  onActionPress,
}: {
  title: string;
  action?: string;
  onActionPress?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action ? (
        <Pressable onPress={onActionPress}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  message,
}: {
  icon: FeatherIconName;
  title: string;
  message?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconWrap, { backgroundColor: colors.accent }]}>
        <Feather name={icon} size={26} color={colors.accentForeground} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      {message ? (
        <Text style={[styles.emptyMessage, { color: colors.mutedForeground }]}>{message}</Text>
      ) : null}
    </View>
  );
}

export function StatusBadge({ status }: { status: 'idle' | 'processing' | 'done' | 'error' }) {
  const colors = useColors();
  if (status === 'idle') return null;
  const config = {
    processing: { label: 'Processing…', color: colors.warning },
    done: { label: 'Done', color: colors.success },
    error: { label: 'Failed', color: colors.destructive },
  }[status];
  if (!config) return null;
  return (
    <View style={[styles.badge, { backgroundColor: `${config.color}22` }]}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: config.color }}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
});
