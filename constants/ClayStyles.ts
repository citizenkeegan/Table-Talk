import { Platform, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from './DesignTokens';

export type ClayVariant = 'base' | 'sage' | 'mauve' | 'periwinkle';

// Web-only multi-layer box-shadow strings
const webShadows: Record<ClayVariant, string> = {
  base: `
    0 8px 32px rgba(0,0,0,0.10),
    0 2px 8px rgba(0,0,0,0.06),
    inset 0 2px 4px rgba(255,255,255,0.80),
    inset 0 -2px 4px rgba(0,0,0,0.06)
  `,
  sage: `
    0 8px 32px rgba(157,176,137,0.35),
    0 2px 8px rgba(0,0,0,0.08),
    inset 0 2px 4px rgba(255,255,255,0.40),
    inset 0 -2px 6px rgba(0,0,0,0.10)
  `,
  mauve: `
    0 8px 32px rgba(176,146,137,0.35),
    0 2px 8px rgba(0,0,0,0.08),
    inset 0 2px 4px rgba(255,255,255,0.40),
    inset 0 -2px 6px rgba(0,0,0,0.10)
  `,
  periwinkle: `
    0 8px 32px rgba(137,146,176,0.35),
    0 2px 8px rgba(0,0,0,0.08),
    inset 0 2px 4px rgba(255,255,255,0.40),
    inset 0 -2px 6px rgba(0,0,0,0.10)
  `,
};

const webHoverShadows: Record<ClayVariant, string> = {
  base: `
    0 16px 48px rgba(0,0,0,0.12),
    0 4px 12px rgba(0,0,0,0.08),
    inset 0 2px 4px rgba(255,255,255,0.80),
    inset 0 -2px 4px rgba(0,0,0,0.06)
  `,
  sage: `
    0 16px 48px rgba(157,176,137,0.50),
    0 4px 12px rgba(0,0,0,0.10),
    inset 0 2px 4px rgba(255,255,255,0.50),
    inset 0 -2px 8px rgba(0,0,0,0.12)
  `,
  mauve: `
    0 16px 48px rgba(176,146,137,0.50),
    0 4px 12px rgba(0,0,0,0.10),
    inset 0 2px 4px rgba(255,255,255,0.50),
    inset 0 -2px 8px rgba(0,0,0,0.12)
  `,
  periwinkle: `
    0 16px 48px rgba(137,146,176,0.50),
    0 4px 12px rgba(0,0,0,0.10),
    inset 0 2px 4px rgba(255,255,255,0.50),
    inset 0 -2px 8px rgba(0,0,0,0.12)
  `,
};

const backgrounds: Record<ClayVariant, string | string[]> = {
  base: Colors.whiteClay,
  sage: Colors.sage,
  mauve: Colors.mauve,
  periwinkle: Colors.periwinkle,
};

const borders: Record<ClayVariant, string> = {
  base: Colors.mist,
  sage: Colors.sageDark,
  mauve: Colors.mauveDark,
  periwinkle: Colors.periwinkleDark,
};

/**
 * Returns a StyleSheet-compatible style object for the given clay variant.
 * On web: uses the full multi-layer box-shadow.
 * On native: falls back to standard shadow props.
 */
export function getClayStyle(variant: ClayVariant = 'base'): ViewStyle {
  const nativeShadow: ViewStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: variant === 'base' ? 0.10 : 0.15,
    shadowRadius: 12,
    elevation: 6,
  };

  return Platform.select({
    web: {
      background: backgrounds[variant],
      borderWidth: 1.5,
      borderColor: borders[variant],
      // @ts-ignore — web-only CSS property
      boxShadow: webShadows[variant],
    } as ViewStyle,
    default: {
      backgroundColor: backgrounds[variant] as string,
      borderWidth: 1.5,
      borderColor: borders[variant],
      ...nativeShadow,
    } as ViewStyle,
  }) as ViewStyle;
}

export function getClayHoverStyle(variant: ClayVariant = 'base'): object {
  return Platform.select({
    web: {
      boxShadow: webHoverShadows[variant],
      transform: 'translateY(-3px) scale(1.01)',
    },
    default: {
      shadowOpacity: 0.20,
      shadowRadius: 20,
      elevation: 10,
    },
  }) ?? {};
}
