import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';

const Badge = ({ title, status }) => {
  let backgroundColor = COLORS.surfaceLight;
  let textColor = COLORS.textPrimary;

  if (status === 'critical') {
    backgroundColor = 'rgba(239, 68, 68, 0.2)'; // Danger light
    textColor = COLORS.danger;
  } else if (status === 'warning') {
    backgroundColor = 'rgba(245, 158, 11, 0.2)'; // Warning light
    textColor = COLORS.warning;
  } else if (status === 'success') {
    backgroundColor = 'rgba(16, 185, 129, 0.2)'; // Success light
    textColor = COLORS.success;
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  }
});

export default Badge;
