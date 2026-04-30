import React, { useContext, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../src/theme/colors';
import { AuthContext, AuthProvider } from '../src/context/AuthContext';
import { PermisoProvider } from '../src/context/PermisoContext';

function ProtectedNavigation() {
  const { user, isLoading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const firstSegment = segments[0];
    const inAuthScreen = !firstSegment;
    const inLiderArea = firstSegment === 'lider';
    const inJefeArea = firstSegment === 'jefe';
    const inGerenteArea = firstSegment === 'gerente';

    if (!user && !inAuthScreen) {
      router.replace('/');
      return;
    }

    if (!user) return;

    if (inAuthScreen) {
      const rol = user.rol;
      if (rol === 'jefe') router.replace('/jefe');
      else if (rol === 'gerente') router.replace('/gerente');
      else router.replace('/lider');
      return;
    }

    if (inGerenteArea && user.rol !== 'gerente') {
      router.replace(user.rol === 'jefe' ? '/jefe' : '/lider');
      return;
    }

    if (inJefeArea && user.rol !== 'jefe' && user.rol !== 'gerente') {
      router.replace('/lider');
      return;
    }

    if (inLiderArea && (user.rol === 'jefe' || user.rol === 'gerente')) {
      router.replace(user.rol === 'gerente' ? '/gerente' : '/jefe');
    }
  }, [segments, user, isLoading, router]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="lider/index" />
      <Stack.Screen name="lider/permiso/step1" />
      <Stack.Screen name="lider/permiso/step2" />
      <Stack.Screen name="lider/permiso/step3" />
      <Stack.Screen name="lider/permiso/step4" />
      <Stack.Screen name="jefe/index" />
      <Stack.Screen name="jefe/approve/[id]" />
      <Stack.Screen name="gerente/index" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PermisoProvider>
        <LinearGradient
          colors={[colors.background.main, '#0C0E18', colors.background.main]}
          style={styles.container}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ProtectedNavigation />
          <StatusBar style="light" />
        </LinearGradient>
      </PermisoProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.main,
  },
});
