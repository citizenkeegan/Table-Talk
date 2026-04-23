import React from 'react';
import { Pressable, Text, StyleSheet, Platform, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors, Radius, Spacing, FontFamily, FontSize } from '../../constants/DesignTokens';

interface ClayButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'mauve';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export default function ClayButton({ label, onPress, variant = 'primary', disabled, loading, style, fullWidth }: ClayButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const buttonStyle = [
    styles.button,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'mauve' && styles.mauve,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  return (
    <Animated.View style={[animatedStyle, fullWidth && styles.fullWidth]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={buttonStyle as StyleProp<ViewStyle>}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'secondary' ? Colors.ink : Colors.ink} size="small" />
        ) : (
          <Text style={[styles.label, variant === 'secondary' && styles.labelSecondary]}>
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const primaryWebShadow = Platform.select({
  web: {
    // @ts-ignore
    boxShadow: '0 6px 16px rgba(157,176,137,0.40), inset 0 1px 2px rgba(255,255,255,0.60), inset 0 -2px 4px rgba(0,0,0,0.12)',
  },
  default: {
    shadowColor: Colors.sage,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
});

const secondaryWebShadow = Platform.select({
  web: {
    // @ts-ignore
    boxShadow: '0 4px 12px rgba(0,0,0,0.06), inset 0 1px 2px rgba(255,255,255,0.90)',
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
});

const mauveWebShadow = Platform.select({
  web: {
    // @ts-ignore
    boxShadow: '0 6px 16px rgba(176,146,137,0.40), inset 0 1px 2px rgba(255,255,255,0.60), inset 0 -2px 4px rgba(0,0,0,0.12)',
  },
  default: {
    shadowColor: Colors.mauve,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
});

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: Colors.sage,
    borderWidth: 1.5,
    borderColor: Colors.sageDark,
    ...primaryWebShadow,
  },
  secondary: {
    backgroundColor: Colors.whiteClay,
    borderWidth: 1.5,
    borderColor: Colors.mist,
    ...secondaryWebShadow,
  },
  mauve: {
    backgroundColor: Colors.mauve,
    borderWidth: 1.5,
    borderColor: Colors.mauveDark,
    ...mauveWebShadow,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.subheading,
    color: Colors.ink,
  },
  labelSecondary: {
    color: Colors.ink,
  },
});
