import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '../src/theme/colors';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ChevronDown, User, Check, X } from 'lucide-react-native';
import { AuthContext } from '../src/context/AuthContext';
import { api } from '../src/services/api';

interface UsuarioLista {
  id_usuario: number;
  nombre: string;
  rol: string;
  certificaciones_json?: { cargo?: string } | null;
}

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UsuarioLista | null>(null);
  const [selectorModal, setSelectorModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await api.get('/auth/usuarios');
        if (res.data.success) setUsuarios(res.data.data);
      } catch {}
      finally { setLoadingUsuarios(false); }
    };
    fetchUsuarios();
  }, []);

  const handleLogin = async () => {
    if (!selectedUser) {
      setErrorMsg('Selecciona tu nombre de la lista.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Ingresa tu contraseña para continuar.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await api.post('/auth/login', {
        id_usuario: selectedUser.id_usuario,
        password: password.trim(),
      });
      if (response.data.success) {
        await login(response.data.token, response.data.usuario);
        const rol = response.data.usuario.rol;
        const dest = rol === 'jefe' ? '/jefe' : rol === 'gerente' ? '/gerente' : '/lider';
        if (typeof window !== 'undefined') {
          window.location.href = dest;
        } else {
          const { router } = require('expo-router');
          router.replace(dest);
        }
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Contraseña incorrecta. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const gerentes = usuarios.filter(u => u.rol === 'gerente');
  const jefes = usuarios.filter(u => u.rol === 'jefe');

  const rolLabel = (rol: string) => rol === 'gerente' ? 'Gerencia' : 'Jefe de Maestranza';

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={['#040205', '#0C070A', '#08050A']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowMid} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />

      <View style={styles.steelLines} pointerEvents="none">
        {[...Array(6)].map((_, i) => (
          <View key={i} style={[styles.steelLine, { top: 60 + i * 110, opacity: 0.025 + i * 0.005 }]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={styles.logoBlock}>
          <View style={styles.logoAccentLine} />
          <View style={styles.logoImageWrapper}>
            <Image
              source={require('../assets/images/boilercomp-logo.jpg')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.logoAccentLine} />
          <Text style={styles.brandSub}>PLATAFORMA HSE · MAESTRANZA INDUSTRIAL</Text>
          <View style={styles.certBadge}>
            <ShieldCheck size={11} color={colors.status.success} />
            <Text style={styles.certText}>Sistema Certificado ISO 45001</Text>
          </View>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>ACCESO AUTORIZADO</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardAccent} />

          <Text style={styles.fieldLabel}>¿Quién eres?</Text>

          <TouchableOpacity
            style={[styles.selectorBtn, selectedUser && styles.selectorBtnSelected]}
            onPress={() => setSelectorModal(true)}
            activeOpacity={0.8}
          >
            {loadingUsuarios ? (
              <ActivityIndicator size="small" color={colors.text.disabled} />
            ) : (
              <User color={selectedUser ? colors.primary.main : colors.text.disabled} size={17} />
            )}
            <View style={{ flex: 1 }}>
              {selectedUser ? (
                <>
                  <Text style={styles.selectorName}>{selectedUser.nombre}</Text>
                  <Text style={styles.selectorRole}>{rolLabel(selectedUser.rol)}</Text>
                </>
              ) : (
                <Text style={styles.selectorPlaceholder}>Selecciona tu nombre...</Text>
              )}
            </View>
            {selectedUser ? (
              <TouchableOpacity onPress={() => setSelectedUser(null)} hitSlop={10}>
                <X color={colors.text.disabled} size={16} />
              </TouchableOpacity>
            ) : (
              <ChevronDown color={colors.text.disabled} size={17} />
            )}
          </TouchableOpacity>

          <Text style={[styles.fieldLabel, { marginTop: 8 }]}>Contraseña</Text>

          <View style={[styles.inputWrapper, !selectedUser && styles.inputDisabled]}>
            <Lock color={selectedUser ? colors.primary.main : colors.text.disabled} size={17} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor={colors.text.disabled}
              value={password}
              onChangeText={v => { setPassword(v); setErrorMsg(''); }}
              secureTextEntry={!showPassword}
              editable={!!selectedUser}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={14} disabled={!selectedUser}>
              {showPassword
                ? <EyeOff color={colors.text.disabled} size={17} />
                : <Eye color={colors.text.disabled} size={17} />
              }
            </TouchableOpacity>
          </View>

          {!!errorMsg && (
            <View style={styles.errorRow}>
              <AlertCircle color={colors.status.danger} size={14} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginBtn, (!selectedUser || isLoading) && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={!selectedUser || isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={(!selectedUser || isLoading) ? ['#2A1519', '#1A0C10'] : colors.primary.gradient}
              style={styles.loginBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading
                ? <ActivityIndicator color="#FFF" size="small" />
                : <Text style={[styles.loginBtnText, (!selectedUser || isLoading) && { color: colors.text.disabled }]}>
                    Ingresar al Sistema
                  </Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footerBlock}>
          <View style={styles.footerDivider} />
          <Text style={styles.footer}>Desarrollado por  Pulso AI  ·  v2.0</Text>
          <Text style={styles.footerSub}>Boilercomp HSE Digital · Todos los derechos reservados</Text>
        </View>

      </ScrollView>

      <Modal visible={selectorModal} transparent animationType="slide" onRequestClose={() => setSelectorModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Selecciona tu nombre</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectorModal(false)}>
              <X color={colors.text.secondary} size={20} />
            </TouchableOpacity>

            <FlatList
              data={[
                ...(gerentes.length ? [{ type: 'header', label: 'GERENCIA' } as any] : []),
                ...gerentes,
                ...(jefes.length ? [{ type: 'header', label: 'JEFES DE MAESTRANZA' } as any] : []),
                ...jefes,
              ]}
              keyExtractor={(item, i) => item.type === 'header' ? `h-${i}` : String(item.id_usuario)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                if (item.type === 'header') {
                  return <Text style={styles.listSectionHeader}>{item.label}</Text>;
                }
                const isSelected = selectedUser?.id_usuario === item.id_usuario;
                return (
                  <TouchableOpacity
                    style={[styles.userItem, isSelected && styles.userItemSelected]}
                    onPress={() => { setSelectedUser(item); setSelectorModal(false); setErrorMsg(''); }}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.userAvatar, isSelected && styles.userAvatarSelected]}>
                      <Text style={[styles.userAvatarText, isSelected && { color: '#FFF' }]}>
                        {item.nombre.split(' ')[0][0]}{item.nombre.split(' ')[1]?.[0] || ''}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.userName, isSelected && styles.userNameSelected]}>
                        {item.nombre}
                      </Text>
                      <Text style={styles.userCargo}>
                        {item.certificaciones_json?.cargo || rolLabel(item.rol)}
                      </Text>
                    </View>
                    {isSelected && <Check color={colors.primary.main} size={18} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.main },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60, paddingBottom: 40 },
  glowTop: {
    position: 'absolute', top: -120, left: '5%', width: '90%', height: 300,
    backgroundColor: colors.primary.main, opacity: 0.08, borderRadius: 999, transform: [{ scaleX: 2 }],
  },
  glowMid: {
    position: 'absolute', top: '40%', right: -60, width: 200, height: 200,
    backgroundColor: colors.primary.dark, opacity: 0.06, borderRadius: 999,
  },
  glowBottom: {
    position: 'absolute', bottom: -60, left: -40, width: 220, height: 220,
    backgroundColor: colors.secondary.main, opacity: 0.04, borderRadius: 999,
  },
  steelLines: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  steelLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.primary.main },
  logoBlock: { alignItems: 'center', marginBottom: 28, gap: 10 },
  logoAccentLine: { width: '85%', height: 2, backgroundColor: colors.primary.main, borderRadius: 2, opacity: 0.7 },
  logoImageWrapper: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 14, marginVertical: 6,
    ...shadows.glow(colors.primary.main),
    borderWidth: 1, borderColor: colors.primary.main + '40',
  },
  logoImage: { width: 240, height: 68 },
  brandSub: { fontSize: 10, color: colors.text.secondary, letterSpacing: 2.5, fontWeight: '700', marginTop: 4 },
  certBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.status.success + '14', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.status.success + '28',
  },
  certText: { fontSize: 10, color: colors.status.success, fontWeight: '700', letterSpacing: 0.3 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  divider: { flex: 1, height: 1, backgroundColor: colors.border.light },
  dividerText: { fontSize: 9, color: colors.text.disabled, fontWeight: '800', letterSpacing: 2 },
  card: {
    backgroundColor: colors.background.paper, borderRadius: radius.xl,
    padding: 22, marginBottom: 28, borderWidth: 1, borderColor: colors.border.light,
    overflow: 'hidden', ...shadows.soft,
  },
  cardAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: colors.primary.main },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: colors.text.disabled, letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  selectorBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.background.elevated, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border.light,
    paddingHorizontal: 14, paddingVertical: 14, marginBottom: 4,
    minHeight: 58,
  },
  selectorBtnSelected: { borderColor: colors.primary.main + '70', backgroundColor: colors.primary.main + '0A' },
  selectorPlaceholder: { fontSize: 14, color: colors.text.disabled },
  selectorName: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  selectorRole: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.background.elevated, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border.light,
    paddingHorizontal: 14, paddingVertical: 14, marginBottom: 4,
  },
  inputDisabled: { opacity: 0.45 },
  input: { flex: 1, color: colors.text.primary, fontSize: 15, padding: 0 },
  errorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10,
    backgroundColor: colors.status.danger + '12', padding: 10,
    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.status.danger + '28',
  },
  errorText: { color: colors.status.danger, fontSize: 13, flex: 1, lineHeight: 18 },
  loginBtn: { borderRadius: radius.md, overflow: 'hidden', marginTop: 14 },
  loginBtnDisabled: { opacity: 0.55 },
  loginBtnGrad: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  footerBlock: { alignItems: 'center', gap: 6 },
  footerDivider: { width: 40, height: 1, backgroundColor: colors.border.light, marginBottom: 4 },
  footer: { textAlign: 'center', fontSize: 11, color: colors.text.disabled, fontWeight: '600', letterSpacing: 0.4 },
  footerSub: { textAlign: 'center', fontSize: 10, color: colors.text.disabled, opacity: 0.6, letterSpacing: 0.2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.background.paper, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: 20, paddingBottom: 44, maxHeight: '80%',
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border.medium, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: colors.text.primary, marginBottom: 16 },
  modalCloseBtn: {
    position: 'absolute', top: 18, right: 20,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center', alignItems: 'center',
  },
  listSectionHeader: {
    fontSize: 10, fontWeight: '800', color: colors.primary.main,
    letterSpacing: 1.5, paddingVertical: 10, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: colors.primary.main + '30',
    marginBottom: 4,
  },
  userItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 6,
    borderRadius: radius.md,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  userItemSelected: { backgroundColor: colors.primary.main + '0E', borderBottomColor: colors.primary.main + '20' },
  userAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.background.elevated,
    borderWidth: 1, borderColor: colors.border.medium,
    justifyContent: 'center', alignItems: 'center',
  },
  userAvatarSelected: { backgroundColor: colors.primary.main, borderColor: colors.primary.main },
  userAvatarText: { fontSize: 13, fontWeight: '800', color: colors.text.secondary },
  userName: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  userNameSelected: { color: colors.primary.main },
  userCargo: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
});
