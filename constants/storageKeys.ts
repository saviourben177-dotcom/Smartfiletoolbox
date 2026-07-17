/** AsyncStorage key namespace for Smart File Toolbox. */
export const STORAGE_KEYS = {
  settings: 'sft:settings',
  qrHistory: 'sft:qr-history',
} as const;

/** App-private working directories, created on first launch. */
export const APP_DIR_NAMES = {
  root: 'SmartFileToolbox',
  imported: 'Imported',
  output: 'Output',
  temp: 'Temp',
} as const;
