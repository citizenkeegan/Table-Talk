import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontFamily, FontSize } from '../../constants/DesignTokens';

// Deterministic color assignment per player name
const PLAYER_COLORS = [
  Colors.sage, Colors.mauve, Colors.periwinkle,
  Colors.sageLight, Colors.mauveLight, Colors.periwinkleLight,
];

function getPlayerColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PLAYER_COLORS[Math.abs(hash) % PLAYER_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface PlayerDotProps {
  name: string;
  size?: 'sm' | 'md';
  color?: string;
  showBorder?: boolean;
}

export default function PlayerDot({ name, size = 'md', color, showBorder = false }: PlayerDotProps) {
  const bgColor = color ?? getPlayerColor(name);
  const dim = size === 'sm' ? 22 : 38;
  const fontSize = size === 'sm' ? 9 : 14;

  return (
    <View style={[
      styles.dot,
      {
        width: dim,
        height: dim,
        borderRadius: dim / 2,
        backgroundColor: bgColor,
      },
      showBorder && styles.border,
    ]}>
      <Text style={[styles.initials, { fontSize }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

// Stacked row of player dots
interface PlayerDotStackProps {
  names: string[];
  max?: number;
  size?: 'sm' | 'md';
}

export function PlayerDotStack({ names, max = 5, size = 'md' }: PlayerDotStackProps) {
  const visible = names.slice(0, max);
  const overflow = names.length - max;
  const offset = size === 'sm' ? -6 : -10;

  return (
    <View style={styles.stack}>
      {visible.map((name, i) => (
        <View key={name + i} style={{ marginLeft: i === 0 ? 0 : offset, zIndex: visible.length - i }}>
          <PlayerDot name={name} size={size} showBorder />
        </View>
      ))}
      {overflow > 0 && (
        <View style={[
          styles.dot, styles.overflow,
          { width: size === 'sm' ? 22 : 38, height: size === 'sm' ? 22 : 38, borderRadius: size === 'sm' ? 11 : 19 },
          { marginLeft: offset },
        ]}>
          <Text style={[styles.initials, { fontSize: size === 'sm' ? 9 : 12 }]}>+{overflow}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  border: {
    borderWidth: 2,
    borderColor: Colors.whiteClay,
  },
  initials: {
    color: Colors.ink,
    fontFamily: FontFamily.bold,
  },
  stack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overflow: {
    backgroundColor: Colors.mist,
  },
});
