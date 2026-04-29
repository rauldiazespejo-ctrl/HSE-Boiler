import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true }).start();
  };

  const getGradientColors = (): [string, string] => {
    if (disabled) return ['#2D3344', '#1E2330'];
    switch (variant) {
      case 'primary':   return colors.primary.gradient;
      case 'secondary': return colors.secondary.gradient;
      case 'danger':    return colors.gradients.danger;
      case 'success':   return colors.gradients.success;
      default:          return ['transparent', 'transparent'];
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.text.disabled;
    switch (variant) {
      case 'outline': return colors.primary.light;
      case 'ghost':   return colors.text.secondary;
      default:        return '#FFFFFF';
    }
  };

  const sizeMap = {
    sm: { paddingVertical: 8,  paddingHorizontal: 16, minHeight: 36, fontSize: 13 },
    md: { paddingVertical: 14, paddingHorizontal: 24, minHeight: 50, fontSize: 15 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, minHeight: 56, fontSize: 17 },
  };

  const isGradient = ['primary', 'secondary', 'danger', 'success'].includes(variant);

  const innerContent = (
    <View style={styles.contentRow}>
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left'  && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.text, { fontSize: sizeMap[size].fontSize, color: getTextColor() }, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </>
      )}
    </View>
  );

  const { paddingVertical, paddingHorizontal, minHeight } = sizeMap[size];

  if (isGradient) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || isLoading}
          activeOpacity={0.85}
          style={[styles.container, disabled ? {} : shadows.glow(getGradientColors()[0])]}
        >
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { paddingVertical, paddingHorizontal, minHeight }]}
          >
            {innerContent}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  const borderStyle = variant === 'outline'
    ? { borderWidth: 1.5, borderColor: colors.primary.main + '60' }
    : {};

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
        style={[
          styles.container,
          borderStyle,
          { backgroundColor: 'transparent', paddingVertical, paddingHorizontal, minHeight },
        ]}
      >
        {innerContent}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  iconLeft:  { marginRight: 8 },
  iconRight: { marginLeft: 8 },
});
