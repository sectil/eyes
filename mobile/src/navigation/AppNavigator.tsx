import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/authStore';
import { ActivityIndicator, View } from 'react-native';

// Screens
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import HomeScreen from '@/screens/HomeScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import EyeTrackingScreen from '@/screens/EyeTrackingScreen';
import CalibrationScreen from '@/screens/CalibrationScreen';
import EyeExercisesScreen from '@/screens/EyeExercisesScreen';
import SnellenTestScreen from '@/screens/SnellenTestScreen';
import ColorBlindnessTestScreen from '@/screens/ColorBlindnessTestScreen';
import ProgressScreen from '@/screens/ProgressScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: undefined;
  EyeTracking: undefined;
  Calibration: undefined;
  EyeExercises: undefined;
  SnellenTest: undefined;
  ColorBlindnessTest: undefined;
  Progress: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Calibration" component={CalibrationScreen} />
            <Stack.Screen name="EyeTracking" component={EyeTrackingScreen} />
            <Stack.Screen name="EyeExercises" component={EyeExercisesScreen} />
            <Stack.Screen name="SnellenTest" component={SnellenTestScreen} />
            <Stack.Screen name="ColorBlindnessTest" component={ColorBlindnessTestScreen} />
            <Stack.Screen name="Progress" component={ProgressScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
