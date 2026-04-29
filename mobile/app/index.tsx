import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { colors, radius } from '../src/theme/colors';
import { Lock, User, AlertCircle, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react-native';
import { AuthContext } from '../src/context/AuthContext';
import { api } from '../src/services/api';

export default function LoginScreen() {
  const { login } = React.useContext(AuthContext);
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'rut' | 'password' | null>(null);

  const companyLogo = require('../assets/images/company-logo.png');

  const handleLogin = async (roleOverride?: 'lider' | 'jefe') => {
    const cleanRut = rut.trim();
    const cleanPassword = password.trim();

    if (!roleOverride && (!cleanRut || !cleanPassword)) {
      setErrorMsg('Debes ingresar usuario y contraseña para continuar.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      if (roleOverride === 'lider') {
        await login('mock_token_lider', { id: 1, email: 'lider@hse.cl', rol: 'lider', nombre: 'Líder Demo' });
        router.replace('/lider');
        return;
      } else if (roleOverride === 'jefe') {
        await login('mock_token_jefe', { id: 2, email: 'jefe@hse.cl', rol: 'jefe', nombre: 'Jefe Demo' });
        router.replace('/jefe');
        return;
      }

      const response = await api.post('/auth/login', {
        email: cleanRut,
        password: cleanPassword
      });

      if (response.data.success) {
        await login(response.data.token, response.data.usuario);
        if (response.data.usuario.rol === 'jefe') {
          router.replace('/jefe');
        } else {
          router.replace('/lider');
        }
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#09090B', '#18060d', '#09090B']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      >
        <View style={styles.accentGlow} pointerEvents="none" />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image source={companyLogo} style={styles.logoImage} resizeMode="contain" />
            </View>
            <View style={styles.badge}>
              <ShieldCheck size={13} color={colors.status.success} />
              <Text style={styles.badgeText}>Plataforma Certificada HSE</Text>
            </View>
            <Text style={styles.title}>Maestranza HSE</Text>
            <Text style={styles.subtitle}>Gestión de permisos y seguridad operacional</Text>
          </View>

          <Card variant="glass" style={styles.formCard}>
            <View style={styles.formHeader}>
              <ShieldCheck size={16} color={colors.primary.light} />
              <Text style={styles.formHeaderText}>Acceso seguro</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>RUT de Usuario</Text>
              <View style={[styles.inputWrapper, focusedField === 'rut' && styles.inputWrapperFocused]}>
                <User color={focusedField === 'rut' ? colors.primary.light : colors.text.secondary} size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="12.345.678-9"
                  placeholderTextColor={colors.text.disabled}
                  value={rut}
                  onChangeText={setRut}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedField('rut')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputWrapperFocused]}>
                <Lock color={focusedField === 'password' ? colors.primary.light : colors.text.secondary} size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text.disabled}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} hitSlop={10} style={styles.eyeBtn}>
                  {showPassword ? (
                    <EyeOff color={colors.text.secondary} size={18} />
                  ) : (
                    <Eye color={colors.text.secondary} size={18} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {errorMsg ? (
              <View style={styles.errorContainer}>
                <AlertCircle color={colors.status.danger} size={15} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <Button
              title="Ingresar al Sistema" 
              onPress={() => handleLogin()} 
              isLoading={isLoading}
              style={{ marginTop: 8 }}
            />

            <View style={styles.demoSection}>
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <View style={styles.demoBadge}>
                  <Zap color={colors.text.disabled} size={11} />
                  <Text style={styles.demoTitle}>ACCESO RÁPIDO (DEMO)</Text>
                </View>
                <View style={styles.divider} />
              </View>
              <View style={styles.demoButtons}>
                <Button 
                  title="Líder Demo" 
                  variant="outline"
                  size="sm"
                  onPress={() => handleLogin('lider')} 
                  isLoading={isLoading}
                  style={{ flex: 1 }}
                />
                <Button 
                  title="Jefe Demo" 
                  variant="outline"
                  size="sm"
                  onPress={() => handleLogin('jefe')} 
                  isLoading={isLoading}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </Card>

          <Text style={styles.footerText}>Maestranza Industrial · Sistema HSE v2.0</Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  gradient: {
    flex: 1,
  },
  accentGlow: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(225, 29, 72, 0.06)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 52,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  logoImage: {
    width: '72%',
    height: '72%',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    marginBottom: 14,
  },
  badgeText: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 21,
  },
  formCard: {
    padding: 24,
    borderRadius: radius.xl,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  formHeaderText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.md,
    height: 52,
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: colors.primary.main + '70',
    backgroundColor: 'rgba(225, 29, 72, 0.05)',
  },
  inputIcon: {
    marginRight: 12,
  },
  eyeBtn: {
    padding: 4,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    padding: 12,
    borderRadius: radius.md,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    gap: 8,
  },
  errorText: {
    color: colors.status.danger,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  demoSection: {
    marginTop: 24,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  demoTitle: {
    color: colors.text.disabled,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  footerText: {
    color: colors.text.disabled,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    letterSpacing: 0.3,
  },
});
