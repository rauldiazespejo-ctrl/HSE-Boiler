import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { colors, radius } from '../src/theme/colors';
import { Lock, User, AlertCircle } from 'lucide-react-native';
import { AuthContext } from '../src/context/AuthContext';
import { api } from '../src/services/api';

export default function LoginScreen() {
  const { login } = React.useContext(AuthContext);
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (roleOverride?: 'lider' | 'jefe') => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      let emailToUse = rut;
      let passwordToUse = password;

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <LinearGradient
            colors={colors.primary.gradient as [string, string]}
            style={styles.logoContainer}
          >
            <Text style={styles.logoText}>HSE</Text>
          </LinearGradient>
          <Text style={styles.title}>Maestranza HSE</Text>
          <Text style={styles.subtitle}>Sistema Integral de Permisos</Text>
        </View>

        <Card variant="glass" style={styles.formCard}>
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
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
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
            <Text style={styles.demoTitle}>-- Modo Demo: Ingresar como --</Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  formCard: {
    padding: 24,
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
    backgroundColor: 'rgba(0,0,0,0.2)',
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
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: 20,
  },
  demoTitle: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 12,
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
