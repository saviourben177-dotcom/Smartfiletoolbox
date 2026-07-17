import { useCallback, useEffect, useState } from 'react';
import type { PermissionResult } from '@/services/permissionsService';

export function usePermission(
  getStatus: () => Promise<PermissionResult>,
  requestStatus: () => Promise<PermissionResult>,
) {
  const [status, setStatus] = useState<PermissionResult | 'checking'>('checking');

  const refresh = useCallback(async () => {
    setStatus(await getStatus());
  }, [getStatus]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const request = useCallback(async () => {
    const result = await requestStatus();
    setStatus(result);
    return result;
  }, [requestStatus]);

  return { status, request, refresh };
}
