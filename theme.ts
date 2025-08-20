const sharedColors = {
  azureRadiance: '#007AFF',
  limedSpruce: '#38434D',
  cornflowerBlue: '#6366F1',
  astral: '#2E78B7',
  white: '#FFF',
  crimson: '#DC143C',
} as const;

const sharedSpacing = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
} as const;

const sharedBorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

const sharedTypography = {
  fontSizes: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
    extrablack: '950',
  },
  fontFamilies: {
    nunito: 'Nunito',
    federant: 'Federant',
  },
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const;

export const lightTheme = {
  colors: {
    ...sharedColors,
    typography: '#000000',
    background: '#F6F6F6',
    surface: '#ffffff',
    outline: '#e5e7eb',
    muted: '#6b7280',
  },
  spacing: sharedSpacing,
  borderRadius: sharedBorderRadius,
  typography: sharedTypography,
  shadows: {
    hard: {
      1: '-2px 2px 8px 0px rgba(38, 38, 38, 0.20)',
      2: '0px 3px 10px 0px rgba(38, 38, 38, 0.20)',
      3: '2px 2px 8px 0px rgba(38, 38, 38, 0.20)',
      4: '0px -3px 10px 0px rgba(38, 38, 38, 0.20)',
      5: '0px 2px 10px 0px rgba(38, 38, 38, 0.10)',
    },
    soft: {
      1: '0px 0px 10px rgba(38, 38, 38, 0.1)',
      2: '0px 0px 20px rgba(38, 38, 38, 0.2)',
      3: '0px 0px 30px rgba(38, 38, 38, 0.1)',
      4: '0px 0px 40px rgba(38, 38, 38, 0.1)',
    },
  },
} as const;

export const darkTheme = {
  colors: {
    ...sharedColors,
    typography: '#D4D4D4',
    background: '#181719',
    surface: '#1f1f1f',
    outline: '#374151',
    muted: '#9ca3af',
  },
  spacing: sharedSpacing,
  borderRadius: sharedBorderRadius,
  typography: sharedTypography,
  shadows: {
    hard: {
      1: '-2px 2px 8px 0px rgba(0, 0, 0, 0.40)',
      2: '0px 3px 10px 0px rgba(0, 0, 0, 0.40)',
      3: '2px 2px 8px 0px rgba(0, 0, 0, 0.40)',
      4: '0px -3px 10px 0px rgba(0, 0, 0, 0.40)',
      5: '0px 2px 10px 0px rgba(0, 0, 0, 0.20)',
    },
    soft: {
      1: '0px 0px 10px rgba(0, 0, 0, 0.2)',
      2: '0px 0px 20px rgba(0, 0, 0, 0.4)',
      3: '0px 0px 30px rgba(0, 0, 0, 0.2)',
      4: '0px 0px 40px rgba(0, 0, 0, 0.2)',
    },
  },
} as const;

// Types pour une meilleure type safety
export type Theme = typeof lightTheme;
export type ThemeColors = Theme['colors'];
export type ThemeSpacing = Theme['spacing'];
export type ThemeBorderRadius = Theme['borderRadius'];
export type ThemeTypography = Theme['typography'];
export type ThemeShadows = Theme['shadows'];
