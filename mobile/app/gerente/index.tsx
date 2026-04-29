import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '../../src/theme/colors';
import {
  LogOut, TrendingUp, ShieldCheck, AlertTriangle, CheckCircle,
  XCircle, Clock, BarChart2, Hammer, Activity, FileText,
} from 'lucide-react-native';
import { api } from '../../src/services/api';
import { AuthContext } from '../../src/context/AuthContext';
import { TIPO_LABELS } from '../../src/context/PermisoContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface KPI {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}

export default function GerenteDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [docs, setDocs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/documentos');
      if (response.data.success) setDocs(response.data.data);
    } catch {
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => { await logout(); router.replace('/'); };

  const total = docs.length;
  const aprobados = docs.filter(d => d.estado === 'APROBADO').length;
  const pendientes = docs.filter(d => d.estado === 'PENDIENTE_JEFE').length;
  const rechazados = docs.filter(d => d.estado === 'RECHAZADO').length;
  const borradores = docs.filter(d => d.estado === 'PENDIENTE_LIDER').length;
  const tasa = total > 0 ? Math.round((aprobados / total) * 100) : 0;

  const hoy = new Date().toDateString();
  const docsHoy = docs.filter(d => new Date(d.fecha_creacion).toDateString() === hoy).length;

  const tipoCounts: Record<string, number> = {};
  docs.forEach(d => {
    tipoCounts[d.tipo_documento] = (tipoCounts[d.tipo_documento] || 0) + 1;
  });
  const tipoSorted = Object.entries(tipoCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const tipoCriticos = docs.filter(d =>
    ['TRABAJO_CALIENTE', 'IZAJE_GRUA', 'TRABAJO_ALTURA', 'TRABAJO_ELECTRICO', 'ESPACIO_CONFINADO'].includes(d.tipo_documento)
  ).length;

  const kpis: KPI[] = [
    {
      label: 'Total Permisos',
      value: total,
      sub: `${docsHoy} hoy`,
      color: colors.primary.main,
      icon: <FileText color={colors.primary.main} size={20} />,
    },
    {
      label: 'Tasa Aprobación',
      value: `${tasa}%`,
      sub: `${aprobados} aprobados`,
      color: colors.status.success,
      icon: <TrendingUp color={colors.status.success} size={20} />,
    },
    {
      label: 'Pendientes',
      value: pendientes,
      sub: 'sin autorizar',
      color: colors.status.warning,
      icon: <Clock color={colors.status.warning} size={20} />,
    },
    {
      label: 'Trab. Críticos',
      value: tipoCriticos,
      sub: 'alto riesgo',
      color: colors.status.danger,
      icon: <AlertTriangle color={colors.status.danger} size={20} />,
    },
  ];

  const statusData = [
    { label: 'Aprobados', value: aprobados, color: colors.status.success, pct: total > 0 ? aprobados / total : 0 },
    { label: 'Pendientes', value: pendientes, color: colors.status.warning, pct: total > 0 ? pendientes / total : 0 },
    { label: 'Rechazados', value: rechazados, color: colors.status.danger, pct: total > 0 ? rechazados / total : 0 },
    { label: 'Borradores', value: borradores, color: colors.text.disabled, pct: total > 0 ? borradores / total : 0 },
  ];

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
              <LinearGradient colors={colors.gradients.success} style={StyleSheet.absoluteFill} />
              <Hammer color="#FFF" size={15} strokeWidth={2.5} />
            </View>
            <Text style={styles.brandName}>ForjaSafe</Text>
            <View style={styles.roleBadge}>
              <BarChart2 color={colors.status.success} size={11} />
              <Text style={styles.roleBadgeText}>Gerencia HSE</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} hitSlop={12}>
            <LogOut color={colors.text.secondary} size={17} />
          </TouchableOpacity>
        </View>
        <Text style={styles.greeting}>Dashboard Ejecutivo</Text>
        <Text style={styles.greetingSub}>Indicadores HSE — Maestranza {new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.status.success} />
        }
      >
        {isLoading ? (
          <ActivityIndicator color={colors.status.success} style={{ marginTop: 60 }} />
        ) : (
          <>
            <View style={styles.kpiGrid}>
              {kpis.map((kpi, i) => (
                <Animated.View key={kpi.label} entering={FadeInDown.delay(i * 60).springify()} style={styles.kpiCard}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: kpi.color + '18' }]}>
                    {kpi.icon}
                  </View>
                  <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                  <Text style={styles.kpiLabel}>{kpi.label}</Text>
                  {kpi.sub && <Text style={styles.kpiSub}>{kpi.sub}</Text>}
                </Animated.View>
              ))}
            </View>

            <Animated.View entering={FadeInDown.delay(240).springify()} style={styles.card}>
              <Text style={styles.cardTitle}>Estado de Documentos</Text>
              <View style={styles.stackedBar}>
                {statusData.filter(s => s.value > 0).map(s => (
                  <View
                    key={s.label}
                    style={[styles.stackedSegment, { flex: s.pct, backgroundColor: s.color }]}
                  />
                ))}
              </View>
              <View style={styles.legendRow}>
                {statusData.map(s => (
                  <View key={s.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                    <Text style={styles.legendLabel}>{s.label}</Text>
                    <Text style={[styles.legendVal, { color: s.color }]}>{s.value}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {tipoSorted.length > 0 && (
              <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.card}>
                <Text style={styles.cardTitle}>Trabajos más Frecuentes</Text>
                {tipoSorted.map(([tipo, count], i) => {
                  const pct = total > 0 ? count / total : 0;
                  return (
                    <View key={tipo} style={styles.barRow}>
                      <Text style={styles.barLabel} numberOfLines={1}>
                        {TIPO_LABELS[tipo] || tipo}
                      </Text>
                      <View style={styles.barTrack}>
                        <LinearGradient
                          colors={colors.primary.gradient}
                          style={[styles.barFill, { width: `${Math.round(pct * 100)}%` }]}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        />
                      </View>
                      <Text style={styles.barCount}>{count}</Text>
                    </View>
                  );
                })}
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(360).springify()} style={styles.card}>
              <Text style={styles.cardTitle}>Alertas y Estado Actual</Text>

              {pendientes > 0 ? (
                <View style={[styles.alertRow, { borderColor: colors.status.warning + '40', backgroundColor: colors.status.warning + '10' }]}>
                  <Clock color={colors.status.warning} size={16} />
                  <Text style={[styles.alertText, { color: colors.status.warning }]}>
                    {pendientes} permiso(s) esperando autorización del Jefe de Maestranza
                  </Text>
                </View>
              ) : (
                <View style={[styles.alertRow, { borderColor: colors.status.success + '40', backgroundColor: colors.status.success + '10' }]}>
                  <ShieldCheck color={colors.status.success} size={16} />
                  <Text style={[styles.alertText, { color: colors.status.success }]}>
                    Sin permisos pendientes — Operaciones al día
                  </Text>
                </View>
              )}

              {rechazados > 0 && (
                <View style={[styles.alertRow, { borderColor: colors.status.danger + '40', backgroundColor: colors.status.danger + '10' }]}>
                  <XCircle color={colors.status.danger} size={16} />
                  <Text style={[styles.alertText, { color: colors.status.danger }]}>
                    {rechazados} permiso(s) rechazado(s) — Requieren revisión del operario
                  </Text>
                </View>
              )}

              {tipoCriticos > 0 && (
                <View style={[styles.alertRow, { borderColor: colors.status.danger + '30', backgroundColor: colors.status.danger + '08' }]}>
                  <AlertTriangle color={colors.status.danger} size={16} />
                  <Text style={[styles.alertText, { color: colors.text.secondary }]}>
                    {tipoCriticos} trabajo(s) de alto riesgo registrado(s) este período
                  </Text>
                </View>
              )}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(420).springify()} style={[styles.card, styles.complianceCard]}>
              <LinearGradient
                colors={tasa >= 80 ? colors.gradients.success : tasa >= 50 ? colors.gradients.warning : colors.gradients.danger}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              />
              <View style={styles.complianceContent}>
                <Activity color="#FFF" size={24} />
                <View>
                  <Text style={styles.complianceTitle}>Tasa de Cumplimiento HSE</Text>
                  <Text style={styles.complianceSub}>
                    {tasa >= 80 ? 'Excelente — Meta cumplida' : tasa >= 50 ? 'Regular — Requiere atención' : 'Crítico — Acción inmediata'}
                  </Text>
                </View>
                <Text style={styles.compliancePct}>{tasa}%</Text>
              </View>
            </Animated.View>

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
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
    backgroundColor: colors.status.success + '15',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.status.success + '30',
  },
  roleBadgeText: { fontSize: 10, fontWeight: '700', color: colors.status.success },
  logoutBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border.light,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text.primary },
  greetingSub: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  scroll: { padding: 16, paddingTop: 20 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  kpiCard: {
    width: '47%',
    backgroundColor: colors.background.paper,
    borderRadius: radius.lg, padding: 16,
    borderWidth: 1, borderColor: colors.border.light,
    gap: 6,
  },
  kpiIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  kpiValue: { fontSize: 28, fontWeight: '800' },
  kpiLabel: { fontSize: 12, fontWeight: '700', color: colors.text.secondary },
  kpiSub: { fontSize: 11, color: colors.text.disabled },
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.lg, padding: 16,
    marginBottom: 14,
    borderWidth: 1, borderColor: colors.border.light,
    overflow: 'hidden',
    position: 'relative',
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text.primary, marginBottom: 14 },
  stackedBar: {
    flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden',
    backgroundColor: colors.background.elevated, marginBottom: 14,
  },
  stackedSegment: { height: '100%' },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: colors.text.secondary },
  legendVal: { fontSize: 11, fontWeight: '700' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  barLabel: { width: 100, fontSize: 11, color: colors.text.secondary },
  barTrack: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: colors.background.elevated, overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  barCount: { width: 24, textAlign: 'right', fontSize: 12, fontWeight: '700', color: colors.text.primary },
  alertRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: radius.sm, padding: 12, marginBottom: 8,
    borderWidth: 1,
  },
  alertText: { flex: 1, fontSize: 12, lineHeight: 17 },
  complianceCard: { borderWidth: 0 },
  complianceContent: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  complianceTitle: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  complianceSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  compliancePct: { marginLeft: 'auto', fontSize: 36, fontWeight: '800', color: '#FFF' },
});
