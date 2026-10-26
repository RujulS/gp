// "shop pref": gender category + preferred fit. `?edit=1` edits the active
// profile from Manage Profile instead of continuing the setup flow.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, ModalHeader, Option, Pic, Screen, T } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { fitOptions } from '@/data/catalog';
import { useApp } from '@/store/app-store';

export default function Preferences() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { draft, updateDraft, activeProfile, updateProfile } = useApp();
  const base = edit ? activeProfile : draft;
  const [gender, setGender] = useState(base.gender);
  const [fit, setFit] = useState<string[]>(base.fit ?? []);

  const toggle = (f: string) => setFit((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  return (
    <Screen edges={['top', 'bottom']}>
      <ModalHeader title="Let us know your shopping preference." subtitle="Help us curate a more personalised product list for you" />
      <View style={{ flex: 1, paddingHorizontal: layout.gutter }}>
        <T variant="labelRegular" style={{ marginTop: spacing.lg }}>
          Tell us the <T variant="label">category</T> you want to shop for.
        </T>
        <View style={{ flexDirection: 'row', gap: spacing.xxl, marginTop: spacing.xl, paddingLeft: spacing.md }}>
          {(
            [
              ['Male', 'avatarMale'],
              ['Female', 'avatarFemale'],
            ] as const
          ).map(([g, img]) => (
            <Pressable key={g} onPress={() => setGender(g)} style={{ alignItems: 'center', gap: spacing.lg }} accessibilityRole="radio" accessibilityState={{ checked: gender === g }}>
              <View style={{ width: 88, height: 88, borderRadius: 44, overflow: 'hidden', backgroundColor: colors.surfaceAlt, borderWidth: 2, borderColor: gender === g ? colors.accent : 'transparent' }}>
                <Pic name={img} style={{ width: '100%', height: '100%' }} />
              </View>
              <T variant="labelRegular">{g}</T>
            </Pressable>
          ))}
        </View>
        <T variant="labelRegular" style={{ marginTop: spacing.xxl + 8 }}>
          Tell us the preferred <T variant="label">fit</T> for your outfits .
        </T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.lg }}>
          {fitOptions.map((f) => (
            <Option key={f} label={f} selected={fit.includes(f)} onPress={() => toggle(f)} />
          ))}
        </View>
      </View>
      <Button
        label={edit ? 'Save' : 'Next'}
        style={{ margin: layout.gutter }}
        onPress={() => {
          if (edit) {
            updateProfile(activeProfile.id, { gender, fit });
            router.back();
          } else {
            updateDraft({ gender, fit });
            router.push('/profile/measure');
          }
        }}
      />
    </Screen>
  );
}
