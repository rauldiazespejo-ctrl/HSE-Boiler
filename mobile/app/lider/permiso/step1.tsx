import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Switch, Alert, Modal, FlatList, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft, ArrowRight, ChevronDown, Camera, CheckCircle2,
  X, MapPin, Users, FileText, ShieldAlert, Check,
} from 'lucide-react-native';
import { PermisoContext, TipoPermiso, TIPO_LABELS } from '../../../src/context/PermisoContext';
import { api } from '../../../src/services/api';

const ZONAS_TRABAJO = [
  'Taller de Tornería',
  'Área CNC / Fresado',
  'Zona Soldadura',
  'Sector Corte y Esmerilado',
  'Nave Principal — Puente Grúa',
  'Taller Eléctrico',
  'Área de Mantenimiento',
  'Patio de Operaciones',
  'Bodega de Materiales',
  'Plataforma / Andamios',
  'Sala de Compresores',
  'Zona Tratamiento Superficies',
];

const CONTROLES_CRITICOS: Record<string, { key: string; label: string }[]> = {
  TRABAJO_CALIENTE: [
    { key: 'area_libre', label: 'Área libre de materiales inflamables (radio 10 m)' },
    { key: 'extintor', label: 'Extintor inspeccionado y accesible en el punto de trabajo' },
    { key: 'epp_caliente', label: 'EPP específico: careta, guantes cuero, coleto, polainas' },
    { key: 'vigil_incendio', label: 'Vigía de incendio designado y presente' },
    { key: 'ventilacion', label: 'Ventilación adecuada o extracción de humos activa' },
  ],
  IZAJE_GRUA: [
    { key: 'inspeccion_grua', label: 'Puente grúa inspeccionado (frenos, limitadores, ganchos)' },
    { key: 'zona_exclusion', label: 'Zona de exclusión delimitada con conos / cintas' },
    { key: 'rigger_cert', label: 'Rigger certificado presente y asignado a la maniobra' },
    { key: 'eslingas_ok', label: 'Eslingas y accesorios de izaje inspeccionados y certificados' },
    { key: 'carga_estabilizada', label: 'Carga estabilizada antes del izaje (sin balanceo libre)' },
  ],
  MECANIZADO_CNC: [
    { key: 'guardas', label: 'Guardas y resguardos de la máquina en posición cerrada' },
    { key: 'fijacion', label: 'Fijación de pieza verificada (mordaza / plato / tornillo)' },
    { key: 'programa_aprobado', label: 'Programa CNC revisado y aprobado por supervisor' },
    { key: 'epp_cnc', label: 'EPP: lentes, zapatos punta acero, ropa ajustada' },
    { key: 'viruta', label: 'Procedimiento de retirada de viruta con gancho (no con mano)' },
  ],
  TORNERIA: [
    { key: 'chuck_ajustado', label: 'Chuck apretado y verificado sin llave insertada' },
    { key: 'guarda_chuck', label: 'Guarda del chuck instalada y segura' },
    { key: 'velocidad', label: 'Velocidad de corte correcta para material y herramienta' },
    { key: 'epp_torno', label: 'EPP: lentes de seguridad, sin ropa suelta, sin guantes en torno' },
    { key: 'soporte_pieza', label: 'Pieza larga con soporte luneta instalado si aplica' },
  ],
  ESMERILADO: [
    { key: 'disco_ok', label: 'Disco inspeccionado (sin grietas, velocidad adecuada)' },
    { key: 'guarda_disco', label: 'Guarda del disco instalada y ajustada correctamente' },
    { key: 'epp_esmeril', label: 'EPP: careta facial, guantes, protección auditiva, mandil' },
    { key: 'area_libre_esmeril', label: 'Área libre de personas y materiales en dirección de chispas' },
    { key: 'pieza_fijada', label: 'Pieza firmemente fijada (nunca sostenida a mano libremente)' },
  ],
  TRABAJO_ALTURA: [
    { key: 'arnes_ok', label: 'Arnés de seguridad inspeccionado y ajustado al cuerpo' },
    { key: 'punto_anclaje', label: 'Punto de anclaje certificado y verificado (> 2 T)' },
    { key: 'superficie_ok', label: 'Andamio / escalera inspeccionado y nivelado' },
    { key: 'zona_exclusion_altura', label: 'Zona de exclusión bajo el área de trabajo demarcada' },
    { key: 'doble_seguro', label: 'Sistema de doble seguro utilizado en todo momento' },
  ],
  TRABAJO_ELECTRICO: [
    { key: 'loto', label: 'LOTO aplicado: energía bloqueada y etiquetada' },
    { key: 'tension_cero', label: 'Verificación de tensión cero con instrumento calibrado' },
    { key: 'puesta_tierra', label: 'Puesta a tierra temporal instalada' },
    { key: 'epp_electrico', label: 'EPP dieléctrico: guantes AT/BT, calzado aislante, careta arco' },
    { key: 'segundo_hombre', label: 'Segundo hombre presente durante la intervención' },
  ],
  MANTENIMIENTO: [
    { key: 'loto_mant', label: 'Energías peligrosas bloqueadas y etiquetadas (LOTO)' },
    { key: 'orden_trabajo', label: 'Orden de trabajo emitida y firmada por supervisión' },
    { key: 'herramientas_ok', label: 'Herramientas específicas para la tarea inspeccionadas' },
    { key: 'epp_mant', label: 'EPP adecuado para el trabajo a realizar' },
    { key: 'residuos', label: 'Punto de disposición de residuos y aceites identificado' },
  ],
  GRUA_HORQUILLA: [
    { key: 'check_diario', label: 'Check diario de grúa horquilla completado y firmado' },
    { key: 'licencia', label: 'Operador con licencia interna vigente para grúa horquilla' },
    { key: 'carga_max', label: 'Carga no excede capacidad nominal del equipo' },
    { key: 'visibilidad', label: 'Visibilidad del operador garantizada (uso de espejo o asistente)' },
    { key: 'peatones', label: 'Peatones alejados y área de tránsito despejada' },
  ],
  ESPACIO_CONFINADO: [
    { key: 'medicion_gases', label: 'Medición de gases realizada: O₂, LEL, CO, H₂S dentro de rango' },
    { key: 'ventilacion_ec', label: 'Ventilación forzada activa durante toda la operación' },
    { key: 'vigil_exterior', label: 'Vigía exterior permanente designado con comunicación' },
    { key: 'plan_rescate', label: 'Plan de rescate definido, comunicado y equipos disponibles' },
    { key: 'epp_ec', label: 'EPP específico: arnés, equipo respiración autónoma si aplica' },
  ],
};

interface Trabajador {
  id_usuario: number;
  nombre: string;
  certificaciones_json?: { cargo?: string; rut?: string } | null;
}

export default function PermisoStep1() {
  const { tipo } = useLocalSearchParams<{ tipo: TipoPermiso }>();
  const { data, updateData, initPermiso } = useContext(PermisoContext);
  const [zonaModal, setZonaModal] = useState(false);
  const [trabajadoresModal, setTrabajadoresModal] = useState(false);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loadingTrabajadores, setLoadingTrabajadores] = useState(false);
  const [selectedTrabajadores, setSelectedTrabajadores] = useState<Trabajador[]>([]);

  useEffect(() => {
    if (tipo) initPermiso(tipo);
  }, [tipo]);

  const fetchTrabajadores = async () => {
    if (trabajadores.length > 0) { setTrabajadoresModal(true); return; }
    setLoadingTrabajadores(true);
    try {
      const res = await api.get('/usuarios/trabajadores');
      if (res.data.success) setTrabajadores(res.data.data);
    } catch {}
    finally { setLoadingTrabajadores(false); }
    setTrabajadoresModal(true);
  };

  const toggleTrabajador = (t: Trabajador) => {
    setSelectedTrabajadores(prev => {
      const exists = prev.find(x => x.id_usuario === t.id_usuario);
      const next = exists ? prev.filter(x => x.id_usuario !== t.id_usuario) : [...prev, t];
      updateData({ equipoTrabajo: next.map(x => x.nombre) });
      return next;
    });
  };

  const controles = CONTROLES_CRITICOS[tipo || ''] || [];

  const updateControl = (key: string, verificado: boolean) => {
    const current = data.detalles?.[key] || { verificado: false };
    updateData({ detalles: { ...data.detalles, [key]: { ...current, verificado } } });
  };

  const handlePickImage = async (key: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se requiere acceso a la cámara.');
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
          [key]: { ...current, fotoBase64: `data:image/jpeg;base64,${result.assets[0].base64}` },
        },
      });
    }
  };

  const checkedCount = controles.filter(c => data.detalles?.[c.key]?.verificado).length;
  const isComplete = !!data.zona && checkedCount === controles.length;

  const progress = 0.25;
  const tipoLabel = TIPO_LABELS[tipo || ''] || 'Permiso de Trabajo';

  if (!tipo) return null;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={colors.text.primary} size={22} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.stepLabel}>PASO 1 / 4</Text>
          <Text style={styles.tipoLabel} numberOfLines={1}>{tipoLabel}</Text>
        </View>
        <View style={styles.stepBubble}>
          <Text style={styles.stepBubbleText}>1/4</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <LinearGradient
          colors={colors.primary.gradient}
          style={[styles.progressFill, { width: `${progress * 100}%` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Información del Trabajo</Text>

        <TouchableOpacity style={styles.zonaPicker} onPress={() => setZonaModal(true)} activeOpacity={0.75}>
          <MapPin color={data.zona ? colors.primary.main : colors.text.disabled} size={18} />
          <Text style={[styles.zonaText, !data.zona && styles.zonaPlaceholder]}>
            {data.zona || 'Seleccionar zona de trabajo'}
          </Text>
          <ChevronDown color={colors.text.disabled} size={18} />
        </TouchableOpacity>

        <TextInput
          style={styles.textArea}
          placeholder="Descripción detallada del trabajo a realizar..."
          placeholderTextColor={colors.text.disabled}
          value={data.descripcionTrabajo}
          onChangeText={v => updateData({ descripcionTrabajo: v })}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.zonaPicker, selectedTrabajadores.length > 0 && styles.zonaPickerSelected]}
          onPress={fetchTrabajadores}
          activeOpacity={0.75}
          disabled={loadingTrabajadores}
        >
          <Users color={selectedTrabajadores.length > 0 ? colors.secondary.main : colors.text.disabled} size={18} />
          <Text style={[styles.zonaText, selectedTrabajadores.length === 0 && styles.zonaPlaceholder]}>
            {selectedTrabajadores.length > 0
              ? `${selectedTrabajadores.length} trabajador${selectedTrabajadores.length > 1 ? 'es' : ''} seleccionado${selectedTrabajadores.length > 1 ? 's' : ''}`
              : 'Seleccionar trabajadores participantes'}
          </Text>
          {loadingTrabajadores
            ? <ActivityIndicator size="small" color={colors.text.disabled} />
            : <ChevronDown color={colors.text.disabled} size={18} />}
        </TouchableOpacity>

        {selectedTrabajadores.length > 0 && (
          <View style={styles.chipRow}>
            {selectedTrabajadores.map(t => (
              <TouchableOpacity key={t.id_usuario} style={styles.chip} onPress={() => toggleTrabajador(t)}>
                <Text style={styles.chipText}>{t.nombre.split(' ')[0]} {t.nombre.split(' ')[1]}</Text>
                <X color={colors.secondary.main} size={12} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.sectionHeaderRow}>
          <ShieldAlert color={colors.status.danger} size={18} />
          <Text style={styles.sectionTitle}>Controles Críticos — AST</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{checkedCount}/{controles.length}</Text>
          </View>
        </View>
        <Text style={styles.sectionSub}>Verifica cada control ANTES de iniciar la tarea</Text>

        {controles.map(ctrl => {
          const control = data.detalles?.[ctrl.key] || { verificado: false };
          return (
            <View key={ctrl.key} style={[styles.controlRow, control.verificado && styles.controlRowChecked]}>
              <View style={styles.controlLeft}>
                <Switch
                  value={control.verificado}
                  onValueChange={val => updateControl(ctrl.key, val)}
                  trackColor={{ false: colors.border.medium, true: colors.status.success + '80' }}
                  thumbColor={control.verificado ? colors.status.success : '#94A3B8'}
                />
              </View>
              <Text style={[styles.controlLabel, control.verificado && styles.controlLabelChecked]}>
                {ctrl.label}
              </Text>
              <TouchableOpacity
                onPress={() => handlePickImage(ctrl.key)}
                style={[styles.cameraBtn, !!control.fotoBase64 && styles.cameraBtnActive]}
                hitSlop={8}
              >
                <Camera color={control.fotoBase64 ? colors.status.success : colors.text.disabled} size={16} />
              </TouchableOpacity>
            </View>
          );
        })}

        {controles.length > 0 && !isComplete && (
          <View style={styles.warningBanner}>
            <ShieldAlert color={colors.status.warning} size={14} />
            <Text style={styles.warningText}>
              Completa todos los controles críticos y selecciona la zona para continuar
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !isComplete && styles.nextBtnDisabled]}
          onPress={() => isComplete && router.push('/lider/permiso/step2')}
          disabled={!isComplete}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={isComplete ? colors.primary.gradient : ['#2D3344', '#1E2330']}
            style={styles.nextBtnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.nextBtnText, !isComplete && styles.nextBtnTextDisabled]}>
              Análisis de Riesgos
            </Text>
            <ArrowRight color={isComplete ? '#FFF' : colors.text.disabled} size={18} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Modal visible={zonaModal} transparent animationType="slide" onRequestClose={() => setZonaModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Zona de Trabajo</Text>
            <FlatList
              data={ZONAS_TRABAJO}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.zonaItem, data.zona === item && styles.zonaItemSelected]}
                  onPress={() => { updateData({ zona: item }); setZonaModal(false); }}
                >
                  <MapPin color={data.zona === item ? colors.primary.main : colors.text.secondary} size={16} />
                  <Text style={[styles.zonaItemText, data.zona === item && styles.zonaItemTextSelected]}>
                    {item}
                  </Text>
                  {data.zona === item && <CheckCircle2 color={colors.primary.main} size={18} />}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => setZonaModal(false)}>
              <X color={colors.text.secondary} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={trabajadoresModal} transparent animationType="slide" onRequestClose={() => setTrabajadoresModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Trabajadores Participantes</Text>
            <FlatList
              data={trabajadores}
              keyExtractor={item => String(item.id_usuario)}
              renderItem={({ item }) => {
                const selected = !!selectedTrabajadores.find(x => x.id_usuario === item.id_usuario);
                return (
                  <TouchableOpacity
                    style={[styles.trabajadorItem, selected && styles.trabajadorItemSelected]}
                    onPress={() => toggleTrabajador(item)}
                  >
                    <View style={[styles.checkBox, selected && styles.checkBoxChecked]}>
                      {selected && <Check color="#FFF" size={12} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.trabajadorName}>{item.nombre}</Text>
                      <Text style={styles.trabajadorCargo}>{item.certificaciones_json?.cargo || '—'}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={{ color: colors.text.disabled, textAlign: 'center', marginTop: 20 }}>
                  No hay trabajadores registrados
                </Text>
              }
            />
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={() => setTrabajadoresModal(false)}
            >
              <Text style={styles.modalConfirmBtnText}>
                Confirmar ({selectedTrabajadores.length} seleccionado{selectedTrabajadores.length !== 1 ? 's' : ''})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalClose} onPress={() => setTrabajadoresModal(false)}>
              <X color={colors.text.secondary} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.main },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: 12,
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
  progressTrack: {
    height: 3,
    backgroundColor: colors.border.light,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  scroll: { padding: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  sectionSub: { fontSize: 12, color: colors.text.secondary, marginBottom: 14, marginTop: 2 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  countBadge: {
    marginLeft: 'auto',
    backgroundColor: colors.background.elevated,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border.medium,
  },
  countText: { fontSize: 11, fontWeight: '700', color: colors.text.secondary },
  zonaPicker: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.background.paper,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border.medium,
    paddingHorizontal: 14, paddingVertical: 14,
    marginBottom: 12,
  },
  zonaText: { flex: 1, fontSize: 14, color: colors.text.primary },
  zonaPlaceholder: { color: colors.text.disabled },
  textArea: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border.light,
    paddingHorizontal: 14, paddingVertical: 12,
    color: colors.text.primary, fontSize: 14,
    minHeight: 80, marginBottom: 12,
  },
  textInput: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border.light,
    paddingHorizontal: 14, paddingVertical: 13,
    color: colors.text.primary, fontSize: 14,
    marginBottom: 20,
  },
  divider: { height: 1, backgroundColor: colors.border.light, marginBottom: 20 },
  controlRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.background.paper,
    borderRadius: radius.md,
    paddingHorizontal: 12, paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1, borderColor: colors.border.light,
  },
  controlRowChecked: { borderColor: colors.status.success + '50', backgroundColor: colors.status.success + '08' },
  controlLeft: {},
  controlLabel: { flex: 1, fontSize: 13, color: colors.text.secondary, lineHeight: 18 },
  controlLabelChecked: { color: colors.text.primary },
  cameraBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border.light,
  },
  cameraBtnActive: { borderColor: colors.status.success + '60', backgroundColor: colors.status.success + '15' },
  warningBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.status.warning + '12',
    borderRadius: radius.sm,
    padding: 12, marginTop: 4,
    borderWidth: 1, borderColor: colors.status.warning + '30',
  },
  warningText: { flex: 1, fontSize: 12, color: colors.status.warning, lineHeight: 17 },
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
  nextBtnTextDisabled: { color: colors.text.disabled },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.background.paper,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: 20, paddingBottom: 40, maxHeight: '75%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border.medium,
    alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 16 },
  modalClose: {
    position: 'absolute', top: 16, right: 16,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center', alignItems: 'center',
  },
  zonaPickerSelected: { borderColor: colors.secondary.main + '60' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.secondary.main + '15',
    borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: colors.secondary.main + '40',
  },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.secondary.main },
  zonaItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 14, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  zonaItemSelected: { backgroundColor: colors.primary.main + '10', borderRadius: radius.sm, paddingHorizontal: 8 },
  zonaItemText: { flex: 1, fontSize: 14, color: colors.text.secondary },
  zonaItemTextSelected: { color: colors.primary.main, fontWeight: '600' },
  trabajadorItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  trabajadorItemSelected: { backgroundColor: colors.secondary.main + '08' },
  trabajadorName: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  trabajadorCargo: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  checkBox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: colors.border.medium,
    justifyContent: 'center', alignItems: 'center',
  },
  checkBoxChecked: { backgroundColor: colors.secondary.main, borderColor: colors.secondary.main },
  modalConfirmBtn: {
    marginTop: 16,
    backgroundColor: colors.secondary.main,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
