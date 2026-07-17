import { useCallback, useEffect, useState } from 'react';
import { loadSettings, saveSettings } from '@/services/settingsService';
import { DEFAULT_SETTINGS, type AppSettings } from '@/types/settings';
import { setHapticsEnabledCache } from '@/utils/haptics';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings().then((loaded) => {
      setSettings(loaded);
      setLoading(false);
    });
  }, []);

  const update = useCallback(async (patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      // Buttons read haptics state from a plain module cache rather than
      // this hook (they're rendered dozens of times per screen and
      // shouldn't each subscribe to AsyncStorage-backed state), so update
      // it here to keep the toggle effective immediately rather than only
      // after the next app launch's loadSettings() call.
      if ('hapticsEnabled' in patch) setHapticsEnabledCache(next.hapticsEnabled);
      return next;
    });
  }, []);

  return { settings, loading, update };
}
