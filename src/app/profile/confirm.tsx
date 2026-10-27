// "measurements" — Confirm Measurements: Edit / Next / Re-Scan.
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { bodyTypeFor, MeasurementGrid } from '@/components/measurements';
import { Button, ModalHeader, Screen } from '@/components/ui';
import { layout, spacing } from '@/constants/tokens';
import { useApp } from '@/store/app-store';

export default function Confirm() {
  const { draft, updateDraft, commitDraft } = useApp();
  const insets = useSafeAreaInsets();
  const values = draft.measurements ?? {};
  return (
    <Screen>
      <ModalHeader title="Confirm Measurements" />
      <ScrollView contentContainerStyle={{ paddingTop: spacing.xl - 4 }}>
        <MeasurementGrid values={values} />
      </ScrollView>
      {/* Edit / Next / Re-Scan: three 44pt rows, 8pt apart, 32pt off the bottom */}
      <View style={{ paddingHorizontal: layout.gutter, paddingBottom: Math.max(32, insets.bottom), gap: spacing.sm }}>
        <Button label="Edit" kind="ghost" onPress={() => router.push({ pathname: '/profile/manual', params: { edit: 'draft' } })} />
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
