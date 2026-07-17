import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/primitives';
import { useColors } from '@/hooks/useColors';
import { useToast } from '@/context/ToastContext';
import { useQrHistory } from '@/hooks/useQrHistory';
import { buildQrPayload, labelForFields } from '@/services/qrService';
import { newTempUri, writeBase64 } from '@/services/fileSystemService';
import type { QrFields, QrType } from '@/types/qr';

/** Minimal shape of the ref react-native-qrcode-svg exposes via getRef. */
interface QrCodeRef {
  toDataURL: (callback: (base64: string) => void) => void;
}

const TYPES: { value: QrType; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { value: 'text', label: 'Text', icon: 'type' },
  { value: 'url', label: 'Link', icon: 'link' },
  { value: 'phone', label: 'Phone', icon: 'phone' },
  { value: 'email', label: 'Email', icon: 'mail' },
  { value: 'wifi', label: 'Wi-Fi', icon: 'wifi' },
];

export default function QrGenerateScreen() {
  const colors = useColors();
  const toast = useToast();
  const history = useQrHistory();
  const [type, setType] = useState<QrType>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [ssid, setSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [security, setSecurity] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [hidden, setHidden] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const qrRef = useRef<QrCodeRef | null>(null);

  const fields: QrFields = useMemo(() => {
    switch (type) {
      case 'text':
        return { type: 'text', text };
      case 'url':
        return { type: 'url', url };
      case 'phone':
        return { type: 'phone', phone };
      case 'email':
        return { type: 'email', email, subject, body };
      case 'wifi':
        return { type: 'wifi', ssid, password: wifiPassword, security, hidden };
    }
  }, [type, text, url, phone, email, subject, body, ssid, wifiPassword, security, hidden]);

  const payload = buildQrPayload(fields);
  const hasContent = payload.trim().length > 0;

  const handleSave = async () => {
    await history.add({ type, label: labelForFields(fields), payload, direction: 'generated' });
    toast.show('Saved to QR History', 'success');
  };

  const handleShare = async () => {
    if (!hasContent || !qrRef.current) return;
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      toast.show('Sharing is not available on this device', 'error');
      return;
    }
    setIsSharing(true);
    try {
      // toDataURL's callback is the only way this library exposes the
      // rendered SVG as an image; wrap it in a promise so the rest of the
      // flow (write to disk, then share) can stay in normal async/await
      // style instead of nested callbacks.
      const base64 = await new Promise<string>((resolve, reject) => {
        try {
          qrRef.current!.toDataURL(resolve);
        } catch (error) {
          reject(error);
        }
      });
      const fileUri = newTempUri('qr-code.png');
      await writeBase64(fileUri, base64);
      await Sharing.shareAsync(fileUri, { mimeType: 'image/png' });
    } catch {
      toast.show("Couldn't share the QR code image", 'error');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Screen>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
        {TYPES.map((option) => (
          <Chip key={option.value} label={option.label} active={type === option.value} onPress={() => setType(option.value)} />
        ))}
      </ScrollView>

      <View style={styles.formGroup}>
        {type === 'text' && (
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Enter any text"
            placeholderTextColor={colors.mutedForeground}
            multiline
            style={[styles.input, styles.multiline, { color: colors.foreground, borderColor: colors.border }]}
          />
        )}
        {type === 'url' && (
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="example.com"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            keyboardType="url"
            style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          />
        )}
        {type === 'phone' && (
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 555 555 5555"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
            style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          />
        )}
        {type === 'email' && (
          <>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
            />
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Subject (optional)"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
            />
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Message (optional)"
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.input, styles.multiline, { color: colors.foreground, borderColor: colors.border }]}
            />
          </>
        )}
        {type === 'wifi' && (
          <>
            <TextInput
              value={ssid}
              onChangeText={setSsid}
              placeholder="Network name (SSID)"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
            />
            <View style={styles.chipRow}>
              {(['WPA', 'WEP', 'nopass'] as const).map((option) => (
                <Chip key={option} label={option === 'nopass' ? 'Open' : option} active={security === option} onPress={() => setSecurity(option)} />
              ))}
            </View>
            {security !== 'nopass' && (
              <TextInput
                value={wifiPassword}
                onChangeText={setWifiPassword}
                placeholder="Password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
              />
            )}
            <View style={styles.switchRow}>
              <Text style={{ color: colors.foreground, fontSize: 13 }}>Hidden network</Text>
              <Switch value={hidden} onValueChange={setHidden} trackColor={{ true: colors.primary, false: colors.muted }} />
            </View>
          </>
        )}
      </View>

      {hasContent ? (
        <View style={[styles.qrCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <QRCode
            value={payload}
            size={220}
            color={colors.foreground}
            backgroundColor={colors.card}
            getRef={(ref) => {
              qrRef.current = ref;
            }}
          />
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button label="Save to History" icon="bookmark" onPress={handleSave} disabled={!hasContent} style={styles.flex} />
        <Button
          label="Share"
          icon="share-2"
          variant="secondary"
          onPress={handleShare}
          disabled={!hasContent}
          loading={isSharing}
          style={styles.flex}
        />
      </View>
      <Pressable onPress={() => router.push('/tools/qr-history')}>
        <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
          View QR History
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  formGroup: {
    gap: 10,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qrCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
});
