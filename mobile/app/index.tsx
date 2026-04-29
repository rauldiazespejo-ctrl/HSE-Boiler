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
import { Lock, User, AlertCircle, Eye, EyeOff, BadgeCheck, ShieldCheck } from 'lucide-react-native';
import { AuthContext } from '../src/context/AuthContext';
import { api } from '../src/services/api';

export default function LoginScreen() {
  const { login } = React.useContext(AuthContext);
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      let emailToUse = cleanRut;
      let passwordToUse = cleanPassword;

      // Mock users based on role for fast demo
      if (roleOverride === 'lider') {
        emailToUse = 'lider@hse.cl';
        passwordToUse = '123456';
      } else if (roleOverride === 'jefe') {
        emailToUse = 'jefe@hse.cl';
        passwordToUse = '123456';
      }

      const response = await api.post('/auth/login', {
        email: emailToUse,
        password: passwordToUse
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
      <LinearGradient colors={['#0B0F19', '#121A2B', '#0B0F19']} style={styles.backgroundGradient}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={companyLogo} style={styles.logoImage} resizeMode="contain" />
          </View>
          <View style={styles.badge}>
            <BadgeCheck size={16} color={colors.status.success} />
            <Text style={styles.badgeText}>Plataforma oficial</Text>
          </View>
          <Text style={styles.title}>Maestranza HSE</Text>
          <Text style={styles.subtitle}>Gestión profesional de permisos y seguridad operacional</Text>
        </View>

        <Card variant="glass" style={styles.formCard}>
          <View style={styles.formHeader}>
            <ShieldCheck size={18} color={colors.primary.light} />
            <Text style={styles.formHeaderText}>Acceso seguro</Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>RUT de Usuario</Text>
            <View style={styles.inputWrapper}>
              <User color={colors.text.secondary} size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="12.345.678-9"
                placeholderTextColor={colors.text.disabled}
                value={rut}
                onChangeText={setRut}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Lock color={colors.text.secondary} size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor={colors.text.disabled}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
                {showPassword ? (
                  <EyeOff color={colors.text.secondary} size={20} />
                ) : (
                  <Eye color={colors.text.secondary} size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {errorMsg ? (
            <View style={styles.errorContainer}>
              <AlertCircle color={colors.status.danger} size={16} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <Button
            title="Ingresar" 
            onPress={() => handleLogin()} 
            isLoading={isLoading}
            style={{ marginTop: 10 }}
          />

          {/* Botones de atajo para demo (mock roles) */}
          <View style={styles.demoButtonsContainer}>
            <Text style={styles.demoTitle}>Modo demo: ingreso rápido por perfil</Text>
            <View style={{ gap: 12 }}>
              <Button 
                title="Ingresar como LÍDER" 
                onPress={() => handleLogin('lider')} 
                isLoading={isLoading}
              />
              <Button 
                title="Ingresar como JEFE" 
                variant="secondary"
                onPress={() => handleLogin('jefe')} 
                isLoading={isLoading}
              />
            </View>
          </View>
        </Card>
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
  backgroundGradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    width: '100%',
    maxWidth: 340,
    height: 120,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  logoImage: {
    width: '95%',
    height: '80%',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    marginBottom: 10,
  },
  badgeText: {
    color: '#D1FAE5',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 330,
    lineHeight: 22,
  },
  formCard: {
    padding: 24,
    borderRadius: radius.xl,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  formHeaderText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(3,7,18,0.45)',
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: radius.md,
    height: 50,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
  },
  demoButtonsContainer: {
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: 18,
  },
  demoTitle: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 13,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: radius.md,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.status.danger,
  },
  errorText: {
    color: colors.status.danger,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});
