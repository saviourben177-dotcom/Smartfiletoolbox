import { useCallback, useEffect, useState } from 'react';
import {
  getQrHistory,
  addQrHistoryItem,
  removeQrHistoryItem,
  clearQrHistory,
} from '@/services/qrService';
import type { QrHistoryItem } from '@/types/qr';

export function useQrHistory() {
  const [history, setHistory] = useState<QrHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setHistory(await getQrHistory());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(async (item: Omit<QrHistoryItem, 'id' | 'createdAt'>) => {
    setHistory(await addQrHistoryItem(item));
  }, []);

  const remove = useCallback(async (id: string) => {
    setHistory(await removeQrHistoryItem(id));
  }, []);

  const clear = useCallback(async () => {
    await clearQrHistory();
    setHistory([]);
  }, []);

  return { history, loading, refresh, add, remove, clear };
}
