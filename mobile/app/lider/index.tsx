import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Card } from '../../src/components/Card';
import { colors, radius } from '../../src/theme/colors';
import { Flame, Activity, ClipboardCheck, History, LogOut, ArrowUp, Truck, ChevronRight, RefreshCw } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { api } from '../../src/services/api';
import { AuthContext } from '../../src/context/AuthContext';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDIENTE_LIDER: { label: 'Borrador', color: colors.text.secondary },
  PENDIENTE_JEFE: { label: 'Esperando Jefe', color: colors.status.warning },
  APROBADO: { label: 'Aprobado', color: colors.status.success },
  RECHAZADO: { label: 'Rechazado', color: colors.status.danger },
};

const TYPE_LABELS: Record<string, string> = {
  HOT_WORK: 'Hot Work',
  ALTURA: 'Trabajo en Altura',
  PUENTE_GRUA: 'Puente Grúa',
  INSPECCION: 'Inspección',
};

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return 'Hace un momento';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHrs < 24) return `Hace ${diffHrs} h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
}

export default function LiderDashboard() {
  const documentTypes = [
    {
      id: 'hotwork',
      title: 'HOT WORK',
      subtitle: 'Trabajos en caliente',
      icon: <Flame color={colors.status.danger} size={28} />,
      route: '/lider/permiso/step1?tipo=HOT_WORK',
      color: colors.status.danger,
    },
    {
      id: 'altura',
      title: 'ALTURA',
      subtitle: 'Trabajos en altura',
      icon: <ArrowUp color={colors.status.info} size={28} />,
      route: '/lider/permiso/step1?tipo=ALTURA',
      color: colors.status.info,
    },
    {
      id: 'puentegrua',
      title: 'PUENTE GRÚA',
      subtitle: 'Operación grúa',
      icon: <Truck color={colors.status.warning} size={28} />,
      route: '/lider/permiso/step1?tipo=PUENTE_GRUA',
      color: colors.status.warning,
    },
    {
      id: 'inspeccion',
      title: 'INSPECCIÓN',
      subtitle: 'Equipos y maquinaria',
      icon: <ClipboardCheck color={colors.status.success} size={28} />,
      route: '/lider/permiso/step1?tipo=INSPECCION',
      color: colors.status.success,
    },
  ];

  const { user, logout } = useContext(AuthContext);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/documentos');
      if (response.data.success) {
        setHistory(response.data.data.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoadingHistory(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const getDocIcon = (tipo: string, color: string) => {
    const size = 18;
    if (tipo === 'HOT_WORK') return <Flame color={color} size={size} />;
    if (tipo === 'ALTURA') return <ArrowUp color={color} size={size} />;
    if (tipo === 'PUENTE_GRUA') return <Truck color={color} size={size} />;
    return <Activity color={color} size={size} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hola, {user?.nombre?.split(' ')[0] || 'Líder'}</Text>
          <Text style={styles.role}>Líder de Seguridad</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut color={colors.text.secondary} size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />}
      >
        <Text style={styles.sectionTitle}>Crear Nuevo Documento</Text>
        
        <View style={styles.grid}>
          {documentTypes.map((doc, index) => (
            <Animated.View 
              key={doc.id} 
              style={styles.cardContainer}
              entering={FadeInDown.delay(index * 80).springify()}
            >
              <Card 
                variant="glass" 
                style={styles.card}
                onPress={() => router.push(doc.route as any)}
              >
                <View style={[styles.iconContainer, { backgroundColor: doc.color + '18' }]}>
                  {doc.icon}
                </View>
                <Text style={styles.cardTitle}>{doc.title}</Text>
                <Text style={styles.cardSubtitle}>{doc.subtitle}</Text>
                <View style={[styles.cardArrow, { backgroundColor: doc.color + '18' }]}>
                  <ChevronRight color={doc.color} size={14} />
                </View>
              </Card>
            </Animated.View>
          ))}
        </View>

        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <View style={styles.historyTitleRow}>
              <History color={colors.text.secondary} size={16} />
              <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={fetchHistory}>
              <RefreshCw color={colors.primary.main} size={14} />
              <Text style={styles.refreshText}>Actualizar</Text>
            </TouchableOpacity>
          </View>

          {isLoadingHistory ? (
            <ActivityIndicator color={colors.primary.main} style={{ marginTop: 24 }} />
          ) : history.length > 0 ? (
            history.map((doc: any, index: number) => {
              const statusInfo = STATUS_LABELS[doc.estado] || { label: doc.estado, color: colors.text.secondary };
              return (
                <Animated.View key={doc.id_documento} entering={FadeInDown.delay(300 + index * 80)}>
                  <Card variant="glass" style={styles.historyCard}>
                    <View style={styles.historyItemRow}>
                      <View style={[styles.historyIcon, { backgroundColor: statusInfo.color + '15' }]}>
                        {getDocIcon(doc.tipo_documento, statusInfo.color)}
                      </View>
                      <View style={styles.historyItemContent}>
                        <Text style={styles.historyItemTitle}>{doc.numero_documento}</Text>
                        <Text style={styles.historyItemType}>{TYPE_LABELS[doc.tipo_documento] || doc.tipo_documento}</Text>
                        {doc.fecha_creacion && (
                          <Text style={styles.historyItemDate}>{formatRelativeDate(doc.fecha_creacion)}</Text>
                        )}
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: statusInfo.color + '18', borderColor: statusInfo.color + '40' }]}>
                        <Text style={[styles.statusPillText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                      </View>
                    </View>
                  </Card>
                </Animated.View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <History color={colors.text.disabled} size={40} />
              <Text style={styles.emptyText}>No hay actividad reciente</Text>
              <Text style={styles.emptySubtext}>Los documentos creados aparecerán aquí</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  role: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
    letterSpacing: 0.1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardContainer: {
    width: '47%',
  },
  card: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    color: colors.text.secondary,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 16,
  },
  cardArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historySection: {
    marginTop: 32,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
  },
  refreshText: {
    color: colors.primary.main,
    fontSize: 12,
    fontWeight: '600',
  },
  historyCard: {
    marginBottom: 10,
    padding: 14,
  },
  historyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  historyItemType: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: 2,
  },
  historyItemDate: {
    color: colors.text.disabled,
    fontSize: 11,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  emptySubtext: {
    color: colors.text.disabled,
    fontSize: 13,
    textAlign: 'center',
  },
});
