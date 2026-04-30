import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft, Send, PenTool, X, CheckCircle, MapPin,
  AlertTriangle, Users, ClipboardList, Wrench, Package, FileText,
} from 'lucide-react-native';
import { PermisoContext, TIPO_LABELS } from '../../../src/context/PermisoContext';
import { api } from '../../../src/services/api';
import SignatureScreen from 'react-native-signature-canvas';
import * as Location from 'expo-location';

function SummaryRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <View style={sumStyles.row}>
      {icon && <View style={sumStyles.iconWrap}>{icon}</View>}
      <View style={sumStyles.content}>
        <Text style={sumStyles.label}>{label}</Text>
        <Text style={sumStyles.value}>{value || '—'}</Text>
      </View>
    </View>
  );
}

export default function PermisoStep4() {
  const { data, resetData, updateData } = useContext(PermisoContext);
  const [isSignModalVisible, setIsSignModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const tipoLabel = TIPO_LABELS[data.tipoPermiso] || 'Permiso';
  const controlesMarcados = Object.values(data.detalles || {}).filter(d => d.verificado).length;
  const controleTotal = Object.keys(data.detalles || {}).length;
  const riesgosCount = data.riesgosSeleccionados?.length || 0;
  const herramientasOK = data.checklistHerramientas?.filter(i => i.estado !== null).length || 0;
  const equiposOK = data.checklistEquipos?.filter(i => i.estado !== null).length || 0;
  const docsAdjuntos = data.anexos?.filter(a => a.base64).length || 0;
  const docsTotal = data.anexos?.length || 0;

  const handleSignature = (signature: string) => {
    updateData({ firmaLider: signature });
    setIsSignModalVisible(false);
  };

  const handleSubmit = async () => {
    if (!data.firmaLider) {
      Alert.alert('Firma requerida', 'Debes firmar el documento antes de enviarlo.');
      return;
    }

    setIsLoading(true);
    let currentLoc = data.ubicacionGPS;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        currentLoc = {
          latitud: location.coords.latitude,
          longitud: location.coords.longitude,
          timestamp: new Date().toISOString(),
        };
        updateData({ ubicacionGPS: currentLoc });
      } else {
        Alert.alert(
          'GPS no disponible',
          'Sin ubicación GPS el permiso podría ser observado en auditoría.',
          [{ text: 'Continuar igual', style: 'destructive' }, { text: 'Cancelar', style: 'cancel', onPress: () => { setIsLoading(false); return; } }]
        );
      }
    } catch {}

    try {
      const response = await api.post('/documentos', {
        tipo_documento: data.tipoPermiso,
        sector: data.zona,
        contenido_json: {
          descripcionTrabajo: data.descripcionTrabajo,
          equipoTrabajo: data.equipoTrabajo,
          controlesCriticos: data.detalles,
          checklistHerramientas: data.checklistHerramientas,
          checklistEquipos: data.checklistEquipos,
          firma: data.firmaLider,
          anexos: data.anexos,
          ubicacionGPS: currentLoc,
        },
        riesgos_json: data.riesgosSeleccionados,
      });

      if (response.data.success) {
        Alert.alert(
          '¡Documento Enviado!',
          `El permiso de ${tipoLabel} fue enviado correctamente al flujo de aprobación del Jefe de Maestranza.`,
          [{ text: 'OK', onPress: () => { resetData(); router.replace('/lider'); } }]
        );
      }
    } catch {
      Alert.alert('Error', 'No se pudo enviar el documento. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={colors.text.primary} size={22} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.stepLabel}>PASO 4 / 4</Text>
          <Text style={styles.tipoLabel} numberOfLines={1}>{tipoLabel}</Text>
        </View>
        <View style={styles.stepBubble}>
          <Text style={styles.stepBubbleText}>4/4</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <LinearGradient
          colors={colors.primary.gradient}
          style={styles.progressFill}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Resumen y Firma</Text>
        <Text style={styles.pageSub}>Revisa el resumen del permiso antes de firmar y enviar</Text>

        <View style={styles.summaryCard}>
          <SummaryRow
            label="Tipo de Trabajo"
            value={tipoLabel}
            icon={<ClipboardList color={colors.primary.main} size={14} />}
          />
          <SummaryRow
            label="Zona de Trabajo"
            value={data.zona}
            icon={<MapPin color={colors.secondary.main} size={14} />}
          />
          {!!data.descripcionTrabajo && (
            <SummaryRow
              label="Descripción"
              value={data.descripcionTrabajo}
              icon={<FileText color={colors.text.disabled} size={14} />}
            />
          )}
          {data.equipoTrabajo?.length > 0 && (
            <SummaryRow
              label="Equipo de Trabajo"
              value={data.equipoTrabajo.join(', ')}
              icon={<Users color={colors.text.disabled} size={14} />}
            />
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{controlesMarcados}/{controleTotal}</Text>
            <Text style={styles.statLabel}>Controles críticos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.status.warning }]}>{riesgosCount}</Text>
            <Text style={styles.statLabel}>Riesgos id.</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.secondary.main }]}>{herramientasOK}</Text>
            <Text style={styles.statLabel}>Herram. OK</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.status.success }]}>{docsAdjuntos}/{docsTotal}</Text>
            <Text style={styles.statLabel}>Docs adjuntos</Text>
          </View>
        </View>

        <View style={styles.divider} />
        <Text style={styles.signTitle}>Firma Digital del Operario</Text>
        <Text style={styles.signSub}>Al firmar certificas que la información es correcta y los controles fueron verificados</Text>

        <TouchableOpacity
          style={[styles.signBox, !!data.firmaLider && styles.signBoxDone]}
          onPress={() => setIsSignModalVisible(true)}
          activeOpacity={0.75}
        >
          {data.firmaLider ? (
            <View style={styles.signedState}>
              <CheckCircle color={colors.status.success} size={28} />
              <Text style={styles.signedText}>Firmado correctamente</Text>
              <Text style={styles.signedSub}>Toca para volver a firmar</Text>
            </View>
          ) : (
            <View style={styles.unsignedState}>
              <PenTool color={colors.primary.main} size={28} />
              <Text style={styles.unsignedText}>Toca aquí para firmar</Text>
              <Text style={styles.unsignedSub}>Firma con tu dedo en el área de firma</Text>
            </View>
          )}
        </TouchableOpacity>

        {!data.firmaLider && (
          <View style={styles.warningBanner}>
            <AlertTriangle color={colors.status.warning} size={14} />
            <Text style={styles.warningText}>La firma digital es obligatoria para enviar el permiso</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, (!data.firmaLider || isLoading) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!data.firmaLider || isLoading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={data.firmaLider && !isLoading ? colors.primary.gradient : ['#2D3344', '#1E2330']}
            style={styles.submitBtnGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Send color={data.firmaLider && !isLoading ? '#FFF' : colors.text.disabled} size={18} />
            <Text style={[styles.submitBtnText, (!data.firmaLider || isLoading) && { color: colors.text.disabled }]}>
              {isLoading ? 'Enviando...' : 'Enviar al Jefe de Maestranza'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Modal visible={isSignModalVisible} transparent animationType="slide" onRequestClose={() => setIsSignModalVisible(false)}>
        <View style={styles.signModal}>
          <View style={styles.signModalHeader}>
            <Text style={styles.signModalTitle}>Firma Digital</Text>
            <TouchableOpacity onPress={() => setIsSignModalVisible(false)} style={styles.signModalClose}>
              <X color={colors.text.primary} size={20} />
            </TouchableOpacity>
          </View>
          <SignatureScreen
            onOK={handleSignature}
            onEmpty={() => Alert.alert('Firma vacía', 'Por favor, dibuja tu firma.')}
            descriptionText="Firma con tu dedo"
            clearText="Limpiar"
            confirmText="Confirmar"
            webStyle={`.m-signature-pad { background: ${colors.background.paper}; } .m-signature-pad--body canvas { background: ${colors.background.elevated}; }`}
          />
        </View>
      </Modal>
    </View>
  );
}

const sumStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  iconWrap: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 2,
  },
  content: { flex: 1 },
  label: { fontSize: 11, color: colors.text.disabled, fontWeight: '600', letterSpacing: 0.3, marginBottom: 2 },
  value: { fontSize: 13, color: colors.text.primary, lineHeight: 18 },
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
    backgroundColor: colors.status.success + '25',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.status.success + '50',
  },
  stepBubbleText: { fontSize: 11, fontWeight: '700', color: colors.status.success },
  progressTrack: { height: 3, backgroundColor: colors.border.light },
  progressFill: { height: '100%', borderRadius: 2 },
  scroll: { padding: 16, paddingTop: 20 },
  pageTitle: { fontSize: 17, fontWeight: '700', color: colors.text.primary, marginBottom: 2 },
  pageSub: { fontSize: 13, color: colors.text.secondary, marginBottom: 20, lineHeight: 18 },
  summaryCard: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.lg, padding: 16,
    marginBottom: 14,
    borderWidth: 1, borderColor: colors.border.light,
  },
  statsGrid: {
    flexDirection: 'row', gap: 8, marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.paper,
    borderRadius: radius.md, padding: 10,
    alignItems: 'center',
    borderWidth: 1, borderColor: colors.border.light,
  },
  statNumber: { fontSize: 20, fontWeight: '800', color: colors.primary.main },
  statLabel: { fontSize: 10, color: colors.text.disabled, textAlign: 'center', marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border.light, marginBottom: 20 },
  signTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  signSub: { fontSize: 12, color: colors.text.secondary, marginBottom: 16, lineHeight: 17 },
  signBox: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.lg,
    borderWidth: 2, borderColor: colors.border.medium,
    borderStyle: 'dashed',
    padding: 32, alignItems: 'center',
    marginBottom: 12,
  },
  signBoxDone: {
    borderColor: colors.status.success + '60',
    borderStyle: 'solid',
    backgroundColor: colors.status.success + '08',
  },
  signedState: { alignItems: 'center', gap: 8 },
  signedText: { fontSize: 15, fontWeight: '700', color: colors.status.success },
  signedSub: { fontSize: 12, color: colors.text.disabled },
  unsignedState: { alignItems: 'center', gap: 8 },
  unsignedText: { fontSize: 15, fontWeight: '600', color: colors.primary.main },
  unsignedSub: { fontSize: 12, color: colors.text.secondary },
  warningBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.status.warning + '12',
    borderRadius: radius.sm, padding: 12,
    borderWidth: 1, borderColor: colors.status.warning + '30',
  },
  warningText: { flex: 1, fontSize: 12, color: colors.status.warning },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 32,
    backgroundColor: colors.background.main,
    borderTopWidth: 1, borderTopColor: colors.border.light,
  },
  submitBtn: { borderRadius: radius.md, overflow: 'hidden' },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16,
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  signModal: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  signModalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  signModalTitle: { fontSize: 17, fontWeight: '700', color: colors.text.primary },
  signModalClose: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border.light,
  },
});
