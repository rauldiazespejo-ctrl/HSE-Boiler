import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
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
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getGradientColors = () => {
    if (disabled) return ['#334155', '#1E293B'];
    switch (variant) {
      case 'primary': return colors.primary.gradient;
      case 'secondary': return colors.secondary.gradient;
      case 'danger': return colors.gradients.danger;
      default: return ['transparent', 'transparent'];
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.text.disabled;
    if (variant === 'outline' || variant === 'ghost') return colors.text.primary;
    return '#FFFFFF';
  };

  const buttonSizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 },
    md: { paddingVertical: 14, paddingHorizontal: 24, minHeight: 48 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, minHeight: 56 },
  };

  const textSizes = {
    sm: { fontSize: 13 },
    md: { fontSize: 15 },
    lg: { fontSize: 17 },
  };

  const isGradient = ['primary', 'secondary', 'danger'].includes(variant);

  const innerContent = (
    <>
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && <TouchableOpacity disabled style={styles.iconContainer}>{icon}</TouchableOpacity>}
          <Text style={[styles.text, textSizes[size], { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </>
  );

  if (isGradient) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || isLoading}
          activeOpacity={0.8}
          style={[styles.container, shadows.glow(getGradientColors()[0])]}
        >
          <LinearGradient
            colors={getGradientColors() as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, buttonSizeStyles[size]]}
          >
            {innerContent}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Estilos para outline o ghost
  const borderStyle = variant === 'outline' ? { borderWidth: 1, borderColor: colors.border.medium } : {};
  const bgStyle = variant === 'ghost' ? { backgroundColor: 'transparent' } : { backgroundColor: 'transparent' };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
        style={[styles.container, borderStyle, bgStyle, buttonSizeStyles[size]]}
      >
        <TouchableOpacity disabled style={styles.contentRow}>
           {innerContent}
        </TouchableOpacity>
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
    letterSpacing: 0.3,
  },
  iconContainer: {
    marginRight: 8,
  },
});
