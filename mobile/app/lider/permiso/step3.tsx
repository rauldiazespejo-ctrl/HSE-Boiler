import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '../../../src/theme/colors';
import {
  ArrowLeft, ArrowRight, Camera as CameraIcon, Upload,
  CheckCircle2, X, Wrench, Package, FileText, ChevronDown, ChevronRight, Leaf, Info,
} from 'lucide-react-native';
import { PermisoContext, TIPO_LABELS, ChecklistItem } from '../../../src/context/PermisoContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

type EstadoItem = 'OK' | 'NO_OK' | 'NA' | null;

const ESTADO_OPTS: { value: EstadoItem; label: string; color: string }[] = [
  { value: 'OK',    label: 'OK',    color: colors.status.success },
  { value: 'NO_OK', label: 'NOK',   color: colors.status.danger },
  { value: 'NA',    label: 'N/A',   color: colors.text.disabled },
];

function ChecklistSection({
  title,
  icon,
  items,
  onUpdate,
}: {
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
  onUpdate: (items: ChecklistItem[]) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const completedCount = items.filter(i => i.estado !== null).length;

  return (
    <View style={clStyles.section}>
      <TouchableOpacity style={clStyles.sectionHeader} onPress={() => setExpanded(v => !v)} activeOpacity={0.75}>
        <View style={clStyles.sectionIconWrap}>{icon}</View>
        <Text style={clStyles.sectionTitle}>{title}</Text>
        <View style={clStyles.sectionBadge}>
          <Text style={clStyles.sectionBadgeText}>{completedCount}/{items.length}</Text>
        </View>
        {expanded ? <ChevronDown color={colors.text.disabled} size={16} /> : <ChevronRight color={colors.text.disabled} size={16} />}
      </TouchableOpacity>

      {expanded && items.map((item, idx) => (
        <View key={item.id} style={[clStyles.itemRow, idx === items.length - 1 && { marginBottom: 0 }]}>
          <Text style={clStyles.itemDesc} numberOfLines={2}>{item.descripcion}</Text>
          <View style={clStyles.estadoBtns}>
            {ESTADO_OPTS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  clStyles.estadoBtn,
                  item.estado === opt.value && { backgroundColor: opt.color, borderColor: opt.color },
                ]}
                onPress={() => {
                  const updated = items.map((it, i) =>
                    i === idx ? { ...it, estado: opt.value as EstadoItem } : it
                  );
                  onUpdate(updated);
                }}
              >
                <Text style={[
                  clStyles.estadoBtnText,
                  item.estado === opt.value && { color: '#FFF' },
                  item.estado !== opt.value && { color: opt.color },
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

export default function PermisoStep3() {
  const { data, updateData } = useContext(PermisoContext);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [activeAnexoId, setActiveAnexoId] = useState<string | null>(null);
  const cameraRef = React.useRef<any>(null);

  const tipoLabel = TIPO_LABELS[data.tipoPermiso] || 'Permiso';

  const handleTakePhoto = async (anexoId: string) => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permiso denegado', 'Se requiere acceso a la cámara.');
        return;
      }
    }
    setActiveAnexoId(anexoId);
    setIsCameraVisible(true);
  };

  const capturePhoto = async () => {
    if (cameraRef.current && activeAnexoId) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      const updatedAnexos = data.anexos.map(a =>
        a.id === activeAnexoId
          ? { ...a, base64: `data:image/jpeg;base64,${photo.base64}`, tipoMime: 'image/jpeg' }
          : a
      );
      updateData({ anexos: updatedAnexos });
      setIsCameraVisible(false);
      setActiveAnexoId(null);
    }
  };

  const handleUploadPDF = async (anexoId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.length > 0) {
        const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const updatedAnexos = data.anexos.map(a =>
          a.id === anexoId
            ? { ...a, base64: `data:application/pdf;base64,${base64}`, tipoMime: 'application/pdf' }
            : a
        );
        updateData({ anexos: updatedAnexos });
        Alert.alert('Adjuntado', 'Documento PDF adjuntado correctamente.');
      }
    } catch {}
  };

  const herramientasDone = data.checklistHerramientas.filter(i => i.estado !== null).length;
  const equiposDone = data.checklistEquipos.filter(i => i.estado !== null).length;
  const medioAmbienteDone = data.checklistMedioAmbiente.filter(i => i.estado !== null).length;
  const fotosAdjuntas = data.anexos.filter(a => a.base64).length;

  const isComplete = true;

  if (isCameraVisible) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView style={{ flex: 1 }} facing="back" ref={cameraRef}>
          <View style={camStyles.overlay}>
            <TouchableOpacity style={camStyles.closeBtn} onPress={() => setIsCameraVisible(false)}>
              <X color="#FFF" size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={camStyles.captureBtn} onPress={capturePhoto}>
              <View style={camStyles.captureBtnInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={colors.text.primary} size={22} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.stepLabel}>PASO 3 / 4</Text>
          <Text style={styles.tipoLabel} numberOfLines={1}>{tipoLabel}</Text>
        </View>
        <View style={styles.stepBubble}>
          <Text style={styles.stepBubbleText}>3/4</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <LinearGradient
          colors={colors.primary.gradient}
          style={[styles.progressFill, { width: '75%' }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <ChecklistSection
          title="Checklist de Herramientas"
          icon={<Wrench color={colors.primary.main} size={16} />}
          items={data.checklistHerramientas}
          onUpdate={items => updateData({ checklistHerramientas: items })}
        />

        <ChecklistSection
          title="Checklist de Equipos"
          icon={<Package color={colors.secondary.main} size={16} />}
          items={data.checklistEquipos}
          onUpdate={items => updateData({ checklistEquipos: items })}
        />

        <ChecklistSection
          title="Controles Ambientales — ISO 14001"
          icon={<Leaf color="#22C55E" size={16} />}
          items={data.checklistMedioAmbiente}
          onUpdate={items => updateData({ checklistMedioAmbiente: items })}
        />

        <View style={styles.infoBanner}>
          <Info color={colors.secondary.main} size={14} />
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: '700' }}>Evidencia fotográfica opcional.</Text>
            {' '}Adjunta fotos de los controles implementados para fortalecer el expediente HSE en auditoría.
          </Text>
        </View>

        <View style={styles.docSection}>
          <View style={styles.docHeader}>
            <CameraIcon color={colors.status.warning} size={16} />
            <Text style={styles.docTitle}>Evidencia Fotográfica</Text>
            <View style={styles.docBadge}>
              <Text style={styles.docBadgeText}>{fotosAdjuntas}/{data.anexos.length}</Text>
            </View>
            <Text style={styles.docOptionalTag}>Opcional</Text>
          </View>

          {data.anexos.map(anexo => (
            <View key={anexo.id} style={[styles.anexoRow, anexo.base64 && styles.anexoRowDone]}>
              <View style={styles.anexoLeft}>
                {anexo.base64 ? (
                  <CheckCircle2 color={colors.status.success} size={18} />
                ) : (
                  <View style={styles.anexoDotOptional} />
                )}
                <Text style={[styles.anexoName, anexo.base64 && styles.anexoNameDone]} numberOfLines={2}>
                  {anexo.nombre}
                </Text>
              </View>
              <View style={styles.anexoBtns}>
                <TouchableOpacity style={styles.anexoBtn} onPress={() => handleTakePhoto(anexo.id)}>
                  <CameraIcon color={colors.primary.main} size={16} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.anexoBtn} onPress={() => handleUploadPDF(anexo.id)}>
                  <Upload color={colors.secondary.main} size={16} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !isComplete && styles.nextBtnDisabled]}
          onPress={() => isComplete && router.push('/lider/permiso/step4')}
          disabled={!isComplete}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={isComplete ? colors.primary.gradient : ['#2D3344', '#1E2330']}
            style={styles.nextBtnGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.nextBtnText, !isComplete && { color: colors.text.disabled }]}>
              Firma y Envío
            </Text>
            <ArrowRight color={isComplete ? '#FFF' : colors.text.disabled} size={18} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const clStyles = StyleSheet.create({
  section: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text.primary },
  sectionBadge: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border.medium,
  },
  sectionBadgeText: { fontSize: 10, fontWeight: '700', color: colors.text.secondary },
  itemRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: 6,
  },
  itemDesc: { fontSize: 12, color: colors.text.secondary, lineHeight: 16 },
  estadoBtns: { flexDirection: 'row', gap: 6 },
  estadoBtn: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border.medium,
  },
  estadoBtnText: { fontSize: 11, fontWeight: '700' },
});

const camStyles = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: 'flex-end', alignItems: 'center', padding: 32, gap: 24,
  },
  closeBtn: {
    position: 'absolute', top: 56, right: 24,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3, borderColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
  },
  captureBtnInner: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#FFF',
  },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.main },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1, borderBottomColor: colors.border.light, gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border.light,
  },
  headerCenter: { flex: 1 },
  stepLabel: { fontSize: 10, color: colors.text.disabled, fontWeight: '700', letterSpacing: 1 },
  tipoLabel: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  stepBubble: {
    backgroundColor: colors.primary.main + '20',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.primary.main + '40',
  },
  stepBubbleText: { fontSize: 11, fontWeight: '700', color: colors.primary.main },
  progressTrack: { height: 3, backgroundColor: colors.border.light },
  progressFill: { height: '100%', borderRadius: 2 },
  scroll: { padding: 16, paddingTop: 20 },
  docSection: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  docHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  docTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text.primary },
  docBadge: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border.medium,
  },
  docBadgeText: { fontSize: 10, fontWeight: '700', color: colors.text.secondary },
  anexoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: colors.border.light,
    gap: 10,
  },
  anexoRowDone: {},
  anexoLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  anexoDotOptional: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: colors.border.medium,
  },
  anexoName: { flex: 1, fontSize: 13, color: colors.text.secondary },
  anexoNameDone: { color: colors.status.success },
  anexoBtns: { flexDirection: 'row', gap: 6 },
  anexoBtn: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border.medium,
  },
  docOptionalTag: {
    fontSize: 10, fontWeight: '700', color: colors.secondary.main,
    backgroundColor: colors.secondary.main + '15',
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.secondary.main + '30',
  },
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.secondary.main + '10',
    borderRadius: radius.sm, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: colors.secondary.main + '25',
  },
  infoText: { flex: 1, fontSize: 12, color: colors.text.secondary, lineHeight: 17 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 32,
    backgroundColor: colors.background.main,
    borderTopWidth: 1, borderTopColor: colors.border.light,
  },
  nextBtn: { borderRadius: radius.md, overflow: 'hidden' },
  nextBtnDisabled: { opacity: 0.6 },
  nextBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15,
  },
  nextBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
