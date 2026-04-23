import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '../../constants/DesignTokens';

type TagColor = 'sage' | 'mauve' | 'periwinkle' | 'urgent' | 'neutral';

const colorMap: Record<TagColor, { bg: string; text: string; border: string }> = {
  sage:       { bg: Colors.sageLight,        text: Colors.ink,           border: Colors.sageDark },
  mauve:      { bg: Colors.mauveLight,       text: Colors.ink,           border: Colors.mauveDark },
  periwinkle: { bg: Colors.periwinkleLight,  text: Colors.ink,           border: Colors.periwinkleDark },
  // urgentDark (#991B1B) gives 6.80:1 on urgentBg — WCAG AA ✅
  urgent:     { bg: Colors.urgentBg,         text: Colors.urgentDark,    border: Colors.urgentDark },
  neutral:    { bg: Colors.mist,             text: Colors.ink,           border: Colors.mist },
};

interface ClayTagProps {
  label: string;
  color?: TagColor;
}

export default function ClayTag({ label, color = 'neutral' }: ClayTagProps) {
  const { bg, text, border } = colorMap[color];
  return (
    <View style={[styles.tag, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.label,
  },
});
