// "Switch Profiles" / "Select Profile" sheet.
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { Avatar } from '@/components/profile-avatar';
import { Icon, Sheet, T } from '@/components/ui';
import { colors, spacing } from '@/constants/tokens';
import { useApp } from '@/store/app-store';

export function SwitchProfileSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { profiles, activeProfileId, setActiveProfile } = useApp();
  return (
    <Sheet visible={visible} onClose={onClose} title="Switch Profiles">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xl }}>
        {profiles.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => {
              setActiveProfile(p.id);
              onClose();
            }}
            style={{ alignItems: 'center', gap: spacing.sm }}
            accessibilityRole="radio"
            accessibilityState={{ checked: p.id === activeProfileId }}>
            <Avatar profile={p} size={56} ring={p.id === activeProfileId} />
            <T variant="caption">{p.name.replace(/\.$/, '')}</T>
          </Pressable>
        ))}
        <Pressable
          onPress={() => {
            onClose();
            router.push('/profile/new');
          }}
          style={{ alignItems: 'center', gap: spacing.sm }}
          accessibilityRole="button">
          <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus-circle-outline" size={52} color={colors.textMuted} />
          </View>
          <T variant="caption" color={colors.textMuted}>
            Add Profile
          </T>
        </Pressable>
      </ScrollView>
      <Pressable
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'center', marginTop: spacing.xl }}
        onPress={() => {
          onClose();
          router.push('/account/manage');
        }}>
        <Icon name="pencil-outline" size={18} />
        <T variant="labelRegular" color={colors.textSecondary}>
          Manage Profile
        </T>
      </Pressable>
    </Sheet>
  );
}
