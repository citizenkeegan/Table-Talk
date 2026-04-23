// ============================================================
// Table Talk — Design Tokens
// Single source of truth for all design values.
// All color pairs have been WCAG AA audited (≥ 4.5:1 normal text, ≥ 3:1 large text).
// ============================================================

export const Colors = {
  // Primary palette
  // Contrast vs ink (#2D2D2E): sage 5.90:1 ✅, mauve 4.79:1 ✅, periwinkle 5.49:1 ✅
  sage:               '#9DB089',
  sageLight:          '#C5D4BC',  // ink on sageLight: 8.86:1 ✅
  sageDark:           '#8AA876',
  sageGradientTop:    '#A8C09A',

  mauve:              '#B09289',
  mauveLight:         '#D4C0BA',  // ink on mauveLight: 7.89:1 ✅
  mauveDark:          '#9C7F78',
  mauveGradientTop:   '#BF9E98',

  // Periwinkle lightened from #8992B0 → #9BA3BE
  // Old: ink on #8992B0 = 4.46:1 ❌ | New: ink on #9BA3BE = 5.49:1 ✅
  periwinkle:         '#9BA3BE',
  periwinkleLight:    '#C4CAE0',  // ink on periwinkleLight: 8.54:1 ✅
  periwinkleDark:     '#7680A0',
  periwinkleGradientTop: '#A4ADCA',

  // Neutral palette
  cream:              '#F5F0EA',  // ink on cream: 12.14:1 ✅
  ink:                '#2D2D2E',
  mist:               '#E8E3DC',  // ink on mist: 10.78:1 ✅
  whiteClay:          '#FDFAF7',  // ink on whiteClay: 13.23:1 ✅

  // Semantic
  // urgentDark used for text on urgentBg: #991B1B on #fee2e2 = 6.80:1 ✅
  urgent:             '#dc2626',  // use only as indicator/icon, not body text
  urgentDark:         '#991B1B',  // use for text on urgentBg ✅
  urgentBg:           '#fee2e2',

  confirmed:          '#166534',  // ink-dark green
  confirmedBg:        '#dcfce7',
};

export const Radius = {
  xs: 12,
  sm: 16,
  md: 20,
  card: 28,
  cardLg: 32,
  pill: 9999,
};

export const Spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  display: 32,
  heading: 22,
  subheading: 16,
  body: 14,
  label: 12,
};

export const FontFamily = {
  regular:   'PlusJakartaSans_400Regular',
  semibold:  'PlusJakartaSans_600SemiBold',
  bold:      'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};
