// "full fin" (body type), "finish" (profile created), "prof deleted".
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button, ResultBadge, Screen, T, type IconName } from '@/components/ui';
import { closeFlow } from '@/lib/close-flow';
import { colors, layout, spacing } from '@/constants/tokens';

export default function Done() {
  const { kind, bodyType } = useLocalSearchParams<{ kind: 'body' | 'created' | 'deleted'; bodyType?: string }>();
  const c: { icon: IconName; title: string; body?: string } =
    kind === 'body'
      ? {
          icon: 'human-female',
          title: `You are a ${bodyType ?? 'Rectangle'} body type!`,
          body: 'Your measurements and preferences have been recorded. Enjoy your personalised shopping experience!',
        }
      : kind === 'deleted'
        ? { icon: 'trash-can-outline', title: 'Profile Deleted!' }
        : { icon: 'check', title: 'New Profile Created!', body: 'Thank you for your inputs. Enjoy your personalised shopping experience!' };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: layout.gutter * 2 }}>
        <ResultBadge icon={c.icon} />
        <T variant="headline" style={{ marginTop: spacing.xxl, textAlign: 'center' }}>
          {c.title}
        </T>
        {c.body && (
          <T variant="labelRegular" color={colors.textSecondary} style={{ marginTop: spacing.lg, textAlign: 'center', lineHeight: 18 }}>
            {c.body}
          </T>
        )}
      </View>
      <Button label="Done" style={{ margin: layout.gutter }} onPress={() => closeFlow()} />
    </Screen>
  );
}
