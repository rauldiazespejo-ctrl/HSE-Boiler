import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft, CheckCircle2, XCircle, MapPin, Users, FileText,
  ClipboardList, Wrench, Package, ShieldCheck, AlertTriangle, Clock,
} from 'lucide-react-native';
import { api } from '../../../src/services/api';
import { TIPO_LABELS } from '../../../src/context/PermisoContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      {icon && <View style={styles.infoIcon}>{icon}</View>}
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function ChecklistPreview({ items, title }: { items: any[]; title: string }) {
  if (!items || items.length === 0) return null;
  const ok = items.filter(i => i.estado === 'OK').length;
  const nok = items.filter(i => i.estado === 'NO_OK').length;
  const na = items.filter(i => i.estado === 'NA').length;
  return (
    <View style={styles.checklistBox}>
      <Text style={styles.checklistTitle}>{title}</Text>
      <View style={styles.checklistStats}>
        <View style={[styles.csStat, { backgroundColor: colors.status.success + '20' }]}>
          <Text style={[styles.csVal, { color: colors.status.success }]}>{ok}</Text>
          <Text style={styles.csKey}>OK</Text>
        </View>
        <View style={[styles.csStat, { backgroundColor: colors.status.danger + '20' }]}>
          <Text style={[styles.csVal, { color: colors.status.danger }]}>{nok}</Text>
          <Text style={styles.csKey}>NOK</Text>
        </View>
        <View style={[styles.csStat, { backgroundColor: colors.text.disabled + '20' }]}>
          <Text style={[styles.csVal, { color: colors.text.disabled }]}>{na}</Text>
          <Text style={styles.csKey}>N/A</Text>
        </View>
        <View style={[styles.csStat, { backgroundColor: colors.background.elevated }]}>
          <Text style={[styles.csVal, { color: colors.text.secondary }]}>{items.length}</Text>
          <Text style={styles.csKey}>Total</Text>
        </View>
      </View>
      {nok > 0 && (
        <View style={styles.nokWarning}>
          <AlertTriangle color={colors.status.danger} size={13} />
          <Text style={styles.nokWarningText}>{nok} item(s) NOK — requiere revisión</Text>
        </View>
      )}
    </View>
  );
}

export default function ApproveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doc, setDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comentarios, setComentarios] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchDoc();
  }, [id]);

  const fetchDoc = async () => {
    try {
      const res = await api.get(`/documentos/${id}`);
      if (res.data.success) setDoc(res.data.data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el documento.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = () => {
    Alert.alert(
      'Confirmar Aprobación',
      '¿Estás seguro de APROBAR este permiso de trabajo? Esta acción autorizará su ejecución.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aprobar', style: 'default', onPress: submitApprove },
      ]
    );
  };

  const handleReject = () => {
    if (!comentarios.trim()) {
      Alert.alert('Motivo requerido', 'Debes indicar el motivo del rechazo en el campo de comentarios.');
      return;
    }
    Alert.alert(
      'Confirmar Rechazo',
      '¿Estás seguro de RECHAZAR este permiso? El operario deberá corregirlo y reenviarlo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Rechazar', style: 'destructive', onPress: submitReject },
      ]
    );
  };

  const submitApprove = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post(`/documentos/${id}/aprobar`, { comentarios });
      if (res.data.success) {
        Alert.alert('✓ Permiso Aprobado', res.data.message || 'El permiso fue aprobado exitosamente.', [
          { text: 'OK', onPress: () => router.replace('/jefe') },
        ]);
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'No se pudo aprobar el documento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReject = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post(`/documentos/${id}/rechazar`, { comentarios });
      if (res.data.success) {
        Alert.alert('Permiso Rechazado', 'El operario será notificado para corregir el documento.', [
          { text: 'OK', onPress: () => router.replace('/jefe') },
        ]);
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'No se pudo rechazar el documento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contenido = doc?.contenido_json || {};
  const tipoLabel = TIPO_LABELS[doc?.tipo_documento] || doc?.tipo_documento || '—';

  const controles = contenido.controlesCriticos ? Object.values(contenido.controlesCriticos) : [];
  const controlesOK = controles.filter((c: any) => c.verificado).length;
  const riesgos: string[] = contenido.riesgos_json || doc?.riesgos_json || [];

  const estadoColor: Record<string, string> = {
    PENDIENTE_JEFE: colors.status.warning,
    PENDIENTE_LIDER: colors.primary.main,
    APROBADO: colors.status.success,
    RECHAZADO: colors.status.danger,
  };
  const estadoLabel: Record<string, string> = {
    PENDIENTE_JEFE: 'Pendiente de autorización',
    PENDIENTE_LIDER: 'Borrador — en revisión del operario',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado',
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={colors.text.primary} size={22} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Revisar Permiso</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{tipoLabel}</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.secondary.main} style={{ marginTop: 80 }} />
      ) : !doc ? null : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.statusCard}>
            <View style={[styles.statusDot, { backgroundColor: estadoColor[doc.estado] || colors.text.disabled }]} />
            <View>
              <Text style={styles.statusLabel}>{estadoLabel[doc.estado] || doc.estado}</Text>
              <Text style={styles.statusNum}>#{doc.numero_documento}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: (estadoColor[doc.estado] || colors.text.disabled) + '20', borderColor: (estadoColor[doc.estado] || colors.text.disabled) + '40' }]}>
              <Clock color={estadoColor[doc.estado] || colors.text.disabled} size={11} />
              <Text style={[styles.statusBadgeText, { color: estadoColor[doc.estado] || colors.text.disabled }]}>
                {doc.fecha_creacion ? new Date(doc.fecha_creacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
              </Text>
            </View>
          </Animated.View>

          {doc.estado === 'APROBADO' && doc.aprobador && (
            <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.selloCard}>
              <LinearGradient
                colors={[colors.status.success + '20', colors.status.success + '08']}
                style={styles.selloGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <View style={styles.selloHeader}>
                  <View style={styles.selloIconWrap}>
                    <ShieldCheck color={colors.status.success} size={22} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selloTitle}>PERMISO AUTORIZADO</Text>
                    <Text style={styles.selloSub}>Sello de aprobación oficial</Text>
                  </View>
                </View>
                <View style={styles.selloDivider} />
                <View style={styles.selloBody}>
                  <View style={styles.selloField}>
                    <Text style={styles.selloFieldLabel}>APROBADO POR</Text>
                    <Text style={styles.selloFieldValue}>{doc.aprobador.nombre}</Text>
                  </View>
                  <View style={styles.selloField}>
                    <Text style={styles.selloFieldLabel}>RUT</Text>
                    <Text style={styles.selloFieldValue}>
                      {doc.aprobador.certificaciones_json?.rut || '—'}
                    </Text>
                  </View>
                  <View style={styles.selloField}>
                    <Text style={styles.selloFieldLabel}>CARGO</Text>
                    <Text style={styles.selloFieldValue}>
                      {doc.aprobador.certificaciones_json?.cargo || doc.aprobador.rol}
                    </Text>
                  </View>
                  <View style={styles.selloField}>
                    <Text style={styles.selloFieldLabel}>FECHA Y HORA</Text>
                    <Text style={styles.selloFieldValue}>
                      {doc.fecha_aprobacion
                        ? new Date(doc.fecha_aprobacion).toLocaleString('es-CL', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.card}>
            <Text style={styles.cardTitle}>Información del Trabajo</Text>
            <InfoRow label="Tipo de Trabajo" value={tipoLabel} icon={<ClipboardList color={colors.primary.main} size={14} />} />
            <InfoRow label="Zona de Trabajo" value={doc.sector} icon={<MapPin color={colors.secondary.main} size={14} />} />
            <InfoRow label="Descripción" value={contenido.descripcionTrabajo} icon={<FileText color={colors.text.disabled} size={14} />} />
            <InfoRow
              label="Equipo de Trabajo"
              value={Array.isArray(contenido.equipoTrabajo) ? contenido.equipoTrabajo.join(', ') : contenido.equipoTrabajo}
              icon={<Users color={colors.text.disabled} size={14} />}
            />
            <InfoRow label="Operario" value={doc.creador?.nombre} icon={<Users color={colors.text.disabled} size={14} />} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.card}>
            <Text style={styles.cardTitle}>Controles Críticos — AST</Text>
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { borderColor: controlesOK === controles.length && controles.length > 0 ? colors.status.success + '50' : colors.status.warning + '50' }]}>
                <Text style={[styles.statNum, { color: controlesOK === controles.length && controles.length > 0 ? colors.status.success : colors.status.warning }]}>
                  {controlesOK}/{controles.length}
                </Text>
                <Text style={styles.statLabel}>Verificados</Text>
              </View>
              <View style={[styles.statBox, { borderColor: colors.status.warning + '50' }]}>
                <Text style={[styles.statNum, { color: colors.status.warning }]}>
                  {Array.isArray(riesgos) ? riesgos.length : 0}
                </Text>
                <Text style={styles.statLabel}>Riesgos id.</Text>
              </View>
              <View style={[styles.statBox, { borderColor: colors.status.success + '50' }]}>
                <Text style={[styles.statNum, { color: colors.status.success }]}>
                  {contenido.checklistHerramientas?.filter((i: any) => i.estado !== null).length || 0}
                </Text>
                <Text style={styles.statLabel}>Herram. OK</Text>
              </View>
            </View>

            {controlesOK < controles.length && (
              <View style={styles.alertBanner}>
                <AlertTriangle color={colors.status.warning} size={14} />
                <Text style={styles.alertBannerText}>
                  {controles.length - controlesOK} control(es) crítico(s) sin verificar
                </Text>
              </View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.card}>
            <Text style={styles.cardTitle}>Checklists</Text>
            <ChecklistPreview items={contenido.checklistHerramientas || []} title="Checklist de Herramientas" />
            <ChecklistPreview items={contenido.checklistEquipos || []} title="Checklist de Equipos" />
          </Animated.View>

          {contenido.anexos && contenido.anexos.length > 0 && (
            <Animated.View entering={FadeInDown.delay(240).springify()} style={styles.card}>
              <Text style={styles.cardTitle}>Documentos Adjuntos</Text>
              {contenido.anexos.map((a: any) => (
                <View key={a.id} style={styles.anexoRow}>
                  <FileText color={a.base64 ? colors.status.success : colors.text.disabled} size={14} />
                  <Text style={[styles.anexoName, a.base64 ? styles.anexoOK : styles.anexoPending]}>
                    {a.nombre}
                  </Text>
                  <Text style={[styles.anexoBadge, { color: a.base64 ? colors.status.success : (a.requerido ? colors.status.danger : colors.text.disabled) }]}>
                    {a.base64 ? 'OK' : a.requerido ? 'FALTANTE' : 'Opcional'}
                  </Text>
                </View>
              ))}
            </Animated.View>
          )}

          {contenido.ubicacionGPS && (
            <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.card}>
              <Text style={styles.cardTitle}>Ubicación GPS</Text>
              <View style={styles.gpsRow}>
                <MapPin color={colors.secondary.main} size={14} />
                <Text style={styles.gpsText}>
                  {contenido.ubicacionGPS.latitud?.toFixed(6)}, {contenido.ubicacionGPS.longitud?.toFixed(6)}
                </Text>
              </View>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(360).springify()} style={styles.card}>
            <Text style={styles.cardTitle}>Comentarios del Jefe</Text>
            <Text style={styles.cardSub}>Agrega observaciones (obligatorio en caso de rechazo)</Text>
            <TextInput
              style={styles.textArea}
              value={comentarios}
              onChangeText={setComentarios}
              placeholder="Escribe tus observaciones aquí..."
              placeholderTextColor={colors.text.disabled}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Animated.View>

          <View style={{ height: 140 }} />
        </ScrollView>
      )}

      {!isLoading && doc && doc.estado === 'PENDIENTE_JEFE' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.rejectBtn, isSubmitting && styles.btnDisabled]}
            onPress={handleReject}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <XCircle color={colors.status.danger} size={18} />
            <Text style={styles.rejectBtnText}>Rechazar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.approveBtn, isSubmitting && styles.btnDisabled]}
            onPress={handleApprove}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={colors.gradients.success}
              style={styles.approveBtnGrad}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <CheckCircle2 color="#FFF" size={18} />
                  <Text style={styles.approveBtnText}>Autorizar Permiso</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && doc && doc.estado !== 'PENDIENTE_JEFE' && (
        <View style={styles.footer}>
          <View style={[styles.resolvedBanner, { borderColor: (estadoColor[doc.estado] || colors.text.disabled) + '40', backgroundColor: (estadoColor[doc.estado] || colors.text.disabled) + '12' }]}>
            <ShieldCheck color={estadoColor[doc.estado] || colors.text.disabled} size={18} />
            <Text style={[styles.resolvedText, { color: estadoColor[doc.estado] || colors.text.disabled }]}>
              {estadoLabel[doc.estado] || doc.estado}
            </Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.main },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border.light,
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  headerSub: { fontSize: 12, color: colors.text.secondary, marginTop: 1 },
  scroll: { padding: 16, paddingTop: 20 },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.background.paper,
    borderRadius: radius.lg, padding: 14,
    marginBottom: 14,
    borderWidth: 1, borderColor: colors.border.light,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: 13, fontWeight: '700', color: colors.text.primary },
  statusNum: { fontSize: 11, color: colors.text.disabled, marginTop: 2 },
  statusBadge: {
    marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: radius.full, borderWidth: 1,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '600' },
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.lg, padding: 16,
    marginBottom: 14,
    borderWidth: 1, borderColor: colors.border.light,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text.primary, marginBottom: 12 },
  cardSub: { fontSize: 12, color: colors.text.secondary, marginBottom: 10, marginTop: -8 },
  infoRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  infoIcon: {
    width: 24, height: 24, borderRadius: 7,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center', alignItems: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 10, color: colors.text.disabled, fontWeight: '700', letterSpacing: 0.3 },
  infoValue: { fontSize: 13, color: colors.text.primary, marginTop: 2, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statBox: {
    flex: 1, borderRadius: radius.md, padding: 10, alignItems: 'center',
    backgroundColor: colors.background.elevated, borderWidth: 1,
  },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: colors.text.disabled, textAlign: 'center', marginTop: 2 },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.status.warning + '12',
    borderRadius: radius.sm, padding: 10,
    borderWidth: 1, borderColor: colors.status.warning + '30',
  },
  alertBannerText: { flex: 1, fontSize: 12, color: colors.status.warning },
  checklistBox: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md, padding: 12, marginBottom: 10,
  },
  checklistTitle: { fontSize: 12, fontWeight: '700', color: colors.text.secondary, marginBottom: 10 },
  checklistStats: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  csStat: {
    flex: 1, borderRadius: radius.sm, padding: 8, alignItems: 'center',
  },
  csVal: { fontSize: 18, fontWeight: '800' },
  csKey: { fontSize: 9, color: colors.text.disabled, fontWeight: '700', marginTop: 2 },
  nokWarning: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.status.danger + '10',
    borderRadius: radius.sm, padding: 8, marginTop: 6,
    borderWidth: 1, borderColor: colors.status.danger + '30',
  },
  nokWarningText: { flex: 1, fontSize: 11, color: colors.status.danger },
  anexoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  anexoName: { flex: 1, fontSize: 12 },
  anexoOK: { color: colors.text.primary },
  anexoPending: { color: colors.text.disabled },
  anexoBadge: { fontSize: 10, fontWeight: '700' },
  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gpsText: { fontSize: 12, color: colors.text.secondary },
  textArea: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md, padding: 12,
    color: colors.text.primary, fontSize: 14,
    minHeight: 100, lineHeight: 20,
    borderWidth: 1, borderColor: colors.border.medium,
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10,
    padding: 16, paddingBottom: 32,
    backgroundColor: colors.background.main,
    borderTopWidth: 1, borderTopColor: colors.border.light,
  },
  rejectBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.status.danger + '15',
    borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.status.danger + '40',
  },
  rejectBtnText: { fontSize: 14, fontWeight: '700', color: colors.status.danger },
  approveBtn: { flex: 1, borderRadius: radius.md, overflow: 'hidden' },
  approveBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
  },
  approveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  btnDisabled: { opacity: 0.5 },
  resolvedBanner: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: radius.md, padding: 14,
    borderWidth: 1,
  },
  resolvedText: { fontSize: 14, fontWeight: '700' },
  selloCard: {
    borderRadius: radius.lg, overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1.5, borderColor: colors.status.success + '50',
    ...shadows.glow(colors.status.success),
  },
  selloGrad: { padding: 16 },
  selloHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  selloIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.status.success + '25',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.status.success + '40',
  },
  selloTitle: {
    fontSize: 13, fontWeight: '800', color: colors.status.success,
    letterSpacing: 1.2,
  },
  selloSub: { fontSize: 11, color: colors.status.success + 'AA', marginTop: 2 },
  selloDivider: {
    height: 1, backgroundColor: colors.status.success + '30', marginBottom: 12,
  },
  selloBody: { gap: 10 },
  selloField: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.status.success + '10',
    borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.status.success + '20',
  },
  selloFieldLabel: {
    fontSize: 9, fontWeight: '800', color: colors.status.success + 'AA', letterSpacing: 0.8,
  },
  selloFieldValue: {
    fontSize: 13, fontWeight: '700', color: colors.text.primary, maxWidth: '65%', textAlign: 'right',
  },
});
