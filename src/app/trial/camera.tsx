// "cam photo": full-body capture with a rule-of-thirds grid.
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as Device from 'expo-device';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhotoGrid as Grid } from '@/components/photo-grid';
import { Icon, IconButton, Pic, T } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { useApp } from '@/store/app-store';

export default function TrialCamera() {
  const insets = useSafeAreaInsets();
  const { trialPhotoUri, setTrialPhoto } = useApp();
  const [perm, requestPerm] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [torch, setTorch] = useState(false);
  const cam = useRef<CameraView>(null);
  const live = Device.isDevice && perm?.granted;

  useEffect(() => {
    if (Device.isDevice && perm && !perm.granted && perm.canAskAgain) requestPerm();
  }, [perm, requestPerm]);

  const shoot = async () => {
    if (live) {
      const pic = await cam.current?.takePictureAsync({ quality: 0.8 });
      if (pic) setTrialPhoto(pic.uri);
    } else {
      setTrialPhoto('asset:trialPhoto'); // simulator: use the design's sample
    }
    router.replace('/trial/room');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {live ? <CameraView ref={cam} style={StyleSheet.absoluteFill} facing={facing} enableTorch={torch} /> : <Pic name="trialPhoto" style={StyleSheet.absoluteFill} />}
      <View style={[styles.bar, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton name="close" color={colors.textOnDark} accessibilityLabel="Close camera" onPress={() => router.back()} />
        <IconButton name={torch ? 'flash' : 'flash-outline'} color={colors.textOnDark} accessibilityLabel="Torch" onPress={() => setTorch((t) => !t)} />
      </View>
      <View style={styles.gridBox}>
        <Grid />
      </View>
      {!live && (
        <T variant="caption" color={colors.textOnDark} style={styles.simNote}>
          No camera on this device — showing a sample photo.
        </T>
      )}
      <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.thumb}>
          {trialPhotoUri && !trialPhotoUri.startsWith('asset:') ? (
            <Image source={{ uri: trialPhotoUri }} style={StyleSheet.absoluteFill} />
          ) : (
            <Pic name="trialPhoto" style={StyleSheet.absoluteFill} />
          )}
        </View>
        <Pressable onPress={shoot} style={styles.shutter} accessibilityRole="button" accessibilityLabel="Take photo">
          <View style={styles.shutterInner} />
        </Pressable>
        <Pressable onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))} accessibilityLabel="Flip camera" hitSlop={12}>
          <Icon name="camera-flip-outline" size={36} color={colors.textOnDark} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: layout.gutter,
    paddingBottom: spacing.xl,
    backgroundColor: 'rgba(31,31,31,0.3)',
  },
  gridBox: { position: 'absolute', left: '14%', right: '14%', top: '17%', bottom: '17%' },
  simNote: { position: 'absolute', alignSelf: 'center', top: '12%', backgroundColor: 'rgba(0,0,0,0.5)', padding: 6 },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: spacing.xl,
    backgroundColor: 'rgba(31,31,31,0.3)',
  },
  thumb: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: colors.textOnDark },
  shutter: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: colors.textOnDark, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(255,255,255,0.25)' },
});
