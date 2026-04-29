import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Card } from '../../src/components/Card';
import { StatusBadge } from '../../src/components/StatusBadge';
import { colors, radius } from '../../src/theme/colors';
import { LogOut, Flame, Clock, ShieldAlert, Activity, ArrowUp, Truck } from 'lucide-react-native';
import { api } from '../../src/services/api';
import { AuthContext } from '../../src/context/AuthContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function JefeDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const response = await api.get('/documentos');
      if (response.data.success) {
        // Filtrar pendientes y mapear para UI
        const pendientes = response.data.data.filter((doc: any) => doc.estado === 'PENDIENTE');
        setPendingApprovals(pendientes);
      }
    } catch (error) {
      console.error('Error fetching pending:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.nombre || 'Jefe'}</Text>
          <Text style={styles.role}>Jefe General en Turno</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut color={colors.text.secondary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderColor: colors.status.warning }]}>
            <Text style={styles.statNumber}>{pendingApprovals.length}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={[styles.statBox, { borderColor: colors.status.success }]}>
            <Text style={styles.statNumber}>-</Text>
            <Text style={styles.statLabel}>Aprobados Hoy</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Requieren Aprobación</Text>

        {isLoading ? (
          <ActivityIndicator color={colors.primary.main} />
        ) : pendingApprovals.length === 0 ? (
          <Text style={{ color: colors.text.secondary }}>No hay documentos pendientes.</Text>
        ) : (
          pendingApprovals.map((doc, index) => (
            <Animated.View key={doc.id_documento} entering={FadeInDown.delay(index * 100)}>
              <Card 
                variant="glass" 
                style={[styles.approvalCard, doc.tipo_documento === 'HOT WORK' && { borderColor: colors.status.danger }]}
                onPress={() => router.push(`/jefe/approve/${doc.numero_documento}`)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    {doc.tipo_documento === 'HOT WORK' ? (
                      <Flame color={colors.status.danger} size={24} />
                    ) : doc.tipo_documento === 'TRABAJO EN ALTURA' ? (
                      <ArrowUp color={colors.status.info} size={24} />
                    ) : doc.tipo_documento === 'PUENTE GRÚA' ? (
                      <Truck color={colors.status.warning} size={24} />
                    ) : (
                      <Activity color={colors.status.warning} size={24} />
                    )}
                    <Text style={styles.docId}>{doc.numero_documento}</Text>
                  </View>
                  {doc.tipo_documento === 'HOT WORK' && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>URGENTE</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardBody}>
                  <View>
                    <Text style={styles.infoLabel}>Solicitado por</Text>
                    <Text style={styles.infoValue}>{doc.creador?.nombre || 'Líder'}</Text>
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>Sector</Text>
                    <Text style={styles.infoValue}>{doc.sector}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <StatusBadge status="pendiente" label="ESPERANDO FIRMA" />
                  <View style={styles.timeRow}>
                    <Clock color={colors.text.secondary} size={14} />
                    <Text style={styles.timeText}>hace unos minutos</Text>
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
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  role: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statBox: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  approvalCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docId: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  urgentBadge: {
    backgroundColor: colors.status.danger + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  urgentText: {
    color: colors.status.danger,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 16,
  },
  infoLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
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
    color: colors.text.secondary,
    fontSize: 12,
  },
});
