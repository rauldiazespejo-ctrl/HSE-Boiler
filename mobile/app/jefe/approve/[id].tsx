import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Image, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { colors, radius } from '../../../src/theme/colors';
import { ArrowLeft, CheckCircle, XCircle, PenTool, Image as ImageIcon, X, FileText, MapPin } from 'lucide-react-native';
import { api } from '../../../src/services/api';
import SignatureScreen from 'react-native-signature-canvas';
import * as Linking from 'expo-linking';

export default function JefeApproveScreen() {
  const { id } = useLocalSearchParams();
  const documentId = Array.isArray(id) ? id[0] : id;
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSignModalVisible, setIsSignModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documento, setDocumento] = useState<any>(null);
  const [loadingDoc, setLoadingDoc] = useState(true);

  const fetchDocumento = useCallback(async () => {
    try {
      const response = await api.get(`/documentos/${documentId}`);
      if (response.data.success) {
        setDocumento(response.data.data);
      }
    } catch {
      Alert.alert('Error', 'No se pudo cargar el documento');
    } finally {
      setLoadingDoc(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      fetchDocumento();
    }
  }, [documentId, fetchDocumento]);

  const handleSignature = (signature: string) => {
    setSignatureData(signature);
    setIsSignModalVisible(false);
  };

  const handleApprove = async () => {
    if (!documentId) {
      Alert.alert('Error', 'Documento inválido.');
      return;
    }
    if (!signatureData) {
      Alert.alert('Firma Requerida', 'Debe firmar el documento para aprobarlo.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(`/documentos/${documentId}/aprobar`, {
        firma: signatureData,
        comentarios: 'Aprobado sin observaciones'
      });
      if (response.data.success) {
        Alert.alert(
          'Documento Aprobado',
          `El documento ${documento?.numero_documento || documentId} ha sido aprobado exitosamente.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo aprobar el documento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!documentId) {
      Alert.alert('Error', 'Documento inválido.');
      return;
    }
    if (rejectComment.trim().length < 10) {
      Alert.alert('Justificación requerida', 'Por favor, ingrese un motivo detallado (mínimo 10 caracteres) para el rechazo.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/documentos/${documentId}/rechazar`, { comentarios: rejectComment });
      setIsRejectModalVisible(false);
      Alert.alert(
        'Documento Rechazado',
        `Se rechazó el documento ${documento?.numero_documento || documentId}.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Error', 'No se pudo rechazar el documento. Verifique su conexión.');
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
        <Text style={styles.headerTitle}>Aprobación</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loadingDoc ? (
          <ActivityIndicator size="large" color={colors.primary.main} style={{ marginTop: 50 }} />
        ) : !documento ? (
          <Text style={{ textAlign: 'center', marginTop: 50, color: colors.text.secondary }}>Documento no encontrado</Text>
        ) : (
          <>
            <View style={styles.docHeader}>
              <Text style={styles.docId}>{documento.numero_documento}</Text>
              <Text style={styles.docType}>{documento.tipo_documento} - {documento.contenido_json?.tipo || 'N/A'}</Text>
            </View>

            <Card variant="outline" style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Detalles</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Solicitante</Text>
                  <Text style={styles.infoValue}>{documento.creador?.nombre || 'Líder'}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Sector</Text>
                  <Text style={styles.infoValue}>{documento.sector}</Text>
                </View>
                {Object.entries(documento.contenido_json || {})
                  .filter(([k]) => k !== 'firma' && k !== 'anexos')
                  .map(([k, v]: [string, any]) => {
                    const isObj = typeof v === 'object' && v !== null;
                    const verificado = isObj ? v.verificado : (typeof v === 'boolean' ? v : false);
                    const foto = isObj ? v.fotoBase64 : null;
                    
                    if (typeof v === 'boolean' || (isObj && 'verificado' in v)) {
                      return (
                        <View key={k} style={[styles.infoCol, { width: '100%' }]}>
                          <Text style={styles.infoLabel}>{k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')}</Text>
                          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                              {verificado ? <CheckCircle color={colors.status.success} size={16} /> : <XCircle color={colors.status.danger} size={16} />}
                              <Text style={[styles.infoValue, {marginLeft: 6, color: verificado ? colors.status.success : colors.status.danger}]}>
                                {verificado ? 'Verificado' : 'No verificado'}
                              </Text>
                            </View>
                            {foto && (
                              <TouchableOpacity onPress={() => Alert.alert('Evidencia Fotográfica', 'Aquí se mostraría la foto en pantalla completa.')}>
                                <ImageIcon color={colors.primary.main} size={20} />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      );
                    }
                    return null;
                  })}
              </View>
            </Card>

            <Card variant="solid" style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Riesgos Críticos y Controles</Text>
              
              {documento.riesgos_json && documento.riesgos_json.map((riesgo: string, index: number) => (
                <View key={index} style={styles.riskItem}>
                  <View style={styles.riskDot} />
                  <View style={styles.riskContent}>
                    <Text style={styles.riskTitle}>{riesgo}</Text>
                    <Text style={styles.riskControl}>Control verificado en terreno</Text>
                  </View>
                </View>
              ))}
            </Card>

            <Card variant="solid" style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Anexos y Evidencias</Text>
              <View style={styles.anexosList}>
                {documento.contenido_json?.anexos && documento.contenido_json.anexos.map((anexo: any) => (
                  <View key={anexo.id} style={styles.anexoRow}>
                    <View style={styles.anexoInfo}>
                      <Text style={styles.anexoTitle}>{anexo.nombre}</Text>
                      <Text style={styles.statusTextOk}>Adjuntado ✓</Text>
                    </View>
                    <TouchableOpacity style={styles.evidenceBtn} onPress={() => {
                        if(anexo.base64) Alert.alert('Anexo', 'Visualización de Base64 no implementada en MVP, pero el dato existe en BD.');
                    }}>
                      {anexo.tipoMime === 'application/pdf' ? <FileText color={colors.primary.main} size={20} /> : <ImageIcon color={colors.primary.main} size={20} />}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </Card>

            {documento.contenido_json?.ubicacionGPS && (
              <Card variant="outline" style={[styles.infoCard, { borderColor: colors.primary.main + '50', backgroundColor: colors.primary.main + '05' }]}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                  <MapPin color={colors.primary.main} size={20} />
                  <Text style={[styles.sectionTitle, {marginBottom: 0, marginLeft: 8}]}>Sello de Auditoría Incorruptible</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Fecha/Hora Firma:</Text>
                  <Text style={styles.infoValue}>{new Date(documento.contenido_json.ubicacionGPS.timestamp).toLocaleString()}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Coordenadas Exactas:</Text>
                  <Text style={styles.infoValue}>{documento.contenido_json.ubicacionGPS.latitud.toFixed(5)}, {documento.contenido_json.ubicacionGPS.longitud.toFixed(5)}</Text>
                </View>
                <Button 
                  title="Verificar en Mapa" 
                  variant="outline" 
                  style={{marginTop: 12}}
                  onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${documento.contenido_json.ubicacionGPS.latitud},${documento.contenido_json.ubicacionGPS.longitud}`)}
                />
              </Card>
            )}

            <View style={styles.signSection}>
              <Text style={styles.sectionTitle}>Firma del Jefe General</Text>
              <View style={styles.signaturePad}>
                {signatureData ? (
                  <View style={styles.signedContainer}>
                    <Image source={{ uri: signatureData }} style={styles.signatureImage} resizeMode="contain" />
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
          </>
        )}
      </ScrollView>

      {/* Modal de Firma */}
      <Modal visible={isSignModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dibuje su firma de aprobación</Text>
              <TouchableOpacity onPress={() => setIsSignModalVisible(false)}>
                <X color={colors.text.primary} size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.signatureContainer}>
              <SignatureScreen
                onOK={handleSignature}
                onEmpty={() => Alert.alert('Error', 'Por favor dibuje su firma.')}
                descriptionText="Firma del Jefe"
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
        <View style={styles.footerButtons}>
          <Button 
            title="RECHAZAR" 
            variant="outline"
            onPress={() => setIsRejectModalVisible(true)} 
            style={{ flex: 1 }}
          />
          <View style={{ width: 12 }} />
          <Button 
            title="APROBAR" 
            icon={<CheckCircle color="#FFF" size={20} />}
            onPress={handleApprove} 
            disabled={!signatureData}
            isLoading={isLoading}
            style={{ flex: 2 }}
          />
        </View>
      </View>

      {/* Modal de Rechazo Profesional */}
      <Modal visible={isRejectModalVisible} animationType="fade" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: 'auto', paddingBottom: 40 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.status.danger }]}>Rechazar Documento</Text>
              <TouchableOpacity onPress={() => setIsRejectModalVisible(false)} disabled={isLoading}>
                <X color={colors.text.primary} size={24} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.rejectSubtitle}>
              Por favor indique el motivo del rechazo. Este comentario será enviado al líder solicitante para que realice las correcciones.
            </Text>
            
            <TextInput
              style={styles.rejectInput}
              placeholder="Ej: Falta firma en la Charla de Comunicación..."
              placeholderTextColor={colors.text.disabled}
              multiline
              numberOfLines={4}
              value={rejectComment}
              onChangeText={setRejectComment}
              editable={!isLoading}
            />
            
            <Button 
              title="CONFIRMAR RECHAZO" 
              icon={<XCircle color="#FFF" size={20} />}
              onPress={handleReject}
              isLoading={isLoading}
              style={{ backgroundColor: colors.status.danger, borderColor: colors.status.danger }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  docHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  docId: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  docType: {
    fontSize: 16,
    color: colors.status.warning,
    marginTop: 4,
  },
  infoCard: {
    marginBottom: 20,
    padding: 16,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoCol: {
    width: '45%',
    marginBottom: 8,
  },
  infoLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  riskItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.danger,
    marginTop: 6,
    marginRight: 12,
  },
  riskContent: {
    flex: 1,
  },
  riskTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  riskControl: {
    color: colors.text.secondary,
    fontSize: 13,
  },
  evidenceBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  evidenceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.md,
    gap: 8,
  },
  evidenceBtnText: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: '500',
  },
  signSection: {
    marginTop: 8,
  },
  signaturePad: {
    height: 120,
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
    fontFamily: 'Cochin',
    fontSize: 40,
    color: '#000',
    transform: [{ rotate: '-10deg' }],
  },
  signedStamp: {
    position: 'absolute',
    bottom: 8,
    right: 8,
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
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureImage: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  anexosList: {
    gap: 8,
  },
  anexoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: radius.md,
  },
  anexoInfo: {
    flex: 1,
  },
  anexoTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusTextOk: {
    color: colors.status.success,
    fontSize: 12,
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
  rejectSubtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  rejectInput: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: radius.md,
    color: colors.text.primary,
    fontSize: 16,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
});
