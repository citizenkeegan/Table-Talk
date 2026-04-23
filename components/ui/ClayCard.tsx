import React, { useState } from 'react';
import { Pressable, View, StyleSheet, Platform, ViewStyle, StyleProp } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { getClayStyle, ClayVariant } from '../../constants/ClayStyles';
import { Radius, Spacing } from '../../constants/DesignTokens';

interface ClayCardProps {
  variant?: ClayVariant;
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}

// ── Pressable (clickable) version — has spring + hover ──────────────────────
function PressableClayCard({ variant, children, onPress, style, padding }: Required<Pick<ClayCardProps, 'onPress'>> & ClayCardProps) {
  const scale = useSharedValue(1);
  const [isHovered, setIsHovered] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const clayStyle = getClayStyle(variant ?? 'base');
  const containerStyle = [
    styles.card,
    { padding: padding ?? Spacing.lg },
    clayStyle,
    Platform.OS === 'web' && isHovered ? styles.hovered : null,
    style,
  ];

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }); }}
        // @ts-ignore — web-only hover events
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={containerStyle as StyleProp<ViewStyle>}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ── Static (non-clickable) version — plain View, zero animation ──────────────
function StaticClayCard({ variant, children, style, padding }: ClayCardProps) {
  const clayStyle = getClayStyle(variant ?? 'base');
  return (
    <View style={[
      styles.card,
      { padding: padding ?? Spacing.lg },
      clayStyle,
      style,
    ] as StyleProp<ViewStyle>}>
      {children}
    </View>
  );
}

// ── Public export — routes to the correct implementation ─────────────────────
export default function ClayCard({ onPress, ...props }: ClayCardProps) {
  if (onPress) {
    return <PressableClayCard onPress={onPress} {...props} />;
  }
  return <StaticClayCard {...props} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  hovered: Platform.select({
    web: {
      // @ts-ignore
      transform: 'translateY(-3px) scale(1.005)',
      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    default: {},
  }) ?? {},
});
