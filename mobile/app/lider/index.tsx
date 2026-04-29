import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/theme/colors';
import { Flame, Activity, ClipboardCheck, History, LogOut, ArrowUp, Truck } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { api } from '../../src/services/api';
import { AuthContext } from '../../src/context/AuthContext';

export default function LiderDashboard() {
  const statusColorMap: Record<string, string> = {
    PENDIENTE_LIDER: colors.status.warning,
    PENDIENTE_JEFE: colors.primary.main,
    APROBADO: colors.status.success,
    RECHAZADO: colors.status.danger,
  };

  const documentTypes = [
    {
      id: 'hotwork',
      title: 'HOT WORK',
      subtitle: 'Trabajos en caliente',
      icon: <Flame color={colors.status.danger} size={32} />,
      route: '/lider/permiso/step1?tipo=HOT_WORK',
      color: colors.status.danger,
    },
    {
      id: 'altura',
      title: 'ALTURA',
      subtitle: 'Trabajos en altura',
      icon: <ArrowUp color={colors.status.info} size={32} />,
      route: '/lider/permiso/step1?tipo=ALTURA',
      color: colors.status.info,
    },
    {
      id: 'puentegrua',
      title: 'PUENTE GRÚA',
      subtitle: 'Operación puente grúa',
      icon: <Truck color={colors.status.warning} size={32} />,
      route: '/lider/permiso/step1?tipo=PUENTE_GRUA',
      color: colors.status.warning,
    },
    {
      id: 'inspeccion',
      title: 'Inspección',
      subtitle: 'Equipos y maquinaria',
      icon: <ClipboardCheck color={colors.status.success} size={32} />,
      route: '/lider/permiso/step1?tipo=INSPECCION',
      color: colors.status.success,
    },
  ];

  const { user, logout } = useContext(AuthContext);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/documentos');
      if (response.data.success) {
        setHistory(response.data.data.slice(0, 5)); // Mostrar solo los últimos 5
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoadingHistory(false);
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
          <Text style={styles.greeting}>Hola, {user?.nombre || 'Líder'}</Text>
          <Text style={styles.role}>Líder - {user?.email || 'Sector Soldadura'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut color={colors.text.secondary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Crear Nuevo Documento</Text>
        
        <View style={styles.grid}>
          {documentTypes.map((doc, index) => (
            <Animated.View 
              key={doc.id} 
              style={styles.cardContainer}
              entering={FadeInDown.delay(index * 100).springify()}
            >
              <Card 
                variant="glass" 
                style={styles.card}
                onPress={() => router.push(doc.route as any)}
              >
                <View style={[styles.iconContainer, { backgroundColor: doc.color + '20' }]}>
                  {doc.icon}
                </View>
                <Text style={styles.cardTitle}>{doc.title}</Text>
                <Text style={styles.cardSubtitle}>{doc.subtitle}</Text>
              </Card>
            </Animated.View>
          ))}
        </View>

        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            <TouchableOpacity style={styles.viewAllBtn} onPress={fetchHistory}>
              <History color={colors.primary.main} size={16} />
              <Text style={styles.viewAllText}>Actualizar</Text>
            </TouchableOpacity>
          </View>

          {isLoadingHistory ? (
            <ActivityIndicator color={colors.primary.main} style={{ marginTop: 20 }} />
          ) : history.length > 0 ? (
            history.map((doc: any, index: number) => (
              <Animated.View key={doc.id_documento} entering={FadeInDown.delay(300 + index * 100)}>
                <Card variant="glass" style={styles.historyCard}>
                  <View style={styles.historyItemRow}>
                    <View style={styles.historyIcon}>
                      {doc.tipo_documento === 'HOT_WORK' ? (
                        <Flame color={colors.status.danger} size={20} />
                      ) : doc.tipo_documento === 'ALTURA' ? (
                        <ArrowUp color={colors.status.info} size={20} />
                      ) : doc.tipo_documento === 'PUENTE_GRUA' ? (
                        <Truck color={colors.status.warning} size={20} />
                      ) : (
                        <Activity color={colors.status.warning} size={20} />
                      )}
                    </View>
                    <View style={styles.historyItemContent}>
                      <Text style={styles.historyItemTitle}>{doc.numero_documento}</Text>
                      <Text style={styles.historyItemSubtitle}>Estado: {doc.estado}</Text>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: statusColorMap[doc.estado] || colors.status.warning }]} />
                  </View>
                </Card>
              </Animated.View>
            ))
          ) : (
            <Text style={{ color: colors.text.secondary, textAlign: 'center', marginTop: 20 }}>No hay actividad reciente.</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '47%',
  },
  card: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: colors.text.secondary,
    fontSize: 12,
    textAlign: 'center',
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
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewAllText: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: '600',
  },
  historyCard: {
    marginBottom: 12,
    padding: 16,
  },
  historyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyItemSubtitle: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
