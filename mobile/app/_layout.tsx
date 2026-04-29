import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../src/theme/colors';
import { AuthProvider } from '../src/context/AuthContext';
import { PermisoProvider } from '../src/context/PermisoContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PermisoProvider>
      <LinearGradient 
        colors={['#0A0F1C', '#1A233A', '#0F172A']} 
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
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
      </Stack>
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
});
