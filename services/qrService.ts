import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { QrFields, QrHistoryItem } from '@/types/qr';
import { generateId } from '@/utils/id';

/** Builds the raw QR payload string for a given structured input. */
export function buildQrPayload(fields: QrFields): string {
  switch (fields.type) {
    case 'text':
      return fields.text;
    case 'url':
      return /^https?:\/\//i.test(fields.url) ? fields.url : `https://${fields.url}`;
    case 'phone':
      return `tel:${fields.phone.replace(/\s+/g, '')}`;
    case 'email': {
      const params = new URLSearchParams();
      if (fields.subject) params.set('subject', fields.subject);
      if (fields.body) params.set('body', fields.body);
      const query = params.toString();
      return `mailto:${fields.email}${query ? `?${query}` : ''}`;
    }
    case 'wifi':
      return `WIFI:T:${fields.security};S:${fields.ssid};P:${fields.security === 'nopass' ? '' : fields.password};H:${fields.hidden ? 'true' : 'false'};;`;
  }
}

export function labelForFields(fields: QrFields): string {
  switch (fields.type) {
    case 'text':
      return fields.text.slice(0, 40) || 'Text code';
    case 'url':
      return fields.url;
    case 'phone':
      return fields.phone;
    case 'email':
      return fields.email;
    case 'wifi':
      return fields.ssid || 'Wi-Fi network';
  }
}

export async function getQrHistory(): Promise<QrHistoryItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.qrHistory);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QrHistoryItem[];
  } catch {
    return [];
  }
}

export async function addQrHistoryItem(
  item: Omit<QrHistoryItem, 'id' | 'createdAt'>,
): Promise<QrHistoryItem[]> {
  const history = await getQrHistory();
  const next: QrHistoryItem = { ...item, id: generateId(), createdAt: Date.now() };
  const updated = [next, ...history].slice(0, 100);
  await AsyncStorage.setItem(STORAGE_KEYS.qrHistory, JSON.stringify(updated));
  return updated;
}

export async function removeQrHistoryItem(id: string): Promise<QrHistoryItem[]> {
  const history = await getQrHistory();
  const updated = history.filter((entry) => entry.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.qrHistory, JSON.stringify(updated));
  return updated;
}

export async function clearQrHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.qrHistory);
}
