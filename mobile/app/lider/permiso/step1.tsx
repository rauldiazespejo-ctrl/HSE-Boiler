import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { colors, radius } from '../../../src/theme/colors';
import { ArrowLeft, ArrowRight, ChevronDown, ShieldAlert } from 'lucide-react-native';
import { PermisoContext, TipoPermiso } from '../../../src/context/PermisoContext';

export default function PermisoStep1() {
  const { tipo } = useLocalSearchParams<{ tipo: TipoPermiso }>();
  const { data, updateData, initPermiso } = React.useContext(PermisoContext);

  useEffect(() => {
    if (tipo) {
      initPermiso(tipo);
    }
  }, [tipo]);

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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Soldadura / Trabajo</Text>
            <TouchableOpacity style={styles.dropdownInput} onPress={() => updateData({ tipo: 'SMAW' })}>
              <Text style={data.tipo ? styles.inputText : styles.placeholderText}>
                {data.tipo || 'Seleccionar tipo... (Toca para SMAW)'}
              </Text>
              <ChevronDown color={colors.text.secondary} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Material Base</Text>
            <TouchableOpacity style={styles.dropdownInput} onPress={() => updateData({ material: 'Acero Inox' })}>
              <Text style={data.material ? styles.inputText : styles.placeholderText}>
                {data.material || 'Seleccionar material... (Toca para Acero)'}
              </Text>
              <ChevronDown color={colors.text.secondary} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Espesor (mm)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: 5"
              placeholderTextColor={colors.text.disabled}
              keyboardType="numeric"
              value={data.espesor}
              onChangeText={(text) => updateData({ espesor: text })}
            />
          </View>

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
          disabled={!data.tipo || !data.material || !data.espesor || !data.zona}
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
});
