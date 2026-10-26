// "measurements" — Confirm Measurements: Edit / Next / Re-Scan.
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { bodyTypeFor, MeasurementGrid } from '@/components/measurements';
import { Button, ModalHeader, Screen, T } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { useApp } from '@/store/app-store';

export default function Confirm() {
  const { draft, updateDraft, commitDraft } = useApp();
  const values = draft.measurements ?? {};
  return (
    <Screen edges={['top', 'bottom']}>
      <ModalHeader title="Confirm Measurements" />
      <ScrollView contentContainerStyle={{ paddingTop: spacing.lg }}>
        <MeasurementGrid values={values} />
      </ScrollView>
      <Pressable style={{ alignSelf: 'center', padding: spacing.md }} onPress={() => router.push({ pathname: '/profile/manual', params: { edit: 'draft' } })}>
        <T variant="labelRegular" color={colors.textMuted}>
          Edit
        </T>
      </Pressable>
      <View style={{ padding: layout.gutter, gap: spacing.md }}>
        <Button
          label="Next"
          onPress={() => {
            const bodyType = bodyTypeFor(values);
            updateDraft({ bodyType });
            commitDraft();
            router.replace({ pathname: '/profile/done', params: { kind: 'body', bodyType } });
          }}
        />
        <Button label="Re-Scan" kind="secondary" onPress={() => router.replace('/profile/scan')} />
      </View>
    </Screen>
  );
}
