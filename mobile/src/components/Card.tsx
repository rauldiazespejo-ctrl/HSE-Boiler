import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, shadows } from '../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'solid' | 'glass' | 'outline';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'solid',
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'glass':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border.light,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border.medium,
        };
      case 'solid':
      default:
        return {
          backgroundColor: colors.background.paper,
        };
    }
  };

  const content = (
    <View style={[styles.inner, getVariantStyles(), style]}>
      {children}
    </View>
  );

  const wrapperStyle = [
    styles.container,
    variant === 'solid' ? shadows.soft : null,
  ];

  if (variant === 'glass') {
    return onPress ? (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={wrapperStyle}>
        <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
          {content}
        </BlurView>
      </TouchableOpacity>
    ) : (
      <View style={wrapperStyle}>
        <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
          {content}
        </BlurView>
      </View>
    );
  }

  return onPress ? (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={wrapperStyle}>
      {content}
    </TouchableOpacity>
  ) : (
    <View style={wrapperStyle}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: 16,
  },
  blurContainer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  inner: {
    padding: 16,
    borderRadius: radius.lg,
  },
});
