import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '../src/theme/colors';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, Hammer } from 'lucide-react-native';
import { AuthContext } from '../src/context/AuthContext';
import { api } from '../src/services/api';

const DEMO_ROLES = [
  {
    role: 'operario' as const,
    label: 'Operario',
    desc: 'Crea permisos y documentos HSE',
    color: colors.primary.main,
    gradient: colors.primary.gradient,
    route: '/lider' as const,
    token: 'mock_token_operario',
    user: { id: 1, email: 'operario@forjasafe.cl', rol: 'lider' as const, nombre: 'Carlos Muñoz' },
  },
  {
    role: 'jefe' as const,
    label: 'Jefe Maestranza',
    desc: 'Verifica y autoriza actividades',
    color: colors.secondary.main,
    gradient: colors.secondary.gradient,
    route: '/jefe' as const,
    token: 'mock_token_jefe',
    user: { id: 2, email: 'jefe@forjasafe.cl', rol: 'jefe' as const, nombre: 'Roberto Vega' },
  },
  {
    role: 'gerente' as const,
    label: 'Gerencia',
    desc: 'Dashboard de indicadores HSE',
    color: colors.status.success,
    gradient: colors.gradients.success,
    route: '/gerente' as const,
    token: 'mock_token_gerente',
    user: { id: 3, email: 'gerente@forjasafe.cl', rol: 'gerente' as const, nombre: 'Alejandro Ríos' },
  },
];

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Ingresa tu usuario y contraseña para continuar.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await api.post('/auth/login', { email: email.trim(), password: password.trim() });
      if (response.data.success) {
        await login(response.data.token, response.data.usuario);
        const rol = response.data.usuario.rol;
        if (rol === 'jefe') router.replace('/jefe');
        else if (rol === 'gerente') router.replace('/gerente');
        else router.replace('/lider');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demo: typeof DEMO_ROLES[0]) => {
    setLoadingRole(demo.role);
    setErrorMsg('');
    try {
      await login(demo.token, demo.user as any);
      router.replace(demo.route as any);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={['#050608', '#0C0E18', '#050608']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={styles.logoBlock}>
          <View style={styles.logoCircle}>
            <LinearGradient
              colors={colors.primary.gradient}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Hammer color="#FFF" size={36} strokeWidth={2.5} />
          </View>
          <Text style={styles.brand}>ForjaSafe</Text>
          <Text style={styles.brandSub}>HSE Digital para Maestranzas</Text>
          <View style={styles.certBadge}>
            <ShieldCheck size={12} color={colors.status.success} />
            <Text style={styles.certText}>Plataforma Certificada ISO 45001</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Iniciar Sesión</Text>

          <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocus]}>
            <User color={focusedField === 'email' ? colors.primary.main : colors.text.disabled} size={18} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={colors.text.disabled}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputWrapperFocus]}>
            <Lock color={focusedField === 'password' ? colors.primary.main : colors.text.disabled} size={18} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Contraseña"
              placeholderTextColor={colors.text.disabled}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={12}>
              {showPassword
                ? <EyeOff color={colors.text.disabled} size={18} />
                : <Eye color={colors.text.disabled} size={18} />
              }
            </TouchableOpacity>
          </View>

          {!!errorMsg && (
            <View style={styles.errorRow}>
              <AlertCircle color={colors.status.danger} size={15} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isLoading ? ['#2D3344', '#1E2330'] : colors.primary.gradient}
              style={styles.loginBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.loginBtnText}>{isLoading ? 'Ingresando...' : 'Ingresar'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerBadge}>
            <Text style={styles.dividerText}>ACCESO RÁPIDO DEMO</Text>
          </View>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.demoGrid}>
          {DEMO_ROLES.map(demo => (
            <Pressable
              key={demo.role}
              style={({ pressed }) => [styles.demoCard, pressed && styles.demoCardPressed]}
              onPress={() => handleDemoLogin(demo)}
              disabled={loadingRole !== null}
            >
              <LinearGradient
                colors={[demo.color + '22', demo.color + '08']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={[styles.demoCardBorder, { borderColor: demo.color + '55' }]} />
              <View style={[styles.demoIconDot, { backgroundColor: demo.color + '30' }]}>
                <View style={[styles.demoIconDotInner, { backgroundColor: demo.color }]} />
              </View>
              <Text style={[styles.demoLabel, { color: demo.color }]}>{demo.label}</Text>
              <Text style={styles.demoDesc} numberOfLines={2}>{demo.desc}</Text>
              {loadingRole === demo.role && (
                <View style={styles.demoLoading}>
                  <Text style={[styles.demoLoadingText, { color: demo.color }]}>•••</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <Text style={styles.footer}>ForjaSafe v2.0 · Datos demo — no reales</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    left: '10%',
    width: '80%',
    height: 260,
    backgroundColor: colors.primary.main,
    opacity: 0.07,
    borderRadius: 999,
    transform: [{ scaleX: 2.5 }],
  },
  glowBottom: {
    position: 'absolute',
    bottom: -80,
    right: '5%',
    width: '60%',
    height: 180,
    backgroundColor: colors.secondary.main,
    opacity: 0.05,
    borderRadius: 999,
    transform: [{ scaleX: 2 }],
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    ...shadows.glow(colors.primary.main),
  },
  brand: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    backgroundColor: colors.status.success + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.status.success + '30',
  },
  certText: {
    fontSize: 11,
    color: colors.status.success,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.xl,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.soft,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 12,
  },
  inputWrapperFocus: {
    borderColor: colors.primary.main + '80',
    backgroundColor: colors.primary.main + '08',
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 15,
    padding: 0,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    backgroundColor: colors.status.danger + '15',
    padding: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.status.danger + '30',
  },
  errorText: {
    color: colors.status.danger,
    fontSize: 13,
    flex: 1,
  },
  loginBtn: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginTop: 4,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnGrad: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerBadge: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  dividerText: {
    fontSize: 10,
    color: colors.text.disabled,
    fontWeight: '700',
    letterSpacing: 1,
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  demoCard: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: colors.background.paper,
    borderRadius: radius.lg,
    padding: 14,
    overflow: 'hidden',
    alignItems: 'flex-start',
    position: 'relative',
    minHeight: 100,
  },
  demoCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  demoCardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  demoIconDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoIconDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  demoLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  demoDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 15,
  },
  demoLoading: {
    position: 'absolute',
    top: 8,
    right: 10,
  },
  demoLoadingText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.text.disabled,
    letterSpacing: 0.3,
  },
});
