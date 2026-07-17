export type ThemePreference = 'light' | 'dark' | 'system';

export interface AppSettings {
  themePreference: ThemePreference;
  language: string;
  hapticsEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  themePreference: 'system',
  language: 'en',
  hapticsEnabled: true,
};
