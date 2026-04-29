import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import LiderDashboardScreen from '../screens/LiderDashboardScreen';
import CrearHotWorkScreen from '../screens/CrearHotWorkScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="LiderDashboard" component={LiderDashboardScreen} />
        <Stack.Screen name="CrearHotWork" component={CrearHotWorkScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
