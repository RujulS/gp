// "Trial Room Entry" → "upload1" → "edit2"/"upload2": pick a full-body photo
// (saved scan, camera or gallery), check it against the grid, continue.
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PhotoGrid as Grid } from '@/components/photo-grid';
import { Button, Icon, ModalHeader, Pic, Screen, Sheet, T, type IconName } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import type { ImageKey } from '@/data/images';
import { img } from '@/data/images';
import { useApp } from '@/store/app-store';

const SCANNED: ImageKey[] = ['trialPhoto', 'scanSide'];

export default function TrialEntry() {
  const { trialPhotoUri, setTrialPhoto } = useApp();
  const [choose, setChoose] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [pending, setPending] = useState<{ uri?: string; key?: ImageKey } | null>(trialPhotoUri ? { uri: trialPhotoUri } : null);

  const fromGallery = async () => {
    setChoose(false);
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled) setPending({ uri: res.assets[0].uri });
  };

  const sources: { icon: IconName; label: string; run: () => void }[] = [
    { icon: 'human-handsdown', label: 'Scanned\nPhotos', run: () => (setChoose(false), setScanned(true)) },
    { icon: 'camera-outline', label: 'Camera', run: () => (setChoose(false), router.push('/trial/camera')) },
    { icon: 'image-outline', label: 'Gallery', run: fromGallery },
  ];

  const save = () => {
    // bundled sample photos are stored by key; the room resolves either
    setTrialPhoto(pending?.uri ?? `asset:${pending?.key}`);
    router.push('/trial/room');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <ModalHeader title="Trial Room" subtitle="Upload a full body picture and start trying on clothes in your wishlist, virtually." />
      {pending ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={styles.preview}>
            {pending.uri ? (
              <Image source={{ uri: pending.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
            ) : (
              <Pic name={pending.key!} style={StyleSheet.absoluteFill} />
            )}
            <Grid />
          </View>
          <T variant="caption" color={colors.textMuted} style={{ marginTop: spacing.md }}>
            Keep your head and feet inside the grid.
          </T>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.tip}>
            <Icon name="lightbulb-outline" size={22} color={colors.textMuted} />
            <T variant="labelRegular" color={colors.textMuted} style={{ flex: 1 }}>
              Wearing fitted clothes can help get more accurate measurements.
            </T>
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Pic name="illusDressingRoom" style={{ width: 340, height: 290 }} contentFit="contain" />
          </View>
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: spacing.sm, padding: layout.gutter }}>
        {pending ? (
          <>
            <Button label="Upload" kind="secondary" style={{ flex: 1 }} onPress={() => setChoose(true)} />
            <Button label="Next" style={{ flex: 1 }} onPress={save} />
          </>
        ) : (
          <Button label="Upload Image" style={{ flex: 1 }} onPress={() => setChoose(true)} />
        )}
      </View>

      <Sheet visible={choose} onClose={() => setChoose(false)} title="Profile Photo">
        <View style={{ flexDirection: 'row', gap: spacing.xxl }}>
          {sources.map((s) => (
            <Pressable key={s.label} onPress={s.run} style={{ alignItems: 'center', gap: spacing.sm, width: 64 }} accessibilityRole="button">
              <View style={styles.source}>
                <Icon name={s.icon} color={colors.accent} />
              </View>
              <T variant="caption" color={colors.textSecondary} style={{ textAlign: 'center' }}>
                {s.label}
              </T>
            </Pressable>
          ))}
        </View>
      </Sheet>

      <Sheet visible={scanned} onClose={() => setScanned(false)} title="Scanned Photos">
        <ScrollView horizontal contentContainerStyle={{ gap: spacing.xs }}>
          {SCANNED.map((k) => (
            <Pressable key={k} onPress={() => (setScanned(false), setPending({ key: k }))} accessibilityRole="button">
              <Image source={img[k]} style={{ width: 96, height: 96, backgroundColor: colors.surface }} contentFit="contain" />
            </Pressable>
          ))}
        </ScrollView>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tip: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: layout.gutter,
    padding: spacing.lg,
  },
  preview: { width: 240, height: 420, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  source: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
