import { Stack } from 'expo-router';

import { colors } from '@/constants/tokens';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="scan" options={{ animation: 'fade' }} />
      <Stack.Screen name="done" options={{ gestureEnabled: false, animation: 'fade' }} />
    </Stack>
  );
}
