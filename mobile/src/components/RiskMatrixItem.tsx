import React, from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius } from '../theme/colors';
import { Check } from 'lucide-react-native'; // Asegúrate de tener lucide-react-native instalado

interface RiskMatrixItemProps {
  riesgo: string;
  probabilidad: number;
  severidad: number;
  nivel: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  control: string;
  seleccionado: boolean;
  onToggle: () => void;
}

export const RiskMatrixItem: React.FC<RiskMatrixItemProps> = ({
  riesgo,
  probabilidad,
  severidad,
  nivel,
  control,
  seleccionado,
  onToggle,
}) => {
  const getNivelColor = () => {
    switch (nivel) {
      case 'CRITICO': return colors.status.danger;
      case 'ALTO': return '#EA580C'; // Naranja oscuro
      case 'MEDIO': return colors.status.warning;
      case 'BAJO': return colors.status.success;
      default: return colors.text.secondary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onToggle}
      style={[
        styles.container,
        seleccionado && styles.containerSelected
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.riesgoTitle}>{riesgo}</Text>
          <View style={[styles.badge, { backgroundColor: getNivelColor() + '20' }]}>
            <Text style={[styles.badgeText, { color: getNivelColor() }]}>{nivel}</Text>
          </View>
        </View>
        <View style={[styles.checkbox, seleccionado && styles.checkboxSelected]}>
          {seleccionado && <Check size={16} color="#FFF" />}
        </View>
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statText}>P: {probabilidad}</Text>
        <Text style={styles.statText}>S: {severidad}</Text>
        <Text style={styles.statText}>R: {probabilidad * severidad}</Text>
      </View>

      <View style={styles.controlContainer}>
        <Text style={styles.controlLabel}>Control:</Text>
        <Text style={styles.controlText}>{control}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  containerSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '10',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  riesgoTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkboxSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statText: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  controlContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: radius.sm,
  },
  controlLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  controlText: {
    color: colors.text.primary,
    fontSize: 14,
  },
});
