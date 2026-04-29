import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../../src/components/Button';
import { colors, radius } from '../../../src/theme/colors';
import { ArrowLeft, ArrowRight, Camera as CameraIcon, Upload, CheckCircle2, X } from 'lucide-react-native';
import { PermisoContext } from '../../../src/context/PermisoContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export default function PermisoStep3() {
  const { data, updateData } = React.useContext(PermisoContext);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [activeAnexoId, setActiveAnexoId] = useState<string | null>(null);
  const cameraRef = React.useRef<any>(null);

  const handleTakePhoto = async (anexoId: string) => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permiso denegado', 'Se requiere acceso a la cámara para tomar fotos.');
        return;
      }
    }
    setActiveAnexoId(anexoId);
    setIsCameraVisible(true);
  };

  const capturePhoto = async () => {
    if (cameraRef.current && activeAnexoId) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      const updatedAnexos = data.anexos.map(anexo => 
        anexo.id === activeAnexoId ? { ...anexo, base64: `data:image/jpeg;base64,${photo.base64}`, tipoMime: 'image/jpeg' } : anexo
      );
      updateData({ anexos: updatedAnexos });
      setIsCameraVisible(false);
      setActiveAnexoId(null);
    }
  };

  const handleUploadCert = async (anexoId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        // Leer archivo a base64
        const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
        
        const updatedAnexos = data.anexos.map(anexo => 
          anexo.id === anexoId ? { ...anexo, base64: `data:application/pdf;base64,${base64}`, tipoMime: 'application/pdf' } : anexo
        );
        updateData({ anexos: updatedAnexos });
        Alert.alert('Éxito', 'Documento adjuntado correctamente');
      }
    } catch (err) {
      console.log('Error selecting document', err);
    }
  };

  const allRequiredComplete = data.anexos.every(anexo => !anexo.requerido || (anexo.requerido && anexo.base64 !== null));

  if (isCameraVisible) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <CameraView style={{ flex: 1 }} facing="back" ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.closeCameraBtn} onPress={() => setIsCameraVisible(false)}>
              <X color="#FFF" size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureBtn} onPress={capturePhoto}>
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

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
          <Text style={styles.stepText}>3/4</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '75%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View>
          <Text style={styles.title}>Anexos y Evidencias</Text>
          <Text style={styles.subtitle}>Adjunte los documentos requeridos para este permiso.</Text>
        </View>

        <View style={styles.anexosList}>
          {data.anexos.map((anexo) => (
            <View key={anexo.id} style={styles.anexoRow}>
              <View style={styles.anexoInfo}>
                <Text style={styles.anexoTitle}>{anexo.nombre} {anexo.requerido && <Text style={styles.reqMarker}>*</Text>}</Text>
                {anexo.base64 ? (
                  <View style={styles.anexoStatusOk}>
                    <CheckCircle2 color={colors.status.success} size={16} />
                    <Text style={styles.statusTextOk}>Completado</Text>
                  </View>
                ) : (
                  <Text style={styles.statusTextPending}>Pendiente</Text>
                )}
              </View>

              {!anexo.base64 ? (
                <View style={styles.anexoActions}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleTakePhoto(anexo.id)}>
                    <CameraIcon color={colors.primary.main} size={24} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleUploadCert(anexo.id)}>
                    <Upload color={colors.primary.main} size={24} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.anexoActions}>
                  {anexo.tipoMime === 'image/jpeg' ? (
                    <Image source={{ uri: anexo.base64 }} style={styles.anexoThumb} />
                  ) : (
                    <Text style={styles.pdfBadge}>PDF</Text>
                  )}
                  <TouchableOpacity 
                    style={styles.clearBtn} 
                    onPress={() => {
                      const updatedAnexos = data.anexos.map(a => a.id === anexo.id ? { ...a, base64: null, tipoMime: null } : a);
                      updateData({ anexos: updatedAnexos });
                    }}
                  >
                    <X color={colors.status.danger} size={20} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Siguiente" 
          icon={<ArrowRight color="#FFF" size={20} />}
          onPress={() => router.push('/lider/permiso/step4')} 
          disabled={!allRequiredComplete}
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
  anexosList: {
    gap: 16,
  },
  anexoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    marginBottom: 12,
  },
  anexoInfo: {
    flex: 1,
    paddingRight: 10,
  },
  anexoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  reqMarker: {
    color: colors.status.danger,
  },
  anexoStatusOk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusTextOk: {
    fontSize: 14,
    color: colors.status.success,
  },
  statusTextPending: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  anexoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(225, 29, 72, 0.15)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.3)',
  },
  anexoThumb: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
  },
  pdfBadge: {
    backgroundColor: colors.status.danger,
    color: '#FFF',
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  clearBtn: {
    padding: 4,
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
