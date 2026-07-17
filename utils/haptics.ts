import * as Haptics from 'expo-haptics';
import { loadSettings } from '@/services/settingsService';

/**
 * Whether haptics are currently enabled, mirrored from AsyncStorage-backed
 * settings so every button press doesn't need to read storage itself.
 * Starts `true` (matches DEFAULT_SETTINGS) so early taps before the async
 * load resolves still feel responsive; corrected to the real value as soon
 * as settings load, and kept in sync by setHapticsEnabledCache whenever the
 * user changes the Settings toggle.
 */
let hapticsEnabledCache = true;

loadSettings().then((settings) => {
  hapticsEnabledCache = settings.hapticsEnabled;
});

/** Called by useSettings.update so the cache reflects toggle changes immediately. */
export function setHapticsEnabledCache(enabled: boolean): void {
  hapticsEnabledCache = enabled;
}

/** Fires a light impact haptic, but only if the user hasn't disabled it in Settings. */
export function triggerLightHaptic(): void {
  if (!hapticsEnabledCache) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}
