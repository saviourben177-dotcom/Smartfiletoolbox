import { useThemeContext } from '@/context/ThemeContext';

/**
 * Returns the active semantic color palette (light or dark, following the
 * user's theme preference from Settings, defaulting to the system scheme).
 */
export function useColors() {
  return useThemeContext().colors;
}

export default useColors;
