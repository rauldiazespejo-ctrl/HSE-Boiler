import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '../../src/theme/colors';
import {
  LogOut, Clock, CheckCircle, XCircle, AlertTriangle, ChevronRight,
  Hammer, ClipboardList, TrendingUp, ShieldCheck, Plus,
} from 'lucide-react-native';
import { api } from '../../src/services/api';
import { AuthContext } from '../../src/context/AuthContext';
import { TIPO_LABELS } from '../../src/context/PermisoContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

function relativeDate(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Ayer';
  return new Date(dateStr).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
}

export default function JefeDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [approvedToday, setApprovedToday] = useState(0);
  const [rejectedToday, setRejectedToday] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/documentos');
      if (response.data.success) {
        const docs: any[] = response.data.data;
        const pendientes = docs.filter(d => d.estado === 'PENDIENTE_JEFE');
        const today = new Date().toDateString();
        const aprobados = docs.filter(d => d.estado === 'APROBADO' && new Date(d.fecha_aprobacion || d.fecha_actualizacion).toDateString() === today);
        const rechazados = docs.filter(d => d.estado === 'RECHAZADO' && new Date(d.fecha_actualizacion).toDateString() === today);
        const activos = docs.filter(d => d.estado === 'APROBADO');
        setPendingApprovals(pendientes);
        setApprovedToday(aprobados.length);
        setRejectedToday(rechazados.length);
        setTotalActive(activos.length);
      }
    } catch {
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => { await logout(); router.replace('/'); };

  const getRiskColor = (tipo: string) => {
    if (['TRABAJO_CALIENTE', 'IZAJE_GRUA', 'TRABAJO_ALTURA', 'TRABAJO_ELECTRICO', 'ESPACIO_CONFINADO'].includes(tipo))
      return colors.status.danger;
    if (['GRUA_HORQUILLA', 'ESMERILADO'].includes(tipo)) return colors.status.warning;
    return colors.status.info;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.main, colors.background.paper]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <LinearGradient colors={colors.secondary.gradient} style={StyleSheet.absoluteFill} />
              <Hammer color="#FFF" size={15} strokeWidth={2.5} />
            </View>
            <Text style={styles.brandName}>Boilercomp</Text>
            <View style={styles.roleBadge}>
              <ShieldCheck color={colors.secondary.main} size={11} />
              <Text style={styles.roleBadgeText}>Jefe Maestranza</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} hitSlop={12}>
            <LogOut color={colors.text.secondary} size={17} />
          </TouchableOpacity>
        </View>
        <Text style={styles.greeting}>Hola, {user?.nombre?.split(' ')[0] ?? 'Jefe'}</Text>
        <Text style={styles.greetingSub}>Panel de Autorización de Permisos HSE</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.secondary.main} />
        }
      >
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: colors.status.warning + '50' }]}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.status.warning + '20' }]}>
              <Clock color={colors.status.warning} size={18} />
            </View>
            <Text style={[styles.statNum, { color: colors.status.warning }]}>
              {isLoading ? '—' : pendingApprovals.length}
            </Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.status.success + '50' }]}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.status.success + '20' }]}>
              <CheckCircle color={colors.status.success} size={18} />
            </View>
            <Text style={[styles.statNum, { color: colors.status.success }]}>
              {isLoading ? '—' : approvedToday}
            </Text>
            <Text style={styles.statLabel}>Aprobados hoy</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.status.danger + '50' }]}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.status.danger + '20' }]}>
              <XCircle color={colors.status.danger} size={18} />
            </View>
            <Text style={[styles.statNum, { color: colors.status.danger }]}>
              {isLoading ? '—' : rejectedToday}
            </Text>
            <Text style={styles.statLabel}>Rechazados hoy</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.status.info + '50' }]}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.status.info + '20' }]}>
              <TrendingUp color={colors.status.info} size={18} />
            </View>
            <Text style={[styles.statNum, { color: colors.status.info }]}>
              {isLoading ? '—' : totalActive}
            </Text>
            <Text style={styles.statLabel}>Activos total</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Requieren Autorización</Text>
          {pendingApprovals.length > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingApprovals.length}</Text>
            </View>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.secondary.main} style={{ marginTop: 20 }} />
        ) : pendingApprovals.length === 0 ? (
          <Animated.View entering={FadeInDown.springify()} style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <ShieldCheck color={colors.status.success} size={36} />
            </View>
            <Text style={styles.emptyTitle}>Todo al día</Text>
            <Text style={styles.emptyText}>No hay permisos pendientes de autorización en este momento</Text>
          </Animated.View>
        ) : (
          pendingApprovals.map((doc, i) => {
            const riskColor = getRiskColor(doc.tipo_documento);
            const tipoLabel = TIPO_LABELS[doc.tipo_documento] || doc.tipo_documento;
            return (
              <Animated.View key={doc.id || i} entering={FadeInDown.delay(i * 60).springify()}>
                <Pressable
                  style={({ pressed }) => [styles.docCard, pressed && styles.docCardPressed]}
                  onPress={() => router.push(`/jefe/approve/${doc.id}`)}
                >
                  <LinearGradient
                    colors={[riskColor + '15', riskColor + '05']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  />
                  <View style={[styles.docCardBorder, { borderColor: riskColor + '40' }]} />

                  <View style={[styles.riskIndicator, { backgroundColor: riskColor }]} />

                  <View style={styles.docCardContent}>
                    <View style={styles.docCardTop}>
                      <View>
                        <Text style={styles.docType}>{tipoLabel}</Text>
                        <Text style={styles.docZona}>{doc.sector || '—'}</Text>
                      </View>
                      <View style={styles.docCardRight}>
                        <View style={[styles.urgencyBadge, { backgroundColor: riskColor + '20', borderColor: riskColor + '50' }]}>
                          <AlertTriangle color={riskColor} size={11} />
                          <Text style={[styles.urgencyText, { color: riskColor }]}>PENDIENTE</Text>
                        </View>
                        <Text style={styles.docDate}>
                          {doc.fecha_creacion ? relativeDate(doc.fecha_creacion) : '—'}
                        </Text>
                      </View>
                    </View>

                    {doc.operario && (
                      <Text style={styles.docOperario}>Operario: {doc.operario}</Text>
                    )}

                    <View style={styles.docCardFooter}>
                      <Text style={styles.docNum}>#{doc.numero_documento || doc.id?.slice(-6)}</Text>
                      <View style={styles.reviewBtn}>
                        <Text style={styles.reviewBtnText}>Revisar y Autorizar</Text>
                        <ChevronRight color={colors.secondary.main} size={14} />
                      </View>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/lider')} activeOpacity={0.85}>
        <LinearGradient colors={colors.primary.gradient} style={styles.fabGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Plus color="#FFF" size={22} strokeWidth={2.5} />
          <Text style={styles.fabText}>Nueva Actividad</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  header: {
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: {
    width: 28, height: 28, borderRadius: 8,
    overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
  },
  brandName: { fontSize: 16, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.3 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.secondary.main + '15',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.secondary.main + '30',
  },
  roleBadgeText: { fontSize: 10, fontWeight: '700', color: colors.secondary.main },
  logoutBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border.light,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text.primary },
  greetingSub: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  scroll: { padding: 16, paddingTop: 20 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: colors.background.paper,
    borderRadius: radius.md, padding: 10, alignItems: 'center', gap: 6,
    borderWidth: 1,
  },
  statIconCircle: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
  },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 9, color: colors.text.disabled, textAlign: 'center', fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  pendingBadge: {
    backgroundColor: colors.status.warning,
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  pendingBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.status.success + '15',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.status.success + '30',
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text.primary },
  emptyText: { fontSize: 13, color: colors.text.secondary, textAlign: 'center', maxWidth: 240, lineHeight: 18 },
  docCard: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.lg,
    marginBottom: 12, overflow: 'hidden',
    position: 'relative',
    ...shadows.soft,
  },
  docCardPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  docCardBorder: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radius.lg, borderWidth: 1,
  },
  riskIndicator: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
    borderTopLeftRadius: radius.lg, borderBottomLeftRadius: radius.lg,
  },
  docCardContent: { padding: 16, paddingLeft: 20 },
  docCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  docType: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  docZona: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  docCardRight: { alignItems: 'flex-end', gap: 4 },
  urgencyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: radius.full, borderWidth: 1,
  },
  urgencyText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  docDate: { fontSize: 10, color: colors.text.disabled },
  docOperario: { fontSize: 12, color: colors.text.secondary, marginBottom: 10 },
  docCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  docNum: { fontSize: 11, color: colors.text.disabled, fontWeight: '600' },
  reviewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.secondary.main + '15',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.secondary.main + '40',
  },
  reviewBtnText: { fontSize: 11, fontWeight: '700', color: colors.secondary.main },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    borderRadius: radius.full, overflow: 'hidden',
    ...shadows.soft,
  },
  fabGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  fabText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
