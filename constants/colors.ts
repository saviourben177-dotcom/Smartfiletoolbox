/**
 * Semantic design tokens for Smart File Toolbox.
 *
 * Palette: white surfaces with a confident material green accent.
 * Every component should reference these tokens via useColors() instead
 * of hardcoding hex values.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#0F1A14',
    tint: '#16A34A',

    // Core surfaces
    background: '#FAFCFA',
    foreground: '#0F1A14',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#0F1A14',

    // Primary action color (buttons, links, active states)
    primary: '#16A34A',
    primaryForeground: '#FFFFFF',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#EAF4EC',
    secondaryForeground: '#0F1A14',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#F0F4F1',
    mutedForeground: '#657167',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#E4F7E9',
    accentForeground: '#0E7A38',

    // Destructive actions (delete, error states)
    destructive: '#DC2626',
    destructiveForeground: '#FFFFFF',

    // Success / warning semantics used by status badges and toasts
    success: '#16A34A',
    warning: '#D97706',

    // Borders and input outlines
    border: '#E3EAE4',
    input: '#E3EAE4',
  },

  dark: {
    text: '#EDF5EF',
    tint: '#34D368',

    background: '#0B1210',
    foreground: '#EDF5EF',

    card: '#121C17',
    cardForeground: '#EDF5EF',

    primary: '#34D368',
    primaryForeground: '#08150D',

    secondary: '#182620',
    secondaryForeground: '#EDF5EF',

    muted: '#182620',
    mutedForeground: '#8FA79A',

    accent: '#16301F',
    accentForeground: '#5BE28C',

    destructive: '#F87171',
    destructiveForeground: '#210808',

    success: '#34D368',
    warning: '#F2B347',

    border: '#1E2C25',
    input: '#1E2C25',
  },

  // Border radius (in px), applied to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
