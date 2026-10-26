import { Stack } from 'expo-router';

import { colors } from '@/constants/tokens';

export default function AccountStack() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
