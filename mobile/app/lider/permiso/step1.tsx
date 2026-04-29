import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Switch, Alert, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { colors, radius } from '../../../src/theme/colors';
import { ArrowLeft, ArrowRight, ChevronDown, ShieldAlert, Camera } from 'lucide-react-native';
import { PermisoContext, TipoPermiso } from '../../../src/context/PermisoContext';

export default function PermisoStep1() {
  const { tipo } = useLocalSearchParams<{ tipo: TipoPermiso }>();
  const { data, updateData, initPermiso } = React.useContext(PermisoContext);

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
    return false;
  };

  const renderSwitch = (label: string, key: string) => {
    const control = data.detalles?.[key] || { verificado: false };
    return (
      <View style={styles.switchRow}>
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => handlePickImage(key)} style={styles.cameraBtn}>
            <Camera color={control.fotoBase64 ? colors.status.success : colors.text.secondary} size={20} />
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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tipo.replace('_', ' ')}</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>1/4</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.alertBox}>
          <ShieldAlert color={colors.status.warning} size={24} />
          <Text style={styles.alertText}>
            Este permiso ({tipo.replace('_', ' ')}) requiere autorización del Jefe de Turno antes de iniciar cualquier labor.
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zona de Trabajo</Text>
            <TouchableOpacity style={styles.dropdownInput} onPress={() => updateData({ zona: 'Sector Soldadura' })}>
              <Text style={data.zona ? styles.inputText : styles.placeholderText}>
                {data.zona || 'Seleccionar sector... (Toca para Sector)'}
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
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.warning + '20',
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.status.warning + '50',
    marginBottom: 24,
    gap: 12,
  },
  alertText: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
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
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
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
  switchLabel: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
    marginRight: 16,
    lineHeight: 20,
  },
  cameraBtn: {
    marginRight: 12,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.full,
  },
});
