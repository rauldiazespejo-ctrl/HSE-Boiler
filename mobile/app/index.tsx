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
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '../src/theme/colors';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { AuthContext } from '../src/context/AuthContext';
import { api } from '../src/services/api';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
        const dest = rol === 'jefe' ? '/jefe' : rol === 'gerente' ? '/gerente' : '/lider';
        if (typeof window !== 'undefined') {
          window.location.href = dest;
        } else {
          router.replace(dest as any);
        }
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

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

          <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocus]}>
            <Mail color={focusedField === 'email' ? colors.primary.main : colors.text.disabled} size={17} />
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
            <Lock color={focusedField === 'password' ? colors.primary.main : colors.text.disabled} size={17} />
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
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={14}>
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
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isLoading ? ['#2A1519', '#1A0C10'] : colors.primary.gradient}
              style={styles.loginBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.loginBtnText, isLoading && { color: colors.text.disabled }]}>
                {isLoading ? 'Verificando acceso...' : 'Ingresar al Sistema'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footerBlock}>
          <View style={styles.footerDivider} />
          <Text style={styles.footer}>Desarrollado por  Pulso AI  ·  v2.0</Text>
          <Text style={styles.footerSub}>Boilercomp HSE Digital · Todos los derechos reservados</Text>
        </View>

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
    paddingTop: 60,
    paddingBottom: 40,
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    left: '5%',
    width: '90%',
    height: 300,
    backgroundColor: colors.primary.main,
    opacity: 0.08,
    borderRadius: 999,
    transform: [{ scaleX: 2 }],
  },
  glowMid: {
    position: 'absolute',
    top: '40%',
    right: -60,
    width: 200,
    height: 200,
    backgroundColor: colors.primary.dark,
    opacity: 0.06,
    borderRadius: 999,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 220,
    height: 220,
    backgroundColor: colors.secondary.main,
    opacity: 0.04,
    borderRadius: 999,
  },
  steelLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  steelLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.primary.main,
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 10,
  },
  logoAccentLine: {
    width: '85%',
    height: 2,
    backgroundColor: colors.primary.main,
    borderRadius: 2,
    opacity: 0.7,
  },
  logoImageWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginVertical: 6,
    ...shadows.glow(colors.primary.main),
    borderWidth: 1,
    borderColor: colors.primary.main + '40',
  },
  logoImage: {
    width: 240,
    height: 68,
  },
  brandSub: {
    fontSize: 10,
    color: colors.text.secondary,
    letterSpacing: 2.5,
    fontWeight: '700',
    marginTop: 4,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.status.success + '14',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.status.success + '28',
  },
  certText: {
    fontSize: 10,
    color: colors.status.success,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    fontSize: 9,
    color: colors.text.disabled,
    fontWeight: '800',
    letterSpacing: 2,
  },
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: radius.xl,
    padding: 22,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
    ...shadows.soft,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary.main,
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
    paddingVertical: 14,
    marginBottom: 12,
    marginTop: 8,
  },
  inputWrapperFocus: {
    borderColor: colors.primary.main + '80',
    backgroundColor: colors.primary.main + '0A',
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
    backgroundColor: colors.status.danger + '12',
    padding: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.status.danger + '28',
  },
  errorText: {
    color: colors.status.danger,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  loginBtn: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginTop: 6,
  },
  loginBtnDisabled: {
    opacity: 0.65,
  },
  loginBtnGrad: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerBlock: {
    alignItems: 'center',
    gap: 6,
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: colors.border.light,
    marginBottom: 4,
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.text.disabled,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  footerSub: {
    textAlign: 'center',
    fontSize: 10,
    color: colors.text.disabled,
    opacity: 0.6,
    letterSpacing: 0.2,
  },
});
