import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'large', 
  loading = false, 
  disabled = false,
  style 
}) => {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  
  let gradientColors = [COLORS.surfaceLight, COLORS.surface];
  if (isPrimary) gradientColors = [COLORS.primary, COLORS.primaryDark];
  if (isDanger) gradientColors = [COLORS.danger, '#DC2626']; // Red 600

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.container, 
          size === 'small' ? styles.small : styles.large,
          variant === 'outline' && styles.outline
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'outline' ? COLORS.primary : '#FFF'} />
        ) : (
          <Text style={[
            styles.text, 
            variant === 'outline' && styles.textOutline
          ]}>
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 56,
  },
  small: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 40,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  text: {
    ...TYPOGRAPHY.button,
    color: '#FFF',
  },
  textOutline: {
    color: COLORS.primary,
  }
});

export default Button;
