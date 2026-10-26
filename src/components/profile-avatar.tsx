// Round profile photo with the orange camera badge; tapping opens the
// "Profile Photo" sheet (Camera / Gallery).
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Icon, Pic, Sheet, T } from '@/components/ui';
import { colors, spacing } from '@/constants/tokens';
import type { Profile } from '@/data/catalog';

export function Avatar({ profile, size = 64, ring }: { profile: Partial<Profile>; size?: number; ring?: boolean }) {
  const inner = ring ? size - 8 : size;
  const pic = profile.photoUri ? (
    <Image source={{ uri: profile.photoUri }} style={{ width: inner, height: inner, borderRadius: inner / 2 }} />
  ) : profile.avatar ? (
    <Pic name={profile.avatar} style={{ width: inner, height: inner, borderRadius: inner / 2 }} />
  ) : (
    <View style={{ width: inner, height: inner, borderRadius: inner / 2, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="account" size={inner * 0.6} color={colors.background} />
    </View>
  );
  if (!ring) return pic;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
      {pic}
    </View>
  );
}

export function AvatarPicker({ profile, onPicked }: { profile: Partial<Profile>; onPicked: (uri: string) => void }) {
  const [open, setOpen] = useState(false);

  const pick = async (source: 'camera' | 'library') => {
    setOpen(false);
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 };
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return Alert.alert('Camera access needed', 'Allow camera access in Settings to take a profile photo.');
      }
      const res = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      if (!res.canceled) onPicked(res.assets[0].uri);
    } catch {
      Alert.alert('Camera unavailable', 'This device has no camera. Choose a photo from the gallery instead.');
    }
  };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={{ alignSelf: 'center' }} accessibilityRole="button" accessibilityLabel="Change profile photo">
        <Avatar profile={profile} size={64} />
        <View style={{ position: 'absolute', right: -6, bottom: -2, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.background }}>
          <Icon name="camera-outline" size={12} color={colors.textOnDark} />
        </View>
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title="Profile Photo">
        <View style={{ flexDirection: 'row', gap: spacing.xl }}>
          {(
            [
              ['camera', 'camera-outline', 'Camera'],
              ['library', 'image-outline', 'Gallery'],
            ] as const
          ).map(([src, icon, label]) => (
            <Pressable key={src} onPress={() => pick(src)} style={{ alignItems: 'center', gap: spacing.sm }} accessibilityRole="button">
              <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={icon} color={colors.accent} />
              </View>
              <T variant="caption" color={colors.textSecondary}>
                {label}
              </T>
            </Pressable>
          ))}
        </View>
      </Sheet>
    </>
  );
}
