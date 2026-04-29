import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../../src/components/Button';
import { colors, radius } from '../../../src/theme/colors';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
import { PermisoContext } from '../../../src/context/PermisoContext';

const RIESGOS_HOT_WORK = [
  { id: '1', label: 'Quemaduras por arco eléctrico o llama' },
  { id: '2', label: 'Incendio por proyección de chispas' },
  { id: '3', label: 'Inhalación de humos metálicos' },
  { id: '4', label: 'Radiación UV e IR' },
  { id: '5', label: 'Choque eléctrico' },
  { id: '6', label: 'Proyección de partículas a los ojos' },
  { id: '7', label: 'Explosión por gases combustibles' }
];

const RIESGOS_ALTURA = [
  { id: 'a1', label: 'Caída a distinto nivel' },
  { id: 'a2', label: 'Caída de objetos o herramientas' },
  { id: 'a3', label: 'Falla del arnés o línea de vida' },
  { id: 'a4', label: 'Colapso de andamio o estructura' },
  { id: 'a5', label: 'Contacto con líneas eléctricas aéreas' },
  { id: 'a6', label: 'Exposición a vientos fuertes' }
];

const RIESGOS_PUENTE_GRUA = [
  { id: 'g1', label: 'Caída de carga suspendida' },
  { id: 'g2', label: 'Atrapamiento por carga o eslingas' },
  { id: 'g3', label: 'Golpeado por carga en movimiento' },
  { id: 'g4', label: 'Falla de accesorios de izaje' },
  { id: 'g5', label: 'Sobrecarga del equipo' },
  { id: 'g6', label: 'Contacto eléctrico' }
];

export default function PermisoStep2() {
  const { data, updateData } = React.useContext(PermisoContext);

  const getRiesgosList = () => {
    if (data.tipoPermiso === 'ALTURA') return RIESGOS_ALTURA;
    if (data.tipoPermiso === 'PUENTE_GRUA') return RIESGOS_PUENTE_GRUA;
    return RIESGOS_HOT_WORK;
  };

  const RIESGOS = getRiesgosList();

  const toggleRisk = (id: string) => {
    const selectedRisks = data.riesgosSeleccionados || [];
    if (selectedRisks.includes(id)) {
      updateData({ riesgosSeleccionados: selectedRisks.filter(r => r !== id) });
    } else {
      updateData({ riesgosSeleccionados: [...selectedRisks, id] });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {data.tipoPermiso === 'HOT_WORK' ? 'Hot Work' : data.tipoPermiso === 'ALTURA' ? 'Trabajo en Altura' : data.tipoPermiso === 'PUENTE_GRUA' ? 'Puente Grúa' : data.tipoPermiso === 'INSPECCION' ? 'Inspección' : 'PERMISO'}
        </Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>2/4</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '50%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Análisis de Riesgos</Text>
        <Text style={styles.subtitle}>Seleccione los riesgos presentes en la actividad</Text>

        <View style={styles.risksList}>
          {RIESGOS.map((riesgo) => {
            const isSelected = data.riesgosSeleccionados?.includes(riesgo.id);
            return (
              <TouchableOpacity 
                key={riesgo.id} 
                style={[styles.riskItem, isSelected && styles.riskItemSelected]}
                onPress={() => toggleRisk(riesgo.id)}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Check color="#FFF" size={16} />}
                </View>
                <Text style={styles.riskLabel}>{riesgo.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Siguiente" 
          icon={<ArrowRight color="#FFF" size={20} />}
          onPress={() => router.push('/lider/permiso/step3')} 
          disabled={(data.riesgosSeleccionados?.length || 0) === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepIndicator: {
    backgroundColor: colors.primary.main + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  stepText: {
    color: colors.primary.main,
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  alertContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  alertText: {
    color: colors.text.primary,
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  risksList: {
    gap: 12,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.border.light,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 2,
  },
  riskItemSelected: {
    borderColor: colors.primary.main,
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  riskLabel: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
