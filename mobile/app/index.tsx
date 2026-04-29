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

      // Mock users based on role for fast demo bypass (No backend needed)
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
      <View style={styles.backgroundGradient}>
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

          <View style={styles.demoButtonsContainer}>
            <Text style={styles.demoTitle}>Acceso de Desarrollo (Demo)</Text>
            <View style={{ gap: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
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
      </ScrollView>
      </View>
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
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoImage: {
    width: '75%',
    height: '75%',
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
    fontWeight: '400',
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.md,
    height: 54,
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
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 20,
  },
  demoTitle: {
    color: colors.text.disabled,
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
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
