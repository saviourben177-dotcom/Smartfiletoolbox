import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { SectionHeader, Chip } from '@/components/ui/primitives';
import { useColors } from '@/hooks/useColors';
import { useThemeContext } from '@/context/ThemeContext';
import { useSettings } from '@/hooks/useSettings';
import { clearTempFiles } from '@/services/storageAnalysisService';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { formatBytes } from '@/utils/formatBytes';
import type { ThemePreference } from '@/types/settings';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function SettingsRow({
  icon,
  label,
  description,
  right,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  description?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const colors = useColors();
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.accent }]}>
        <Feather name={icon} size={18} color={colors.accentForeground} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.cardForeground }]}>{label}</Text>
        {description ? <Text style={[styles.rowDescription, { color: colors.mutedForeground }]}>{description}</Text> : null}
      </View>
      {right}
    </Wrapper>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const { preference, setPreference } = useThemeContext();
  const { settings, update } = useSettings();
  const toast = useToast();
  const confirm = useConfirm();

  const handleClearCache = async () => {
    const ok = await confirm({
      title: 'Clear temporary files?',
      message: 'Frees up space used by in-progress tool operations. Imported and output files are not affected.',
      confirmLabel: 'Clear',
    });
    if (!ok) return;
    const freed = await clearTempFiles();
    toast.show(`Freed ${formatBytes(freed)}`, 'success');
  };

  return (
    <Screen>
      <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>

      <SectionHeader title="Appearance" />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.rowLabel, { color: colors.cardForeground, marginBottom: 10 }]}>Theme</Text>
        <View style={styles.chipRow}>
          {THEME_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              active={preference === option.value}
              onPress={() => setPreference(option.value)}
            />
          ))}
        </View>
      </View>

      <SectionHeader title="Preferences" />
      <SettingsRow
        icon="zap"
        label="Haptic feedback"
        description="Vibrate on button taps and completed actions"
        right={
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={(value) => update({ hapticsEnabled: value })}
            trackColor={{ true: colors.primary, false: colors.muted }}
          />
        }
      />

      <SectionHeader title="Storage" />
      <SettingsRow
        icon="trash-2"
        label="Clear temporary files"
        description="Free up space used by the app's scratch folder"
        onPress={handleClearCache}
        right={<Feather name="chevron-right" size={18} color={colors.mutedForeground} />}
      />

      <SectionHeader title="About" />
      <SettingsRow
        icon="info"
        label="Smart File Toolbox"
        description={`Version ${Constants.expoConfig?.version ?? '1.0.0'}`}
      />
      <SettingsRow
        icon="shield"
        label="Works fully offline"
        description="All processing happens on your device — nothing is uploaded"
      />
      <SettingsRow
        icon="file-text"
        label="Privacy Policy"
        description="What data this app does (and doesn't) access"
        onPress={() => router.push('/privacy-policy')}
        right={<Feather name="chevron-right" size={18} color={colors.mutedForeground} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowDescription: {
    fontSize: 12,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
