import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { PermissionGate } from '@/components/PermissionGate';
import { Button } from '@/components/ui/Button';
import { useColors } from '@/hooks/useColors';
import { usePermission } from '@/hooks/usePermission';
import { getCameraPermission, requestCameraPermission } from '@/services/permissionsService';
import { useQrHistory } from '@/hooks/useQrHistory';
import { useToast } from '@/context/ToastContext';

export default function QrScanScreen() {
  const colors = useColors();
  const permission = usePermission(getCameraPermission, requestCameraPermission);
  const history = useQrHistory();
  const toast = useToast();
  const [scanned, setScanned] = useState<string | null>(null);

  const handleScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(data);
    history.add({ type: 'text', label: data.slice(0, 60), payload: data, direction: 'scanned' });
  };

  const handleOpen = () => {
    if (scanned) Linking.openURL(scanned).catch(() => toast.show('Could not open this link', 'error'));
  };

  const handleCopy = async () => {
    if (!scanned) return;
    await Clipboard.setStringAsync(scanned);
    toast.show('Copied to clipboard', 'success');
  };

  return (
    <PermissionGate
      status={permission.status}
      onRequest={permission.request}
      title="Camera access needed"
      message="Allow camera access to scan QR codes."
    >
      <View style={styles.container}>
        {!scanned ? (
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleScanned}
          />
        ) : (
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.accent }]}>
              <Feather name="check-circle" size={26} color={colors.accentForeground} />
            </View>
            <Text style={[styles.resultLabel, { color: colors.mutedForeground }]}>Scanned code</Text>
            <Text style={[styles.resultText, { color: colors.cardForeground }]} numberOfLines={4}>
              {scanned}
            </Text>
            <View style={styles.resultActions}>
              <Button label="Copy" icon="copy" variant="secondary" onPress={handleCopy} style={styles.flex} />
              {/^https?:\/\//i.test(scanned) && (
                <Button label="Open" icon="external-link" onPress={handleOpen} style={styles.flex} />
              )}
            </View>
            <Pressable onPress={() => setScanned(null)}>
              <Text style={{ color: colors.primary, fontWeight: '600', marginTop: 8 }}>Scan Another</Text>
            </Pressable>
          </View>
        )}
      </View>
    </PermissionGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  resultCard: {
    margin: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    alignSelf: 'stretch',
  },
  flex: {
    flex: 1,
  },
});
