import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';
import { loadSettings, saveSettings } from '@/services/settingsService';
import type { ThemePreference } from '@/types/settings';

type Palette = typeof colors.light;

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  resolvedScheme: 'light' | 'dark';
  colors: Palette & { radius: number };
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadSettings().then((settings) => {
      if (!mounted) return;
      setPreferenceState(settings.themePreference);
      setIsReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    loadSettings().then((settings) => saveSettings({ ...settings, themePreference: next }));
  };

  const resolvedScheme: 'light' | 'dark' =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      setPreference,
      resolvedScheme,
      colors: { ...colors[resolvedScheme], radius: colors.radius },
      isReady,
    }),
    [preference, resolvedScheme, isReady],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within a ThemeProvider');
  return ctx;
}
