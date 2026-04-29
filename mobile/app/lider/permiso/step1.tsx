import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Switch, Alert, Modal, FlatList } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { colors, radius } from '../../../src/theme/colors';
import { ArrowLeft, ArrowRight, ChevronDown, ShieldAlert, Camera, CheckCircle2, X } from 'lucide-react-native';
import { PermisoContext, TipoPermiso } from '../../../src/context/PermisoContext';

const ZONAS_TRABAJO = [
  'Sector Soldadura',
  'Sector Corte',
  'Sector Pintura',
  'Taller Mecánico',
  'Patio Exterior',
  'Bodega Central',
  'Sala Máquinas',
  'Área Puente Grúa Norte',
  'Área Puente Grúa Sur',
  'Zona de Carga',
];

export default function PermisoStep1() {
  const { tipo } = useLocalSearchParams<{ tipo: TipoPermiso }>();
  const { data, updateData, initPermiso } = React.useContext(PermisoContext);
  const [zonaModalVisible, setZonaModalVisible] = useState(false);

  useEffect(() => {
    if (tipo) {
      initPermiso(tipo);
    }
  }, [tipo]);

  const updateDetalleVerificado = (key: string, verificado: boolean) => {
    const current = data.detalles?.[key] || { verificado: false };
    updateData({ detalles: { ...data.detalles, [key]: { ...current, verificado } } });
  };

  const handlePickImage = async (key: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se requiere permiso de cámara para adjuntar evidencia.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const current = data.detalles?.[key] || { verificado: false };
      updateData({ 
        detalles: { 
          ...data.detalles, 
          [key]: { ...current, fotoBase64: `data:image/jpeg;base64,${result.assets[0].base64}` } 
        } 
      });
    }
  };

  const isComplete = () => {
    if (!data.zona) return false;
    const d = data.detalles || {};
    if (tipo === 'HOT_WORK') return !!(d.areaLimpia?.verificado && d.extintor?.verificado && d.epp?.verificado);
    if (tipo === 'ALTURA') return !!(d.spdc?.verificado && d.anclajes?.verificado && d.superficie?.verificado);
    if (tipo === 'PUENTE_GRUA') return !!(d.inspeccion?.verificado && d.exclusion?.verificado && d.comunicacion?.verificado);
    if (tipo === 'INSPECCION') return !!(d.equipos?.verificado && d.epp?.verificado && d.registros?.verificado);
    return false;
  };

  const renderSwitch = (label: string, key: string) => {
    const control = data.detalles?.[key] || { verificado: false };
    return (
      <View style={styles.switchRow} key={key}>
        <View style={styles.switchLabelRow}>
          <TouchableOpacity onPress={() => handlePickImage(key)} style={[styles.cameraBtn, control.fotoBase64 && styles.cameraBtnActive]}>
            <Camera color={control.fotoBase64 ? colors.status.success : colors.text.secondary} size={18} />
          </TouchableOpacity>
          <Text style={styles.switchLabel}>{label}</Text>
        </View>
        <Switch 
          value={control.verificado}
          onValueChange={(val) => updateDetalleVerificado(key, val)}
          trackColor={{ false: colors.border.medium, true: colors.status.success }}
          thumbColor={'#FFF'}
        />
      </View>
    );
  };

  if (!tipo) return null;

  const tipoLabel: Record<string, string> = {
    HOT_WORK: 'Hot Work',
    ALTURA: 'Trabajo en Altura',
    PUENTE_GRUA: 'Puente Grúa',
    INSPECCION: 'Inspección',
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tipoLabel[tipo] || tipo.replace(/_/g, ' ')}</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>1/4</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '25%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.alertBox}>
          <ShieldAlert color={colors.status.warning} size={22} />
          <Text style={styles.alertText}>
            Este permiso requiere autorización del Jefe de Turno antes de iniciar cualquier labor.
          </Text>
        </View>

        <Card variant="solid" style={styles.formCard}>
          {tipo === 'HOT_WORK' && (
            <View style={styles.controlsGroup}>
              <Text style={styles.controlsTitle}>Controles Críticos (Go / No-Go)</Text>
              {renderSwitch('¿Área libre de inflamables y biombos/mantas ignífugas instaladas?', 'areaLimpia')}
              {renderSwitch('¿Extintor PQS inspeccionado y operativo en el punto de trabajo?', 'extintor')}
              {renderSwitch('¿EPP Específico operativo (Traje cuero completo, máscara, respirador)?', 'epp')}
            </View>
          )}

          {tipo === 'ALTURA' && (
            <View style={styles.controlsGroup}>
              <Text style={styles.controlsTitle}>Controles Críticos (Go / No-Go)</Text>
              {renderSwitch('¿SPDC (Arnés y colas) inspeccionado antes de uso?', 'spdc')}
              {renderSwitch('¿Puntos de anclaje y líneas de vida asegurados correctamente?', 'anclajes')}
              {renderSwitch('¿Superficie aprobada (Andamio con Tarjeta Verde o Alza Hombre)?', 'superficie')}
            </View>
          )}

          {tipo === 'PUENTE_GRUA' && (
            <View style={styles.controlsGroup}>
              <Text style={styles.controlsTitle}>Controles Críticos (Go / No-Go)</Text>
              {renderSwitch('¿Inspección pre-uso de Puente Grúa, ganchos y eslingas?', 'inspeccion')}
              {renderSwitch('¿Zona de izaje delimitada y libre de personal ajeno?', 'exclusion')}
              {renderSwitch('¿Mandos a distancia probados y comunicación de maniobra acordada?', 'comunicacion')}
            </View>
          )}

          {tipo === 'INSPECCION' && (
            <View style={styles.controlsGroup}>
              <Text style={styles.controlsTitle}>Verificación Inicial</Text>
              {renderSwitch('¿Equipos y maquinaria en condición segura para inspeccionar?', 'equipos')}
              {renderSwitch('¿EPP básico disponible y en buen estado?', 'epp')}
              {renderSwitch('¿Registros de mantención anteriores revisados?', 'registros')}
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zona de Trabajo</Text>
            <TouchableOpacity style={styles.dropdownInput} onPress={() => setZonaModalVisible(true)}>
              <Text style={data.zona ? styles.inputText : styles.placeholderText}>
                {data.zona || 'Seleccionar zona de trabajo...'}
              </Text>
              <ChevronDown color={colors.text.secondary} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Operador Asignado</Text>
            <TextInput
              style={[styles.textInput, styles.disabledInput]}
              value="Juan Pérez (Certificado ASME Vigente)"
              editable={false}
            />
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="SIGUIENTE" 
          icon={<ArrowRight color="#FFF" size={20} />}
          iconPosition="right"
          onPress={() => router.push('/lider/permiso/step2')} 
          disabled={!isComplete()}
        />
      </View>

      <Modal visible={zonaModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Zona</Text>
              <TouchableOpacity onPress={() => setZonaModalVisible(false)}>
                <X color={colors.text.primary} size={24} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ZONAS_TRABAJO}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.zonaItem, data.zona === item && styles.zonaItemSelected]}
                  onPress={() => {
                    updateData({ zona: item });
                    setZonaModalVisible(false);
                  }}
                >
                  <Text style={[styles.zonaItemText, data.zona === item && styles.zonaItemTextSelected]}>
                    {item}
                  </Text>
                  {data.zona === item && <CheckCircle2 color={colors.status.success} size={18} />}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  progressBar: {
    height: 3,
    backgroundColor: colors.border.light,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 2,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.warning + '15',
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.status.warning + '40',
    marginBottom: 24,
    gap: 12,
  },
  alertText: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 13,
    lineHeight: 20,
  },
  formCard: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: radius.md,
    height: 50,
    paddingHorizontal: 16,
  },
  textInput: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: radius.md,
    height: 50,
    paddingHorizontal: 16,
    color: colors.text.primary,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    color: colors.text.secondary,
    borderColor: 'transparent',
  },
  inputText: {
    color: colors.text.primary,
    fontSize: 16,
  },
  placeholderText: {
    color: colors.text.disabled,
    fontSize: 16,
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
  controlsGroup: {
    marginBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  controlsTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  switchLabelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  switchLabel: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 13,
    lineHeight: 19,
  },
  cameraBtn: {
    marginRight: 10,
    padding: 7,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cameraBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.status.success + '60',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.paper,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  zonaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  zonaItemSelected: {
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
  },
  zonaItemText: {
    color: colors.text.primary,
    fontSize: 16,
  },
  zonaItemTextSelected: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: 20,
  },
});
