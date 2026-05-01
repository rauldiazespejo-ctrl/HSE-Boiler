import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '../../src/theme/colors';
import {
  Flame, ArrowUp, Truck, Cpu, Disc, Zap, Wrench,
  Forklift, Wind, ClipboardList, LogOut, ChevronRight, Clock, CheckCircle, XCircle, Hammer,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { api } from '../../src/services/api';
import { AuthContext } from '../../src/context/AuthContext';
import { TIPO_LABELS } from '../../src/context/PermisoContext';

interface WorkType {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  gradient: [string, string];
  risk: 'ALTO' | 'MEDIO' | 'CRITICO';
}

const WORK_TYPES: WorkType[] = [
  {
    id: 'TRABAJO_CALIENTE',
    title: 'Trabajo en Caliente',
    subtitle: 'Soldadura · Corte · Llama',
    icon: <Flame color="#FFF" size={22} />,
    route: '/lider/permiso/step1?tipo=TRABAJO_CALIENTE',
    color: '#EF4444',
    gradient: ['#EF4444', '#B91C1C'],
    risk: 'CRITICO',
  },
  {
    id: 'IZAJE_GRUA',
    title: 'Izaje con Puente Grúa',
    subtitle: 'Izaje de componentes pesados',
    icon: <Truck color="#FFF" size={22} />,
    route: '/lider/permiso/step1?tipo=IZAJE_GRUA',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#B45309'],
    risk: 'CRITICO',
  },
  {
    id: 'MECANIZADO_CNC',
    title: 'Mecanizado CNC',
    subtitle: 'Fresado · Mandrinado',
    icon: <Cpu color="#FFF" size={22} />,
    route: '/lider/permiso/step1?tipo=MECANIZADO_CNC',
    color: '#38BDF8',
    gradient: ['#38BDF8', '#0369A1'],
    risk: 'MEDIO',
  },
  {
    id: 'TORNERIA',
    title: 'Tornería',
    subtitle: 'Torno CNC y convencional',
    icon: <Disc color="#FFF" size={22} />,
    route: '/lider/permiso/step1?tipo=TORNERIA',
    color: '#A78BFA',
    gradient: ['#A78BFA', '#6D28D9'],
    risk: 'MEDIO',
  },
  {
    id: 'ESMERILADO',
    title: 'Esmerilado / Desbaste',
    subtitle: 'Amolado · Cepillado',
    icon: <Disc color="#FFF" size={22} />,
    route: '/lider/permiso/step1?tipo=ESMERILADO',
    color: '#F97316',
    gradient: ['#F97316', '#C2410C'],
    risk: 'ALTO',
  },
  {
    id: 'TRABAJO_ALTURA',
    title: 'Trabajo en Altura',
    subtitle: '> 1,8 m · Andamios · Escaleras',
    icon: <ArrowUp color="#FFF" size={22} />,
    route: '/lider/permiso/step1?tipo=TRABAJO_ALTURA',
    color: '#22C55E',
    gradient: ['#22C55E', '#15803D'],
    risk: 'CRITICO',
  },
  {
    id: 'TRABAJO_ELECTRICO',
    title: 'Trabajo Eléctrico',
    subtitle: 'BT · AT · LOTO',
    icon: <Zap color="#FFF" size={22} />,
    route: '/lider/permiso/step1?tipo=TRABAJO_ELECTRICO',
    color: '#FBBF24',
    gradient: ['#FBBF24', '#D97706'],
    risk: 'CRITICO',
  },
  {
    id: 'MANTENIMIENTO',
    title: 'Mantención de Equipos',
    subtitle: 'Preventiva · Correctiva',
    icon: <Wrench color="#FFF" size={22} />,
    route: '/lider/permiso/step1?tipo=MANTENIMIENTO',
    color: '#94A3B8',
    gradient: ['#94A3B8', '#475569'],
    risk: 'MEDIO',
  },
  {
    id: 'GRUA_HORQUILLA',
    title: 'Grúa Horquilla',
    subtitle: 'Montacargas · Reach stacker',
    icon: <Forklift color="#FFF" size={22} />,
    route: '/lider/permiso/step1?tipo=GRUA_HORQUILLA',
    color: '#FB923C',
    gradient: ['#FB923C', '#EA580C'],
    risk: 'ALTO',
  },
  {
    id: 'ESPACIO_CONFINADO',
    title: 'Espacio Confinado',
    subtitle: 'Silos · Ductos · Fosos',
    icon: <Wind color="#FFF" size={22} />,
    route: '/lider/permiso/step1?tipo=ESPACIO_CONFINADO',
    color: '#E879F9',
    gradient: ['#E879F9', '#A21CAF'],
    risk: 'CRITICO',
  },
];

const RISK_COLORS: Record<string, string> = {
  CRITICO: colors.status.danger,
  ALTO: colors.status.warning,
  MEDIO: colors.status.info,
};

const STATUS_INFO: Record<string, { label: string; color: string; Icon: any }> = {
  PENDIENTE_LIDER:  { label: 'Borrador', color: colors.text.secondary, Icon: ClipboardList },
  PENDIENTE_JEFE:   { label: 'Esperando Jefe', color: colors.status.warning, Icon: Clock },
  APROBADO:         { label: 'Aprobado', color: colors.status.success, Icon: CheckCircle },
  RECHAZADO:        { label: 'Rechazado', color: colors.status.danger, Icon: XCircle },
};

function relativeDate(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Ayer';
  return `${days} d`;
}

export default function OperarioDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/documentos');
      if (response.data.success) setHistory(response.data.data.slice(0, 5));
    } catch {
    } finally {
      setIsLoadingHistory(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.main, colors.background.paper]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <LinearGradient colors={colors.primary.gradient} style={StyleSheet.absoluteFill} />
              <Hammer color="#FFF" size={16} strokeWidth={2.5} />
            </View>
            <Text style={styles.brandName}>Boilercomp</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} hitSlop={12}>
            <LogOut color={colors.text.secondary} size={18} />
          </TouchableOpacity>
        </View>
        <Text style={styles.greeting}>Hola, {user?.nombre?.split(' ')[0] ?? 'Trabajador'} 👷</Text>
        <Text style={styles.greetingSub}>Selecciona el trabajo para iniciar tu documentación HSE</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHistory(); }} tintColor={colors.primary.main} />
        }
      >
        <Text style={styles.sectionTitle}>Tipo de Trabajo</Text>
        <Text style={styles.sectionSub}>Completa el formulario HSE · El jefe de maestranza autorizará la actividad</Text>

        <View style={styles.grid}>
          {WORK_TYPES.map((wt, i) => (
            <Animated.View key={wt.id} entering={FadeInDown.delay(i * 40).springify()} style={styles.gridItem}>
              <Pressable
                style={({ pressed }) => [styles.workCard, pressed && styles.workCardPressed]}
                onPress={() => router.push(wt.route as any)}
              >
                <LinearGradient
                  colors={[wt.color + '20', wt.color + '08']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={[styles.workCardBorder, { borderColor: wt.color + '40' }]} />

                <View style={[styles.workIconBg, { backgroundColor: wt.color }]}>
                  {wt.icon}
                </View>

                <Text style={styles.workTitle} numberOfLines={2}>{wt.title}</Text>
                <Text style={styles.workSubtitle} numberOfLines={1}>{wt.subtitle}</Text>

                <View style={[styles.riskBadge, { backgroundColor: RISK_COLORS[wt.risk] + '20' }]}>
                  <View style={[styles.riskDot, { backgroundColor: RISK_COLORS[wt.risk] }]} />
                  <Text style={[styles.riskText, { color: RISK_COLORS[wt.risk] }]}>{wt.risk}</Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Mis Documentos</Text>
          <View style={styles.historyCount}>
            <Text style={styles.historyCountText}>{history.length}</Text>
          </View>
        </View>

        {isLoadingHistory ? (
          <ActivityIndicator color={colors.primary.main} style={{ marginTop: 20 }} />
        ) : history.length === 0 ? (
          <View style={styles.emptyState}>
            <ClipboardList color={colors.text.disabled} size={40} />
            <Text style={styles.emptyTitle}>Sin documentos aún</Text>
            <Text style={styles.emptyText}>Inicia tu primer permiso seleccionando el tipo de trabajo arriba</Text>
          </View>
        ) : (
          history.map((doc, i) => {
            const status = STATUS_INFO[doc.estado] || STATUS_INFO.PENDIENTE_LIDER;
            const StatusIcon = status.Icon;
            const tipoLabel = TIPO_LABELS[doc.tipo_documento] || doc.tipo_documento;
            return (
              <Animated.View key={doc.id || i} entering={FadeInDown.delay(i * 60).springify()}>
                <TouchableOpacity style={styles.historyCard} activeOpacity={0.75}>
                  <View style={[styles.historyIconCircle, { backgroundColor: colors.primary.main + '20' }]}>
                    <ClipboardList color={colors.primary.main} size={18} />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyType} numberOfLines={1}>{tipoLabel}</Text>
                    <Text style={styles.historyZona} numberOfLines={1}>{doc.sector || '—'}</Text>
                  </View>
                  <View style={styles.historyRight}>
                    <View style={[styles.statusBadge, { backgroundColor: status.color + '18' }]}>
                      <StatusIcon color={status.color} size={12} />
                      <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
                    </View>
                    <Text style={styles.historyDate}>{doc.fecha_creacion ? relativeDate(doc.fecha_creacion) : '—'}</Text>
                  </View>
                  <ChevronRight color={colors.text.disabled} size={16} />
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: { fontSize: 17, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.3 },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  greeting: { fontSize: 24, fontWeight: '700', color: colors.text.primary },
  greetingSub: { fontSize: 14, color: colors.text.secondary, marginTop: 2 },
  scroll: { padding: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text.primary, marginBottom: 2 },
  sectionSub: { fontSize: 12, color: colors.text.secondary, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  gridItem: { width: '47%' },
  workCard: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.lg,
    padding: 14,
    overflow: 'hidden',
    minHeight: 140,
    position: 'relative',
  },
  workCardPressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  workCardBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  workIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  workTitle: { fontSize: 13, fontWeight: '700', color: colors.text.primary, marginBottom: 2, lineHeight: 17 },
  workSubtitle: { fontSize: 10, color: colors.text.secondary, marginBottom: 10 },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  riskDot: { width: 5, height: 5, borderRadius: 3 },
  riskText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  historyCount: {
    backgroundColor: colors.primary.main,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyCountText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.text.secondary },
  emptyText: { fontSize: 13, color: colors.text.disabled, textAlign: 'center', maxWidth: 220 },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.soft,
  },
  historyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: { flex: 1 },
  historyType: { fontSize: 13, fontWeight: '600', color: colors.text.primary },
  historyZona: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusLabel: { fontSize: 10, fontWeight: '600' },
  historyDate: { fontSize: 10, color: colors.text.disabled },
});
