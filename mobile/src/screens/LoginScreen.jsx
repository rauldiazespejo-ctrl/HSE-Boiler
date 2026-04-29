import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import Button from '../components/Button';
import { User, Lock } from 'lucide-react-native';

import { api, setAuthToken } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('juan.perez@hse.cl');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.login(email, password);
      if (response.success) {
        setAuthToken(response.token);
        // En MVP, todos van al dashboard temporalmente
        navigation.replace('LiderDashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>HSE Maestranza</Text>
          <Text style={styles.subtitle}>Portal de Seguridad Operacional</Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={{color: COLORS.danger, marginBottom: SPACING.md, textAlign: 'center'}}>{error}</Text>}
          <View style={styles.inputContainer}>
             <Text style={styles.label}>Email</Text>
             <View style={styles.inputMock}>
                <User color={COLORS.textMuted} size={20} />
                <TextInput 
                  style={styles.inputText}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
             </View>
          </View>
          
          <View style={styles.inputContainer}>
             <Text style={styles.label}>Contraseña</Text>
             <View style={styles.inputMock}>
                <Lock color={COLORS.textMuted} size={20} />
                <TextInput 
                  style={styles.inputText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
             </View>
          </View>

          <Button 
            title="Ingresar" 
            onPress={handleLogin} 
            loading={loading}
            style={{ marginTop: SPACING.md }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
  },
  form: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  inputMock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    padding: SPACING.md,
  },
  inputText: {
    ...TYPOGRAPHY.body,
    marginLeft: SPACING.sm,
    flex: 1,
    color: COLORS.textPrimary,
  }
});

export default LoginScreen;
