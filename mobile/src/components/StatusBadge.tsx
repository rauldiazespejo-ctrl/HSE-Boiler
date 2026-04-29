import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';

type StatusType = 'aprobado' | 'pendiente' | 'rechazado' | 'critico' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'aprobado':
        return { bg: 'rgba(16, 185, 129, 0.2)', text: colors.status.success, defaultLabel: 'APROBADO' };
      case 'rechazado':
      case 'critico':
        return { bg: 'rgba(239, 68, 68, 0.2)', text: colors.status.danger, defaultLabel: status.toUpperCase() };
      case 'pendiente':
        return { bg: 'rgba(245, 158, 11, 0.2)', text: colors.status.warning, defaultLabel: 'PENDIENTE' };
      case 'info':
      default:
        return { bg: 'rgba(59, 130, 246, 0.2)', text: colors.status.info, defaultLabel: 'INFO' };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>
        {label || config.defaultLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
