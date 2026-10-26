// "manual1/2" (Enter Measurements) and edit mode from Confirm / Manage.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';

import { MeasureSheet, MeasurementGrid } from '@/components/measurements';
import { Button, ModalHeader, Screen } from '@/components/ui';
import { layout, spacing } from '@/constants/tokens';
import type { MeasureKey, Measurements } from '@/data/catalog';
import { useApp } from '@/store/app-store';

export default function Manual() {
  const { edit } = useLocalSearchParams<{ edit?: 'draft' | 'profile' }>();
  const { draft, updateDraft, activeProfile, updateProfile } = useApp();
  const start = edit === 'profile' ? activeProfile.measurements : draft.measurements;
  const [values, setValues] = useState<Partial<Measurements>>(start ?? {});
  const [open, setOpen] = useState<MeasureKey | null>(null);

  return (
    <Screen edges={['top', 'bottom']}>
      <ModalHeader title={edit ? 'Edit Measurements' : 'Enter Measurements'} />
      <ScrollView contentContainerStyle={{ paddingTop: spacing.lg }}>
        <MeasurementGrid values={values} onPick={setOpen} underline />
      </ScrollView>
      <Button
        label="Save"
        style={{ margin: layout.gutter }}
        onPress={() => {
          const full = values as Measurements;
          if (edit === 'profile') {
            updateProfile(activeProfile.id, { measurements: full });
            router.back();
          } else {
            updateDraft({ measurements: full });
            if (edit === 'draft') router.back();
            else router.push('/profile/confirm');
          }
        }}
      />
      <MeasureSheet
        open={open}
        initial={start}
        values={values}
        onClose={() => setOpen(null)}
        onSave={(k, v) => setValues((cur) => ({ ...cur, [k]: v }))}
      />
    </Screen>
  );
}
