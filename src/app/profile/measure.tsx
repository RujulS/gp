// "Measure main": choose body scan or manual entry.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { ExitProfileDialog } from '@/components/exit-profile';
import { Button, ModalHeader, Pic, Screen, T } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { useApp } from '@/store/app-store';

export default function Measure() {
  const { commitDraft } = useApp();
  const [exit, setExit] = useState(false);
  return (
    <Screen edges={['top', 'bottom']}>
      <ModalHeader
        title="Let us find your body size and type."
        subtitle="This helps us find the right size for you across  products."
        onClose={() => setExit(true)}
      />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Pic name="measureIllus" style={{ width: 340, height: 300 }} contentFit="contain" />
      </View>
      <Pressable
        style={{ alignSelf: 'center', padding: spacing.md }}
        onPress={() => {
          commitDraft();
          router.replace({ pathname: '/profile/done', params: { kind: 'created' } });
        }}>
        <T variant="labelRegular" color={colors.textMuted} style={{ textDecorationLine: 'underline' }}>
          Skip
        </T>
      </Pressable>
      <View style={{ padding: layout.gutter, gap: spacing.md }}>
        <Button label="Start Scanning" onPress={() => router.push('/profile/scan')} />
        <Button label="Enter Manually" kind="secondary" onPress={() => router.push('/profile/manual')} />
      </View>
      <ExitProfileDialog visible={exit} onCancel={() => setExit(false)} />
    </Screen>
  );
}
