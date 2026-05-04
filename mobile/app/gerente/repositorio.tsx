import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '../../src/theme/colors';
import {
  ArrowLeft, Search, X, CheckCircle, Clock, XCircle,
  ChevronRight, Filter, FileText, AlertTriangle,
} from 'lucide-react-native';
import { api } from '../../src/services/api';
import { TIPO_LABELS } from '../../src/context/PermisoContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

type EstadoFiltro = 'TODOS' | 'PENDIENTE_JEFE' | 'APROBADO' | 'RECHAZADO';

const FILTROS: { key: EstadoFiltro; label: string; color: string }[] = [
  { key: 'TODOS',         label: 'Todos',      color: colors.text.secondary },
  { key: 'PENDIENTE_JEFE', label: 'Pendientes', color: colors.status.warning },
  { key: 'APROBADO',      label: 'Aprobados',  color: colors.status.success },
  { key: 'RECHAZADO',     label: 'Rechazados', color: colors.status.danger },
];

function estadoIcon(estado: string) {
  if (estado === 'APROBADO')      return <CheckCircle color={colors.status.success} size={15} />;
  if (estado === 'RECHAZADO')     return <XCircle color={colors.status.danger} size={15} />;
  if (estado === 'PENDIENTE_JEFE') return <Clock color={colors.status.warning} size={15} />;
  return <FileText color={colors.text.disabled} size={15} />;
}

function estadoLabel(estado: string) {
  if (estado === 'APROBADO')       return 'Aprobado';
  if (estado === 'RECHAZADO')      return 'Rechazado';
  if (estado === 'PENDIENTE_JEFE') return 'Pendiente';
  return estado;
}

function estadoColor(estado: string) {
  if (estado === 'APROBADO')       return colors.status.success;
  if (estado === 'RECHAZADO')      return colors.status.danger;
  if (estado === 'PENDIENTE_JEFE') return colors.status.warning;
  return colors.text.disabled;
}

function riesgoColor(tipo: string) {
  if (['TRABAJO_CALIENTE', 'IZAJE_GRUA', 'TRABAJO_ALTURA', 'TRABAJO_ELECTRICO', 'ESPACIO_CONFINADO'].includes(tipo))
    return colors.status.danger;
  if (['GRUA_HORQUILLA', 'ESMERILADO'].includes(tipo)) return colors.status.warning;
  return colors.status.info;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function Repositorio() {
  const [docs, setDocs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState<EstadoFiltro>('TODOS');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try {
      const res = await api.get('/documentos');
      if (res.data.success) setDocs(res.data.data);
    } catch {
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const filtered = docs.filter(d => {
    const matchEstado = filtro === 'TODOS' || d.estado === filtro;
    if (!matchEstado) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const tipo = (TIPO_LABELS[d.tipo_documento] || d.tipo_documento || '').toLowerCase();
    const sector = (d.sector || '').toLowerCase();
    const creador = (d.creador?.nombre || '').toLowerCase();
    const num = (d.numero_documento || '').toLowerCase();
    return tipo.includes(q) || sector.includes(q) || creador.includes(q) || num.includes(q);
  });

  const total     = docs.length;
  const aprobados = docs.filter(d => d.estado === 'APROBADO').length;
  const pendientes = docs.filter(d => d.estado === 'PENDIENTE_JEFE').length;
  const rechazados = docs.filter(d => d.estado === 'RECHAZADO').length;

  const renderDoc = useCallback(({ item, index }: { item: any; index: number }) => {
    const tipoLabel = TIPO_LABELS[item.tipo_documento] || item.tipo_documento;
    const rc = riesgoColor(item.tipo_documento);
    const ec = estadoColor(item.estado);
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/gerente/documento/${item.id_documento}`)}
          activeOpacity={0.8}
        >
          <View style={[styles.riskBar, { backgroundColor: rc }]} />
          <View style={styles.cardBody}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.cardTipo} numberOfLines={1}>{tipoLabel}</Text>
                <Text style={styles.cardSector} numberOfLines={1}>{item.sector || '—'}</Text>
              </View>
              <View style={[styles.estadoBadge, { backgroundColor: ec + '20', borderColor: ec + '50' }]}>
                {estadoIcon(item.estado)}
                <Text style={[styles.estadoText, { color: ec }]}>{estadoLabel(item.estado)}</Text>
              </View>
            </View>

            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>
                Operario: <Text style={styles.metaValue}>{item.creador?.nombre || '—'}</Text>
              </Text>
              <Text style={styles.metaText}>
                {formatDate(item.fecha_creacion)}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.numDoc}>#{item.numero_documento || String(item.id_documento).slice(-6)}</Text>
              {item.estado === 'APROBADO' && item.aprobador && (
                <Text style={styles.aprobadorText} numberOfLines={1}>
                  ✓ {item.aprobador.nombre}
                </Text>
              )}
              <ChevronRight color={colors.text.disabled} size={16} />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.paper, colors.background.main]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.text.primary} size={20} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Repositorio HSE</Text>
            <Text style={styles.headerSub}>Historial completo de documentación</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'Total',      value: total,     color: colors.text.primary },
            { label: 'Aprobados', value: aprobados,  color: colors.status.success },
            { label: 'Pendientes', value: pendientes, color: colors.status.warning },
            { label: 'Rechazados', value: rechazados, color: colors.status.danger },
          ].map(s => (
            <View key={s.label} style={styles.statChip}>
              <Text style={[styles.statNum, { color: s.color }]}>{isLoading ? '—' : s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Search color={colors.text.disabled} size={16} />
          <TextInput
            style={styles.searchText}
            placeholder="Buscar por tipo, sector, operario..."
            placeholderTextColor={colors.text.disabled}
            value={search}
            onChangeText={setSearch}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={10}>
              <X color={colors.text.disabled} size={15} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filtrosRow}>
        {FILTROS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filtroBtn, filtro === f.key && { borderColor: f.color, backgroundColor: f.color + '18' }]}
            onPress={() => setFiltro(f.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filtroText, filtro === f.key && { color: f.color }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary.main} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id_documento)}
          renderItem={renderDoc}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDocs(); }} tintColor={colors.primary.main} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <FileText color={colors.text.disabled} size={40} />
              <Text style={styles.emptyTitle}>Sin documentos</Text>
              <Text style={styles.emptySub}>No hay registros que coincidan con los filtros seleccionados</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.main },
  header: {
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border.light,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text.primary },
  headerSub: { fontSize: 12, color: colors.text.secondary, marginTop: 1 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statChip: {
    flex: 1, backgroundColor: colors.background.elevated,
    borderRadius: radius.md, padding: 10, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border.light,
  },
  statNum: { fontSize: 20, fontWeight: '800' },
  statLbl: { fontSize: 9, color: colors.text.disabled, fontWeight: '600', marginTop: 2 },
  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchInput: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.border.light,
  },
  searchText: { flex: 1, fontSize: 13, color: colors.text.primary },
  filtrosRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  filtroBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.border.light,
  },
  filtroText: { fontSize: 12, fontWeight: '600', color: colors.text.disabled },
  list: { padding: 16, paddingTop: 4, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.background.paper,
    borderRadius: radius.lg,
    marginBottom: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border.light,
    ...shadows.soft,
  },
  riskBar: { width: 4 },
  cardBody: { flex: 1, padding: 14, paddingLeft: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  cardTipo: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  cardSector: { fontSize: 12, color: colors.text.secondary },
  estadoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: radius.full, borderWidth: 1,
  },
  estadoText: { fontSize: 10, fontWeight: '700' },
  cardMeta: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaText: { fontSize: 11, color: colors.text.disabled },
  metaValue: { color: colors.text.secondary, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  numDoc: { fontSize: 11, color: colors.text.disabled, fontWeight: '600', flex: 1 },
  aprobadorText: { fontSize: 11, color: colors.status.success, fontWeight: '600', maxWidth: 160 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text.secondary },
  emptySub: { fontSize: 13, color: colors.text.disabled, textAlign: 'center', maxWidth: 260, lineHeight: 18 },
});
