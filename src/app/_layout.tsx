import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors } from '@/constants/tokens';
import { AppStoreProvider } from '@/store/app-store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({ Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppStoreProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="(tabs)" />
          {/* a pushed card, not a modal: iOS modals always rise from the bottom and ignore `animation` */}
          <Stack.Screen name="menu" options={{ animation: 'slide_from_left', gestureEnabled: false }} />
          <Stack.Screen name="profile" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="trial" options={{ presentation: 'fullScreenModal' }} />
          {/* reachable from inside the profile / trial modals, so it must present above them */}
          <Stack.Screen name="checkout" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="collection/new" options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="collection/save"
            options={{ presentation: 'transparentModal', animation: 'slide_from_bottom', contentStyle: { backgroundColor: 'rgba(0,0,0,0.45)' } }}
          />
        </Stack>
      </AppStoreProvider>
    </GestureHandlerRootView>
  );
}
