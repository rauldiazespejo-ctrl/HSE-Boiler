import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft, MapPin, Users, FileText, ClipboardList,
  CheckCircle, XCircle, Clock, ShieldCheck, AlertTriangle, Leaf,
} from 'lucide-react-native';
import { api } from '../../../src/services/api';
import { TIPO_LABELS } from '../../../src/context/PermisoContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

function InfoRow({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) {
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

function ChecklistPreview({ items, title, color }: { items: any[]; title: string; color?: string }) {
  if (!items || items.length === 0) return null;
  const ok  = items.filter(i => i.estado === 'OK').length;
  const nok = items.filter(i => i.estado === 'NO_OK').length;
  const na  = items.filter(i => i.estado === 'NA').length;
  const c   = color || colors.primary.main;
  return (
    <View style={[styles.clBox, { borderColor: c + '30' }]}>
      <Text style={[styles.clTitle, { color: c }]}>{title}</Text>
      <View style={styles.clStats}>
        {[
          { label: 'OK',    val: ok,  bg: colors.status.success },
          { label: 'NOK',   val: nok, bg: colors.status.danger },
          { label: 'N/A',   val: na,  bg: colors.text.disabled },
          { label: 'Total', val: items.length, bg: colors.secondary.main },
        ].map(s => (
          <View key={s.label} style={[styles.clStat, { backgroundColor: s.bg + '20' }]}>
            <Text style={[styles.clVal, { color: s.bg }]}>{s.val}</Text>
            <Text style={styles.clKey}>{s.label}</Text>
          </View>
        ))}
      </View>
      {nok > 0 && (
        <View style={styles.nokRow}>
          <AlertTriangle color={colors.status.danger} size={12} />
          <Text style={styles.nokText}>{nok} ítem(s) NOK — requiere revisión</Text>
        </View>
      )}
    </View>
  );
}

function estadoBadge(estado: string) {
  const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    APROBADO:      { label: 'Aprobado',  color: colors.status.success, icon: <CheckCircle color={colors.status.success} size={14} /> },
    RECHAZADO:     { label: 'Rechazado', color: colors.status.danger,  icon: <XCircle color={colors.status.danger} size={14} /> },
    PENDIENTE_JEFE:{ label: 'Pendiente', color: colors.status.warning, icon: <Clock color={colors.status.warning} size={14} /> },
  };
  const m = map[estado] || { label: estado, color: colors.text.disabled, icon: null };
  return (
    <View style={[styles.estadoBadge, { backgroundColor: m.color + '20', borderColor: m.color + '50' }]}>
      {m.icon}
      <Text style={[styles.estadoText, { color: m.color }]}>{m.label}</Text>
    </View>
  );
}

export default function DocumentoDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doc, setDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { if (id) fetchDoc(); }, [id]);

  const fetchDoc = async () => {
    try {
      const res = await api.get(`/documentos/${id}`);
      if (res.data.success) setDoc(res.data.data);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={colors.primary.main} size="large" />
      </View>
    );
  }

  if (!doc) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: colors.text.secondary }}>Documento no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary.main }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const contenido = doc.contenido_json || {};
  const tipoLabel = TIPO_LABELS[doc.tipo_documento] || doc.tipo_documento;
  const controles = Object.entries(contenido.controlesCriticos || {});
  const controlesOK = controles.filter(([, v]: any) => v.verificado).length;
  const riesgos: string[] = Array.isArray(contenido.riesgoSeleccionados || contenido.riesgosSeleccionados)
    ? (contenido.riesgoSeleccionados || contenido.riesgosSeleccionados)
    : [];
  const normas: string[] = contenido.normas || ['ISO 45001:2018'];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.paper, colors.background.main]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.text.primary} size={20} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{tipoLabel}</Text>
            <Text style={styles.headerSub}>#{doc.numero_documento || String(doc.id_documento).slice(-6)}</Text>
          </View>
          {estadoBadge(doc.estado)}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {doc.estado === 'APROBADO' && doc.aprobador && (
          <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.selloCard}>
            <LinearGradient
              colors={[colors.status.success + '20', colors.status.success + '08']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />
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
            <View style={styles.selloGrid}>
              <View style={styles.selloField}>
                <Text style={styles.selloLbl}>APROBADO POR</Text>
                <Text style={styles.selloVal}>{doc.aprobador.nombre}</Text>
              </View>
              <View style={styles.selloField}>
                <Text style={styles.selloLbl}>RUT</Text>
                <Text style={styles.selloVal}>{doc.aprobador.certificaciones_json?.rut || '—'}</Text>
              </View>
              <View style={styles.selloField}>
                <Text style={styles.selloLbl}>CARGO</Text>
                <Text style={styles.selloVal}>{doc.aprobador.certificaciones_json?.cargo || doc.aprobador.rol}</Text>
              </View>
              <View style={styles.selloField}>
                <Text style={styles.selloLbl}>FECHA Y HORA</Text>
                <Text style={styles.selloVal}>
                  {doc.fecha_aprobacion
                    ? new Date(doc.fecha_aprobacion).toLocaleString('es-CL', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })
                    : '—'}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {doc.estado === 'RECHAZADO' && (
          <Animated.View entering={FadeInDown.delay(0).springify()} style={[styles.selloCard, { borderColor: colors.status.danger + '40' }]}>
            <LinearGradient
              colors={[colors.status.danger + '20', colors.status.danger + '08']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.selloHeader}>
              <View style={[styles.selloIconWrap, { backgroundColor: colors.status.danger + '20' }]}>
                <XCircle color={colors.status.danger} size={22} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.selloTitle, { color: colors.status.danger }]}>PERMISO RECHAZADO</Text>
                {doc.motivo_rechazo && <Text style={styles.selloSub}>{doc.motivo_rechazo}</Text>}
              </View>
            </View>
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
          <InfoRow label="Operario / Creador" value={doc.creador?.nombre} icon={<Users color={colors.text.disabled} size={14} />} />
          <InfoRow
            label="Fecha de Creación"
            value={doc.fecha_creacion ? new Date(doc.fecha_creacion).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : undefined}
            icon={<Clock color={colors.text.disabled} size={14} />}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.card}>
          <Text style={styles.cardTitle}>Controles Críticos — AST</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { borderColor: controlesOK === controles.length && controles.length > 0 ? colors.status.success + '50' : colors.status.warning + '50' }]}>
              <Text style={[styles.statNum, { color: controlesOK === controles.length && controles.length > 0 ? colors.status.success : colors.status.warning }]}>
                {controlesOK}/{controles.length}
              </Text>
              <Text style={styles.statLbl}>Verificados</Text>
            </View>
            <View style={[styles.statBox, { borderColor: colors.status.warning + '50' }]}>
              <Text style={[styles.statNum, { color: colors.status.warning }]}>{riesgos.length}</Text>
              <Text style={styles.statLbl}>Riesgos id.</Text>
            </View>
            <View style={[styles.statBox, { borderColor: colors.secondary.main + '50' }]}>
              <Text style={[styles.statNum, { color: colors.secondary.main }]}>
                {contenido.checklistHerramientas?.filter((i: any) => i.estado !== null).length || 0}
              </Text>
              <Text style={styles.statLbl}>Herram. OK</Text>
            </View>
          </View>
          {riesgos.length > 0 && (
            <View style={styles.riesgosList}>
              {riesgos.map((r, i) => (
                <View key={i} style={styles.riesgoChip}>
                  <AlertTriangle color={colors.status.warning} size={11} />
                  <Text style={styles.riesgoText}>{r}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.card}>
          <Text style={styles.cardTitle}>Checklists</Text>
          <ChecklistPreview items={contenido.checklistHerramientas || []} title="Herramientas" color={colors.primary.main} />
          <ChecklistPreview items={contenido.checklistEquipos || []} title="Equipos" color={colors.secondary.main} />
          <ChecklistPreview items={contenido.checklistMedioAmbiente || []} title="Controles Ambientales — ISO 14001" color="#22C55E" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.card}>
          <Text style={styles.cardTitle}>Firma y Normativa</Text>
          <View style={[styles.firmaBadge, contenido.firma ? styles.firmaOK : styles.firmaPending]}>
            {contenido.firma
              ? <CheckCircle color={colors.status.success} size={18} />
              : <Clock color={colors.status.warning} size={18} />}
            <Text style={[styles.firmaText, { color: contenido.firma ? colors.status.success : colors.status.warning }]}>
              {contenido.firma ? 'Firmado digitalmente por el operario' : 'Sin firma digital'}
            </Text>
          </View>
          <View style={styles.normasRow}>
            {normas.map(n => (
              <View key={n} style={styles.normaBadge}>
                <Text style={styles.normaText}>{n}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {contenido.ubicacionGPS && (
          <Animated.View entering={FadeInDown.delay(220).springify()} style={styles.card}>
            <Text style={styles.cardTitle}>Ubicación GPS</Text>
            <View style={styles.gpsRow}>
              <MapPin color={colors.secondary.main} size={16} />
              <Text style={styles.gpsText}>
                {contenido.ubicacionGPS.latitud?.toFixed(6)}, {contenido.ubicacionGPS.longitud?.toFixed(6)}
              </Text>
            </View>
            <Text style={styles.gpsTime}>
              {contenido.ubicacionGPS.timestamp ? new Date(contenido.ubicacionGPS.timestamp).toLocaleString('es-CL') : ''}
            </Text>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.main },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.main },
  header: {
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border.light,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.text.primary },
  headerSub: { fontSize: 11, color: colors.text.disabled, marginTop: 1 },
  estadoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radius.full, borderWidth: 1,
  },
  estadoText: { fontSize: 11, fontWeight: '700' },
  scroll: { padding: 16, paddingTop: 12 },
  selloCard: {
    borderRadius: radius.lg, padding: 16,
    borderWidth: 1, borderColor: colors.status.success + '40',
    marginBottom: 12, overflow: 'hidden', position: 'relative',
  },
  selloHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  selloIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.status.success + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  selloTitle: { fontSize: 13, fontWeight: '800', color: colors.status.success, letterSpacing: 0.5 },
  selloSub: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  selloDivider: { height: 1, backgroundColor: colors.status.success + '25', marginBottom: 12 },
  selloGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  selloField: { width: '47%' },
  selloLbl: { fontSize: 9, color: colors.text.disabled, fontWeight: '700', letterSpacing: 0.8, marginBottom: 3 },
  selloVal: { fontSize: 13, fontWeight: '600', color: colors.text.primary },
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.lg, padding: 16,
    marginBottom: 12,
    borderWidth: 1, borderColor: colors.border.light,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.text.primary, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  infoIcon: { width: 24, height: 24, borderRadius: 7, backgroundColor: colors.background.elevated, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 10, color: colors.text.disabled, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 13, color: colors.text.primary, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBox: {
    flex: 1, padding: 10, borderRadius: radius.md,
    backgroundColor: colors.background.elevated,
    borderWidth: 1, alignItems: 'center',
  },
  statNum: { fontSize: 20, fontWeight: '800' },
  statLbl: { fontSize: 9, color: colors.text.disabled, fontWeight: '600', marginTop: 2 },
  riesgosList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  riesgoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.status.warning + '12',
    borderWidth: 1, borderColor: colors.status.warning + '30',
    borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4,
  },
  riesgoText: { fontSize: 11, color: colors.status.warning },
  clBox: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md, padding: 12,
    borderWidth: 1, marginBottom: 10,
  },
  clTitle: { fontSize: 12, fontWeight: '700', marginBottom: 10 },
  clStats: { flexDirection: 'row', gap: 8 },
  clStat: { flex: 1, borderRadius: radius.sm, padding: 8, alignItems: 'center' },
  clVal: { fontSize: 16, fontWeight: '800' },
  clKey: { fontSize: 9, color: colors.text.disabled, fontWeight: '600', marginTop: 2 },
  nokRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  nokText: { fontSize: 11, color: colors.status.danger },
  firmaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: radius.md, padding: 14,
    borderWidth: 1, marginBottom: 12,
  },
  firmaOK: { backgroundColor: colors.status.success + '12', borderColor: colors.status.success + '30' },
  firmaPending: { backgroundColor: colors.status.warning + '12', borderColor: colors.status.warning + '30' },
  firmaText: { fontSize: 13, fontWeight: '600' },
  normasRow: { flexDirection: 'row', gap: 8 },
  normaBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primary.main + '12',
    borderWidth: 1, borderColor: colors.primary.main + '40',
  },
  normaText: { fontSize: 10, fontWeight: '700', color: colors.primary.main },
  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  gpsText: { fontSize: 13, color: colors.secondary.main, fontWeight: '600' },
  gpsTime: { fontSize: 11, color: colors.text.disabled, marginLeft: 24 },
});
