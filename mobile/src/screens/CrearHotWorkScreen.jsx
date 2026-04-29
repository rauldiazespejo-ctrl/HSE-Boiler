import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, ScrollView, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import Button from '../components/Button';
import { ArrowLeft } from 'lucide-react-native';
import { api } from '../services/api';

const CrearHotWorkScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tipo: 'SMAW',
    material: 'Acero',
    espesor: '5',
    zona: 'Sector Soldadura',
    horaInicio: '08:30',
    horaFin: '11:00'
  const handleNext = async () => {
    setLoading(true);
    try {
      // In a real flow, this goes to Step 2. Here we submit it as MVP testing.
      const payload = {
        tipo_documento: 'HOT_WORK',
        sector: form.zona,
        empresa_id: 1,
        contenido_json: form,
        riesgos_json: {}
      };
      
      const response = await api.createDocumento(payload);
      if (response.success) {
        Alert.alert('Éxito', 'Documento creado correctamente', [
          { text: 'OK', onPress: () => navigation.navigate('LiderDashboard') }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo crear el documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ArrowLeft color={COLORS.textPrimary} size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>HOT WORK</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Paso 1 de 4: Identificación</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de soldadura / corte *</Text>
            <TextInput 
              style={styles.input} 
              value={form.tipo}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Material base *</Text>
            <TextInput 
              style={styles.input} 
              value={form.material}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
              <Text style={styles.label}>Espesor (mm) *</Text>
              <TextInput 
                style={styles.input} 
                value={form.espesor}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.sm }]}>
              <Text style={styles.label}>Zona *</Text>
              <TextInput 
                style={styles.input} 
                value={form.zona}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
              <Text style={styles.label}>Hora Inicio *</Text>
              <TextInput 
                style={styles.input} 
                value={form.horaInicio}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.sm }]}>
              <Text style={styles.label}>Hora Fin *</Text>
              <TextInput 
                style={styles.input} 
                value={form.horaFin}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Siguiente / Enviar" onPress={handleNext} loading={loading} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
  },
  content: {
    padding: SPACING.lg,
  },
  progressContainer: {
    marginBottom: SPACING.xl,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  form: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 8,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.body,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  }
});

export default CrearHotWorkScreen;
