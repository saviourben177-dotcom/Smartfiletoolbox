import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/primitives';
import { useColors } from '@/hooks/useColors';
import { useQrHistory } from '@/hooks/useQrHistory';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { formatDateTime } from '@/utils/formatDate';

export default function QrHistoryScreen() {
  const colors = useColors();
  const history = useQrHistory();
  const toast = useToast();
  const confirm = useConfirm();

  const handleClear = async () => {
    const ok = await confirm({ title: 'Clear QR history?', confirmLabel: 'Clear', destructive: true });
    if (ok) history.clear();
  };

  const handleCopy = async (payload: string) => {
    await Clipboard.setStringAsync(payload);
    toast.show('Copied to clipboard', 'success');
  };

  return (
    <Screen scroll={false}>
      <FlatList
        data={history.history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={history.loading}
        onRefresh={history.refresh}
        ListEmptyComponent={
          !history.loading ? (
            <EmptyState icon="clock" title="No QR history yet" message="Codes you generate or scan will appear here." />
          ) : null
        }
        ListHeaderComponent={
          history.history.length > 0 ? (
            <Button label="Clear History" icon="trash-2" variant="secondary" onPress={handleClear} style={styles.spacer} />
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleCopy(item.payload)}
            style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.accent }]}>
              <Feather name={item.direction === 'scanned' ? 'camera' : 'grid'} size={16} color={colors.accentForeground} />
            </View>
            <View style={styles.rowText}>
              <Text numberOfLines={1} style={[styles.rowLabel, { color: colors.cardForeground }]}>{item.label}</Text>
              <Text style={[styles.rowMeta, { color: colors.mutedForeground }]}>
                {item.direction === 'scanned' ? 'Scanned' : 'Generated'} · {formatDateTime(item.createdAt)}
              </Text>
            </View>
            <Pressable onPress={() => history.remove(item.id)} hitSlop={8}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          </Pressable>
        )}
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
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  iconWrap: {
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
  rowMeta: {
    fontSize: 12,
  },
});
