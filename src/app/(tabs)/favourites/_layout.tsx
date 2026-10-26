import { Stack } from 'expo-router';

import { colors } from '@/constants/tokens';

export default function FavouritesStack() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
