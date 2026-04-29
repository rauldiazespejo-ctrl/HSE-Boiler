import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { colors, radius } from '../../../src/theme/colors';
import { ArrowLeft, Send, PenTool, X, CheckCircle } from 'lucide-react-native';
import { PermisoContext } from '../../../src/context/PermisoContext';
import { api } from '../../../src/services/api';
import SignatureScreen from 'react-native-signature-canvas';

export default function PermisoStep4() {
  const { data, resetData, updateData } = React.useContext(PermisoContext);
  const [isSignModalVisible, setIsSignModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignature = (signature: string) => {
    updateData({ firmaLider: signature });
    setIsSignModalVisible(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/documentos', {
        tipo_documento: data.tipoPermiso?.replace('_', ' ') || 'PERMISO',
        sector: data.zona,
        contenido_json: {
          ...data.detalles,
          firma: data.firmaLider,
          anexos: data.anexos
        },
        riesgos_json: data.riesgosSeleccionados
      });

      if (response.data.success) {
        Alert.alert(
          'Documento Enviado',
          'El HOT WORK ha sido enviado a los Jefes Generales para su aprobación.',
          [{ text: 'OK', onPress: () => {
            resetData();
            router.replace('/lider');
          }}]
        );
      }
    } catch (error) {
      console.error('Error submitting document:', error);
      Alert.alert('Error', 'No se pudo enviar el documento.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{data.tipoPermiso?.replace('_', ' ') || 'PERMISO'}</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>4/4</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Firma y Envío</Text>
        <Text style={styles.subtitle}>Revise el resumen y firme digitalmente</Text>

        <Card variant="outline" style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen del Documento</Text>
          
          {Object.entries(data.detalles || {}).map(([k, v]) => (
            <View key={k} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')}:</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {v ? <CheckCircle color={colors.status.success} size={16} /> : <X color={colors.status.danger} size={16} />}
                <Text style={[styles.summaryValue, {marginLeft: 6, color: v ? colors.status.success : colors.status.danger}]}>
                  {v ? 'Verificado' : 'No verificado'}
                </Text>
              </View>
            </View>
          ))}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sector:</Text>
            <Text style={styles.summaryValue}>{data.zona || 'No especificado'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Riesgos Evaluados:</Text>
            <Text style={styles.summaryValue}>{data.riesgosSeleccionados?.length || 0} Identificados</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Evidencias (Anexos):</Text>
            <Text style={styles.summaryValue}>{data.anexos.filter(a => a.base64).length} de {data.anexos.length} Adjuntos</Text>
          </View>
        </Card>

        <View style={styles.signSection}>
          <Text style={styles.sectionTitle}>Firma del Responsable (Líder)</Text>
          <Text style={styles.legalText}>
            Al firmar este documento, certifico que he inspeccionado físicamente el área de trabajo y todos los controles requeridos están en su lugar.
          </Text>

          <View style={styles.signaturePad}>
            {data.firmaLider ? (
              <View style={styles.signedContainer}>
                <Image source={{ uri: data.firmaLider }} style={styles.signatureImage} resizeMode="contain" />
                <Text style={styles.signedStamp}>FIRMADO DIGITALMENTE</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.signActionArea} onPress={() => setIsSignModalVisible(true)}>
                <PenTool color={colors.text.secondary} size={32} />
                <Text style={styles.signHintText}>Toque aquí para dibujar su firma</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal de Firma */}
      <Modal visible={isSignModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dibuje su firma</Text>
              <TouchableOpacity onPress={() => setIsSignModalVisible(false)}>
                <X color={colors.text.primary} size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.signatureContainer}>
              <SignatureScreen
                onOK={handleSignature}
                onEmpty={() => Alert.alert('Error', 'Por favor dibuje su firma.')}
                descriptionText="Firma"
                clearText="Borrar"
                confirmText="Guardar"
                webStyle={`
                  .m-signature-pad { box-shadow: none; border: none; }
                  .m-signature-pad--body { border: 1px solid #ccc; border-radius: 8px; }
                  .m-signature-pad--footer { margin-top: 10px; }
                `}
              />
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <Button 
          title="ENVIAR A APROBACIÓN" 
          icon={<Send color="#FFF" size={20} />}
          onPress={handleSubmit} 
          disabled={!data.firmaLider}
          isLoading={isLoading}
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
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: 32,
  },
  summaryTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.medium,
    paddingBottom: 8,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureImage: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.paper,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    height: '60%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  signatureContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  summaryValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  signSection: {
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  legalText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 16,
  },
  signaturePad: {
    height: 160,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  signActionArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signHintText: {
    color: colors.text.secondary,
    marginTop: 12,
    fontSize: 14,
  },
  signedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureGraphic: {
    fontFamily: 'Cochin', // Simula fuente cursiva
    fontSize: 48,
    color: '#000',
    transform: [{ rotate: '-10deg' }],
  },
  signedStamp: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    color: colors.status.success,
    fontSize: 10,
    fontWeight: 'bold',
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
