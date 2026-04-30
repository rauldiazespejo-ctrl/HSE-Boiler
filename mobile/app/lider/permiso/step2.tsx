import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '../../../src/theme/colors';
import { ArrowLeft, ArrowRight, Check, AlertTriangle } from 'lucide-react-native';
import { PermisoContext, TIPO_LABELS } from '../../../src/context/PermisoContext';

interface Riesgo {
  id: string;
  label: string;
  severity: 'ALTA' | 'MEDIA' | 'BAJA';
}

const RIESGOS: Record<string, Riesgo[]> = {
  TRABAJO_CALIENTE: [
    { id: 'tc1', label: 'Quemaduras por arco eléctrico, llama o metal fundido', severity: 'ALTA' },
    { id: 'tc2', label: 'Incendio por proyección de chispas o escoria', severity: 'ALTA' },
    { id: 'tc3', label: 'Inhalación de humos y gases metálicos', severity: 'ALTA' },
    { id: 'tc4', label: 'Radiación UV e IR — daño ocular y cutáneo', severity: 'ALTA' },
    { id: 'tc5', label: 'Choque eléctrico por contacto directo', severity: 'ALTA' },
    { id: 'tc6', label: 'Proyección de partículas a ojos o cara', severity: 'MEDIA' },
    { id: 'tc7', label: 'Explosión por gases combustibles acumulados', severity: 'ALTA' },
    { id: 'tc8', label: 'Incendio en materiales cercanos por radiación', severity: 'MEDIA' },
  ],
  IZAJE_GRUA: [
    { id: 'ig1', label: 'Caída de carga suspendida sobre personas', severity: 'ALTA' },
    { id: 'ig2', label: 'Atrapamiento de miembros entre carga y estructura', severity: 'ALTA' },
    { id: 'ig3', label: 'Golpe por carga en movimiento pendular', severity: 'ALTA' },
    { id: 'ig4', label: 'Rotura de eslinga o accesorio de izaje', severity: 'ALTA' },
    { id: 'ig5', label: 'Sobrecarga y volcamiento del equipo', severity: 'ALTA' },
    { id: 'ig6', label: 'Contacto eléctrico con líneas aéreas', severity: 'ALTA' },
    { id: 'ig7', label: 'Lesiones por arrastre de señalero', severity: 'MEDIA' },
  ],
  MECANIZADO_CNC: [
    { id: 'mc1', label: 'Proyección de viruta caliente a ojos o piel', severity: 'ALTA' },
    { id: 'mc2', label: 'Atrapamiento de mano en zona de corte activa', severity: 'ALTA' },
    { id: 'mc3', label: 'Rotura de herramienta de corte y proyección', severity: 'ALTA' },
    { id: 'mc4', label: 'Contacto con taladrina (dermatitis, irritación ocular)', severity: 'MEDIA' },
    { id: 'mc5', label: 'Ruido excesivo — hipoacusia', severity: 'MEDIA' },
    { id: 'mc6', label: 'Falla de programa CNC — movimiento inesperado', severity: 'ALTA' },
    { id: 'mc7', label: 'Inhalación de neblinas de aceite de corte', severity: 'BAJA' },
  ],
  TORNERIA: [
    { id: 'to1', label: 'Atrapamiento de ropa o cabello en el torno en rotación', severity: 'ALTA' },
    { id: 'to2', label: 'Proyección de viruta larga en forma de espiral', severity: 'ALTA' },
    { id: 'to3', label: 'Rotura de herramienta de corte', severity: 'ALTA' },
    { id: 'to4', label: 'Proyección de pieza por fijación inadecuada', severity: 'ALTA' },
    { id: 'to5', label: 'Quemadura por viruta caliente', severity: 'MEDIA' },
    { id: 'to6', label: 'Ruido — hipoacusia por exposición prolongada', severity: 'MEDIA' },
    { id: 'to7', label: 'Corte al retirar viruta con la mano', severity: 'ALTA' },
  ],
  ESMERILADO: [
    { id: 'es1', label: 'Rotura de disco y proyección de fragmentos', severity: 'ALTA' },
    { id: 'es2', label: 'Proyección de chispas e incendio', severity: 'ALTA' },
    { id: 'es3', label: 'Lesión ocular por partículas desprendidas', severity: 'ALTA' },
    { id: 'es4', label: 'Vibración mano-brazo — afección vascular', severity: 'MEDIA' },
    { id: 'es5', label: 'Ruido elevado — hipoacusia', severity: 'MEDIA' },
    { id: 'es6', label: 'Contacto de disco con cuerpo del operario', severity: 'ALTA' },
    { id: 'es7', label: 'Inhalación de polvo metálico / polvo abrasivo', severity: 'MEDIA' },
  ],
  TRABAJO_ALTURA: [
    { id: 'ta1', label: 'Caída de persona a distinto nivel (fatal)', severity: 'ALTA' },
    { id: 'ta2', label: 'Caída de objetos, herramientas sobre personas bajo', severity: 'ALTA' },
    { id: 'ta3', label: 'Falla de arnés, línea de vida o punto de anclaje', severity: 'ALTA' },
    { id: 'ta4', label: 'Colapso de andamio o estructura de acceso', severity: 'ALTA' },
    { id: 'ta5', label: 'Golpe contra estructura al balancearse tras caída', severity: 'MEDIA' },
    { id: 'ta6', label: 'Contacto con líneas eléctricas aéreas', severity: 'ALTA' },
    { id: 'ta7', label: 'Fatiga / mareo a altura (trauma suspensión)', severity: 'MEDIA' },
  ],
  TRABAJO_ELECTRICO: [
    { id: 'te1', label: 'Electrocución por contacto directo con partes vivas', severity: 'ALTA' },
    { id: 'te2', label: 'Arco eléctrico — quemaduras severas', severity: 'ALTA' },
    { id: 'te3', label: 'Incendio por cortocircuito', severity: 'ALTA' },
    { id: 'te4', label: 'Reactivación inesperada de energía durante trabajo', severity: 'ALTA' },
    { id: 'te5', label: 'Quemaduras por contacto con superficie caliente', severity: 'MEDIA' },
    { id: 'te6', label: 'Caída desde altura al reaccionar ante choque', severity: 'ALTA' },
  ],
  MANTENIMIENTO: [
    { id: 'mn1', label: 'Atrapamiento por arranque inesperado del equipo', severity: 'ALTA' },
    { id: 'mn2', label: 'Caída de componentes pesados durante desmontaje', severity: 'ALTA' },
    { id: 'mn3', label: 'Exposición a fluidos hidráulicos a presión', severity: 'ALTA' },
    { id: 'mn4', label: 'Quemaduras por superficies o fluidos calientes', severity: 'MEDIA' },
    { id: 'mn5', label: 'Inhalación de lubricantes o solventes', severity: 'MEDIA' },
    { id: 'mn6', label: 'Golpes y contusiones por herramientas', severity: 'BAJA' },
    { id: 'mn7', label: 'Cortocircuito al manipular tableros eléctricos', severity: 'ALTA' },
  ],
  GRUA_HORQUILLA: [
    { id: 'gh1', label: 'Volcamiento de la grúa horquilla con o sin carga', severity: 'ALTA' },
    { id: 'gh2', label: 'Atropello de peatones en zona de tránsito', severity: 'ALTA' },
    { id: 'gh3', label: 'Caída de carga desde las horquillas', severity: 'ALTA' },
    { id: 'gh4', label: 'Golpe contra estanterías o estructuras', severity: 'MEDIA' },
    { id: 'gh5', label: 'Choque entre equipos móviles en circulación', severity: 'MEDIA' },
    { id: 'gh6', label: 'Exposición a gases de combustión (interior)', severity: 'MEDIA' },
  ],
  ESPACIO_CONFINADO: [
    { id: 'ec1', label: 'Asfixia por deficiencia de oxígeno', severity: 'ALTA' },
    { id: 'ec2', label: 'Intoxicación por gas tóxico (CO, H₂S, etc.)', severity: 'ALTA' },
    { id: 'ec3', label: 'Explosión por atmósfera inflamable (LEL)', severity: 'ALTA' },
    { id: 'ec4', label: 'Sepultamiento por derrumbe de paredes o techo', severity: 'ALTA' },
    { id: 'ec5', label: 'Caída dentro del espacio confinado', severity: 'ALTA' },
    { id: 'ec6', label: 'Trauma por rescate tardío — síndrome suspensión', severity: 'ALTA' },
    { id: 'ec7', label: 'Quemaduras por superficies calientes internas', severity: 'MEDIA' },
  ],
};

const SEVERITY_COLORS: Record<string, string> = {
  ALTA:  colors.status.danger,
  MEDIA: colors.status.warning,
  BAJA:  colors.status.info,
};

export default function PermisoStep2() {
  const { data, updateData } = useContext(PermisoContext);
  const tipo = data.tipoPermiso;
  const tipoLabel = TIPO_LABELS[tipo] || 'Permiso';
  const riesgos = RIESGOS[tipo] || [];

  const toggle = (id: string) => {
    const sel = data.riesgosSeleccionados || [];
    updateData({
      riesgosSeleccionados: sel.includes(id) ? sel.filter(r => r !== id) : [...sel, id],
    });
  };

  const isComplete = (data.riesgosSeleccionados?.length || 0) > 0;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={colors.text.primary} size={22} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.stepLabel}>PASO 2 / 4</Text>
          <Text style={styles.tipoLabel} numberOfLines={1}>{tipoLabel}</Text>
        </View>
        <View style={styles.stepBubble}>
          <Text style={styles.stepBubbleText}>2/4</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <LinearGradient
          colors={colors.primary.gradient}
          style={[styles.progressFill, { width: '50%' }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <AlertTriangle color={colors.status.warning} size={20} />
          <Text style={styles.pageTitle}>Identificación de Riesgos</Text>
        </View>
        <Text style={styles.pageSub}>Selecciona TODOS los riesgos presentes en esta actividad</Text>

        <View style={styles.selectedBanner}>
          <Text style={styles.selectedCount}>{data.riesgosSeleccionados?.length || 0}</Text>
          <Text style={styles.selectedLabel}> riesgo(s) identificado(s)</Text>
        </View>

        {riesgos.map(r => {
          const sel = data.riesgosSeleccionados?.includes(r.id);
          const sevColor = SEVERITY_COLORS[r.severity];
          return (
            <TouchableOpacity
              key={r.id}
              style={[styles.riskRow, sel && styles.riskRowSelected, sel && { borderColor: sevColor + '60' }]}
              onPress={() => toggle(r.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.checkbox, sel && { backgroundColor: sevColor, borderColor: sevColor }]}>
                {sel && <Check color="#FFF" size={13} strokeWidth={3} />}
              </View>
              <View style={styles.riskContent}>
                <Text style={[styles.riskLabel, sel && styles.riskLabelSelected]}>{r.label}</Text>
                <View style={[styles.severityBadge, { backgroundColor: sevColor + '20' }]}>
                  <View style={[styles.severityDot, { backgroundColor: sevColor }]} />
                  <Text style={[styles.severityText, { color: sevColor }]}>RIESGO {r.severity}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !isComplete && styles.nextBtnDisabled]}
          onPress={() => isComplete && router.push('/lider/permiso/step3')}
          disabled={!isComplete}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={isComplete ? colors.primary.gradient : ['#2D3344', '#1E2330']}
            style={styles.nextBtnGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.nextBtnText, !isComplete && { color: colors.text.disabled }]}>
              Checklists y Documentos
            </Text>
            <ArrowRight color={isComplete ? '#FFF' : colors.text.disabled} size={18} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.main },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1, borderBottomColor: colors.border.light, gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border.light,
  },
  headerCenter: { flex: 1 },
  stepLabel: { fontSize: 10, color: colors.text.disabled, fontWeight: '700', letterSpacing: 1 },
  tipoLabel: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  stepBubble: {
    backgroundColor: colors.primary.main + '20',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.primary.main + '40',
  },
  stepBubbleText: { fontSize: 11, fontWeight: '700', color: colors.primary.main },
  progressTrack: { height: 3, backgroundColor: colors.border.light },
  progressFill: { height: '100%', borderRadius: 2 },
  scroll: { padding: 16, paddingTop: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  pageTitle: { fontSize: 17, fontWeight: '700', color: colors.text.primary },
  pageSub: { fontSize: 13, color: colors.text.secondary, marginBottom: 16, lineHeight: 18 },
  selectedBanner: {
    flexDirection: 'row', alignItems: 'baseline',
    backgroundColor: colors.primary.main + '12',
    borderRadius: radius.md, padding: 12,
    marginBottom: 16,
    borderWidth: 1, borderColor: colors.primary.main + '30',
  },
  selectedCount: { fontSize: 24, fontWeight: '800', color: colors.primary.main },
  selectedLabel: { fontSize: 14, color: colors.text.secondary },
  riskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.background.paper,
    borderRadius: radius.md, padding: 14,
    marginBottom: 8,
    borderWidth: 1, borderColor: colors.border.light,
  },
  riskRowSelected: { backgroundColor: colors.background.elevated },
  checkbox: {
    width: 24, height: 24, borderRadius: 7,
    borderWidth: 2, borderColor: colors.border.medium,
    justifyContent: 'center', alignItems: 'center',
  },
  riskContent: { flex: 1, gap: 6 },
  riskLabel: { fontSize: 13, color: colors.text.secondary, lineHeight: 18 },
  riskLabelSelected: { color: colors.text.primary, fontWeight: '600' },
  severityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.full,
  },
  severityDot: { width: 5, height: 5, borderRadius: 3 },
  severityText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 32,
    backgroundColor: colors.background.main,
    borderTopWidth: 1, borderTopColor: colors.border.light,
  },
  nextBtn: { borderRadius: radius.md, overflow: 'hidden' },
  nextBtnDisabled: { opacity: 0.6 },
  nextBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15,
  },
  nextBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
