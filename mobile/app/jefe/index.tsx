import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Card } from '../../src/components/Card';
import { StatusBadge } from '../../src/components/StatusBadge';
import { colors, radius } from '../../src/theme/colors';
import { LogOut, Flame, Clock, Activity, ArrowUp, Truck, CheckSquare, AlertTriangle, ClipboardCheck } from 'lucide-react-native';
import { api } from '../../src/services/api';
import { AuthContext } from '../../src/context/AuthContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

const TYPE_LABELS: Record<string, string> = {
  HOT_WORK: 'Hot Work',
  ALTURA: 'Trabajo en Altura',
  PUENTE_GRUA: 'Puente Grúa',
  INSPECCION: 'Inspección',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);

  if (diffMin < 1) return 'Hace un momento';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHrs < 24) return `Hace ${diffHrs} h`;
  return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function JefeDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [approvedToday, setApprovedToday] = useState(0);
  const [rejectedToday, setRejectedToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const response = await api.get('/documentos');
      if (response.data.success) {
        const pendientes = response.data.data.filter((doc: any) => doc.estado === 'PENDIENTE_JEFE');
        const aprobadosHoy = response.data.data.filter((doc: any) => {
          if (doc.estado !== 'APROBADO' || !doc.fecha_aprobacion) return false;
          return new Date(doc.fecha_aprobacion).toDateString() === new Date().toDateString();
        });
        const rechazadosHoy = response.data.data.filter((doc: any) => {
          if (doc.estado !== 'RECHAZADO' || !doc.fecha_actualizacion) return false;
          return new Date(doc.fecha_actualizacion).toDateString() === new Date().toDateString();
        });
        setPendingApprovals(pendientes);
        setApprovedToday(aprobadosHoy.length);
        setRejectedToday(rechazadosHoy.length);
      }
    } catch (error) {
      console.error('Error fetching pending:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPending();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const getDocIcon = (tipo: string, size = 22) => {
    if (tipo === 'HOT_WORK') return <Flame color={colors.status.danger} size={size} />;
    if (tipo === 'ALTURA') return <ArrowUp color={colors.status.info} size={size} />;
    if (tipo === 'PUENTE_GRUA') return <Truck color={colors.status.warning} size={size} />;
    if (tipo === 'INSPECCION') return <ClipboardCheck color={colors.status.success} size={size} />;
    return <Activity color={colors.status.warning} size={size} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hola, {user?.nombre?.split(' ')[0] || 'Jefe'}</Text>
          <Text style={styles.role}>Jefe General en Turno</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut color={colors.text.secondary} size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />}
      >
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderColor: colors.status.warning + '80' }]}>
            <View style={[styles.statIconBg, { backgroundColor: colors.status.warning + '15' }]}>
              <AlertTriangle color={colors.status.warning} size={20} />
            </View>
            <Text style={styles.statNumber}>{isLoading ? '—' : pendingApprovals.length}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={[styles.statBox, { borderColor: colors.status.success + '80' }]}>
            <View style={[styles.statIconBg, { backgroundColor: colors.status.success + '15' }]}>
              <CheckSquare color={colors.status.success} size={20} />
            </View>
            <Text style={styles.statNumber}>{isLoading ? '—' : approvedToday}</Text>
            <Text style={styles.statLabel}>Aprobados Hoy</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Requieren Aprobación</Text>
          {pendingApprovals.length > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingApprovals.length}</Text>
            </View>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary.main} style={{ marginTop: 40 }} />
        ) : pendingApprovals.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckSquare color={colors.status.success} size={48} />
            <Text style={styles.emptyTitle}>Todo al día</Text>
            <Text style={styles.emptySubtext}>No hay documentos pendientes de aprobación</Text>
          </View>
        ) : (
          pendingApprovals.map((doc, index) => (
            <Animated.View key={doc.id_documento} entering={FadeInDown.delay(index * 80)}>
              <Card 
                variant="glass" 
                style={[
                  styles.approvalCard,
                  doc.tipo_documento === 'HOT_WORK' && { borderColor: colors.status.danger + '40' }
                ]}
                onPress={() => router.push(`/jefe/approve/${doc.id_documento}`)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <View style={[styles.docIconBg, {
                      backgroundColor: doc.tipo_documento === 'HOT_WORK' ? colors.status.danger + '15' :
                        doc.tipo_documento === 'ALTURA' ? colors.status.info + '15' :
                        doc.tipo_documento === 'PUENTE_GRUA' ? colors.status.warning + '15' :
                        colors.status.success + '15'
                    }]}>
                      {getDocIcon(doc.tipo_documento)}
                    </View>
                    <View>
                      <Text style={styles.docId}>{doc.numero_documento}</Text>
                      <Text style={styles.docType}>{TYPE_LABELS[doc.tipo_documento] || doc.tipo_documento}</Text>
                    </View>
                  </View>
                  {doc.tipo_documento === 'HOT_WORK' && (
                    <View style={styles.urgentBadge}>
                      <Flame color={colors.status.danger} size={10} />
                      <Text style={styles.urgentText}>URGENTE</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Solicitado por</Text>
                    <Text style={styles.infoValue}>{doc.creador?.nombre || 'Líder'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Sector</Text>
                    <Text style={styles.infoValue}>{doc.sector || '—'}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <StatusBadge status="pendiente" label="ESPERANDO FIRMA" />
                  <View style={styles.timeRow}>
                    <Clock color={colors.text.disabled} size={12} />
                    <Text style={styles.timeText}>
                      {doc.fecha_creacion ? formatDate(doc.fecha_creacion) : 'sin fecha'}
                    </Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          ))
        )}
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
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.lg,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderTopWidth: 2,
    gap: 8,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 0.1,
  },
  pendingBadge: {
    backgroundColor: colors.status.warning + '25',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.status.warning + '50',
  },
  pendingBadgeText: {
    color: colors.status.warning,
    fontSize: 12,
    fontWeight: '700',
  },
  approvalCard: {
    marginBottom: 14,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  docIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docId: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  docType: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.danger + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.status.danger + '30',
  },
  urgentText: {
    color: colors.status.danger,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 14,
    gap: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    color: colors.text.disabled,
    fontSize: 11,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: colors.text.disabled,
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtext: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
});
