import { Stack } from 'expo-router';

import { colors } from '@/constants/tokens';

export default function TrialLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="camera" options={{ animation: 'fade' }} />
    </Stack>
  );
}
