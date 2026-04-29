import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { Flame, ShieldAlert, LockKeyhole, ClipboardCheck } from 'lucide-react-native';
import { api } from '../services/api';

const LiderDashboardScreen = ({ navigation }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await api.getDocumentos();
        if (response.success) {
          setDocumentos(response.data);
        }
      } catch (err) {
        console.error('Error fetching docs:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Subscribe to navigation focus to refresh
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDocs();
    });

    return unsubscribe;
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, Juan 👋</Text>
            <Text style={styles.subtitle}>Líder Sector Soldadura</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Crear Nuevo Documento</Text>
        
        <View style={styles.grid}>
          <Card 
            style={styles.card} 
            onPress={() => navigation.navigate('CrearHotWork')}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Flame color={COLORS.warning} size={32} />
            </View>
            <Text style={styles.cardTitle}>HOT WORK</Text>
            <Text style={styles.cardDesc}>Soldadura, corte, fuego</Text>
          </Card>

          <Card style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <ShieldAlert color={COLORS.primary} size={32} />
            </View>
            <Text style={styles.cardTitle}>AST SIMPLE</Text>
            <Text style={styles.cardDesc}>Trabajos riesgo medio</Text>
          </Card>

          <Card style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <LockKeyhole color={COLORS.danger} size={32} />
            </View>
            <Text style={styles.cardTitle}>LOTO</Text>
            <Text style={styles.cardDesc}>Bloqueo de máquinas</Text>
          </Card>

          <Card style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <ClipboardCheck color={COLORS.success} size={32} />
            </View>
            <Text style={styles.cardTitle}>INSPECCIÓN</Text>
            <Text style={styles.cardDesc}>Equipos y herramientas</Text>
          </Card>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>Documentos Recientes</Text>
        
        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: SPACING.lg }} />
        ) : documentos.length === 0 ? (
          <Text style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.md }}>
            No hay documentos recientes.
          </Text>
        ) : (
          documentos.map(doc => (
            <Card key={doc.id_documento} style={styles.listCard}>
              <View style={styles.listCardHeader}>
                <Text style={styles.docNumber}>{doc.numero_documento}</Text>
                <Badge title={doc.estado} status={doc.estado === 'APROBADO' ? 'success' : doc.estado === 'PENDIENTE' ? 'warning' : 'critical'} />
              </View>
              <Text style={styles.docDesc}>{doc.tipo_documento} - {doc.sector}</Text>
              <Text style={styles.docTime}>{new Date(doc.fecha_creacion).toLocaleString()}</Text>
            </Card>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  greeting: {
    ...TYPOGRAPHY.h2,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: SPACING.md,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.button,
    marginBottom: SPACING.xs,
  },
  cardDesc: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
  },
  listCard: {
    marginBottom: SPACING.sm,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  docNumber: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
  },
  docDesc: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.xs,
  },
  docTime: {
    ...TYPOGRAPHY.caption,
  }
});

export default LiderDashboardScreen;
