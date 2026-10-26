// Body scan ("Scan1" → "front prof" → "front done" → "scan2" → "side prof1"
// → "scan done"). Uses the camera on a real device; on a simulator (no
// camera) it plays the flow over the design's sample photos. The measurement
// model itself isn't built yet — the scan returns the design's values.
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Dialog, Icon, IconButton, Pic, T } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { scannedMeasurements } from '@/data/catalog';
import { useApp } from '@/store/app-store';

type Phase = 'frontIntro' | 'frontScanning' | 'frontDone' | 'sideIntro' | 'sideScanning' | 'done';

const COPY: Record<Phase, { title: string; tip?: string }> = {
  frontIntro: { title: 'Front profile scan', tip: 'Stand on the circle, facing the camera and make sure your full body is in the frame, to start front profile scan.' },
  frontScanning: { title: 'Scanning front profile..' },
  frontDone: { title: '' },
  sideIntro: { title: 'Side profile scan.', tip: 'Continue to stay within the circle and turn your body to the side, to start the side profile scan.' },
  sideScanning: { title: 'Scanning side profile..' },
  done: { title: '' },
};

export default function Scan() {
  const insets = useSafeAreaInsets();
  const { updateDraft, setTrialPhoto } = useApp();
  const [perm, requestPerm] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('frontIntro');
  const [facing, setFacing] = useState<CameraType>('back');
  const [torch, setTorch] = useState(false);
  const cam = useRef<CameraView>(null);
  const shots = useRef<string[]>([]);
  const useCamera = Device.isDevice && perm?.granted;

  useEffect(() => {
    if (Device.isDevice && perm && !perm.granted && perm.canAskAgain) requestPerm();
  }, [perm, requestPerm]);

  // Each phase advances on a timer, like the auto-capture in the design.
  useEffect(() => {
    const next: Partial<Record<Phase, [Phase, number]>> = {
      frontIntro: ['frontScanning', 3500],
      frontScanning: ['frontDone', 2500],
      frontDone: ['sideIntro', 1500],
      sideIntro: ['sideScanning', 3500],
      sideScanning: ['done', 2500],
    };
    const n = next[phase];
    if (!n) return;
    const t = setTimeout(async () => {
      if ((phase === 'frontScanning' || phase === 'sideScanning') && useCamera) {
        const pic = await cam.current?.takePictureAsync({ quality: 0.6 }).catch(() => undefined);
        if (pic) shots.current.push(pic.uri);
      }
      if (n[0] === 'frontDone' || n[0] === 'done') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase(n[0]);
    }, n[1]);
    return () => clearTimeout(t);
  }, [phase, useCamera]);

  const side = phase === 'sideIntro' || phase === 'sideScanning' || phase === 'done';
  const scanning = phase === 'frontScanning' || phase === 'sideScanning';
  const finish = (savePhotos: boolean) => {
    updateDraft({ measurements: scannedMeasurements });
    if (savePhotos) setTrialPhoto(shots.current[0]);
    router.replace('/profile/confirm');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {useCamera ? (
        <CameraView ref={cam} style={StyleSheet.absoluteFill} facing={facing} enableTorch={torch} />
      ) : (
        <>
          <Pic name={side || phase === 'frontIntro' ? 'scanBackdrop' : 'scanFront'} style={StyleSheet.absoluteFill} />
          {/* the side shot is a cut-out; the design stands it in the same room */}
          {side && <Pic name="scanSide" style={[StyleSheet.absoluteFill, { top: '14%', bottom: '12%' }]} contentFit="contain" />}
        </>
      )}

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.topRow}>
          <IconButton name="close" color={colors.textOnDark} accessibilityLabel="Cancel scan" onPress={() => router.back()} />
          <T variant="body" color={colors.textOnDark}>
            {COPY[phase].title}
          </T>
          <IconButton name={torch ? 'flash' : 'flash-outline'} color={colors.textOnDark} accessibilityLabel="Torch" onPress={() => setTorch((t) => !t)} />
        </View>
        {phase === 'frontIntro' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}>
            <Icon name="information-outline" size={16} color={colors.textOnDark} />
            <T variant="caption" color={colors.textOnDark}>
              Wear fitted clothes to get more accurate measurements.
            </T>
          </View>
        )}
      </View>

      <View style={styles.steps}>
        {[1, 2].map((n) => (
          <View key={n} style={[styles.step, (n === 1 ? !side : side) && { borderWidth: 2 }]}>
            <T variant="caption" color={colors.textOnDark}>
              {n}
            </T>
          </View>
        ))}
      </View>

      {scanning && (
        <View pointerEvents="none" style={styles.frame}>
          {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
            <View key={c} style={[styles.corner, styles[c]]} />
          ))}
        </View>
      )}
      <View pointerEvents="none" style={styles.circle} />

      {COPY[phase].tip && (
        <View style={styles.tip}>
          <Icon name={side ? 'human-handsdown' : 'human-handsup'} size={36} color={colors.textOnDark} />
          <T variant="labelRegular" color={colors.textOnDark} style={{ flex: 1, lineHeight: 18 }}>
            {COPY[phase].tip}
          </T>
        </View>
      )}

      {phase === 'frontDone' && (
        <View style={[StyleSheet.absoluteFill, styles.doneVeil]}>
          <View style={styles.doneTick}>
            <Icon name="check" size={40} color={colors.text} />
          </View>
          <T variant="body" color={colors.textOnDark} style={{ marginTop: spacing.xl }}>
            Front profile scan complete.
          </T>
        </View>
      )}

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))} accessibilityLabel="Flip camera" hitSlop={12}>
          <Icon name="camera-flip-outline" size={32} color={colors.textOnDark} />
        </Pressable>
      </View>

      {Device.isDevice && perm && !perm.granted && !perm.canAskAgain && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background, justifyContent: 'center', padding: layout.gutter, gap: spacing.lg }]}>
          <T variant="subtitle">Camera access is off</T>
          <T variant="labelRegular" color={colors.textSecondary}>
            Turn on camera access in Settings to scan, or enter your measurements manually.
          </T>
          <Button label="Enter Manually" onPress={() => router.replace('/profile/manual')} />
        </View>
      )}

      <Dialog
        visible={phase === 'done'}
        icon={
          <View style={[styles.doneTick, { backgroundColor: colors.accent, width: 64, height: 64, borderRadius: 32 }]}>
            <Icon name="check" size={40} color={colors.textOnDark} />
          </View>
        }
        title="Scan Completed."
        message="Would you like to save these pictures for the Trial room feature?"
        cancel="No, I’ll upload later"
        confirm="Yes, Save pictures"
        onCancel={() => finish(false)}
        onConfirm={() => finish(true)}
      />
    </View>
  );
}

const C = 28;
const styles = StyleSheet.create({
  topBar: { backgroundColor: 'rgba(31,31,31,0.3)', paddingHorizontal: layout.gutter, paddingBottom: spacing.lg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  steps: { flexDirection: 'row', gap: 4, alignSelf: 'center', marginTop: spacing.lg },
  step: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: colors.textOnDark, alignItems: 'center', justifyContent: 'center' },
  frame: { position: 'absolute', left: 30, right: 30, top: '18%', bottom: '18%' },
  corner: { position: 'absolute', width: 70, height: 70, borderColor: colors.textOnDark },
  tl: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: C },
  tr: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: C },
  bl: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: C },
  br: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: C },
  circle: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '12%',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: colors.textOnDark,
    transform: [{ scaleY: 0.38 }], // floor ellipse
  },
  tip: {
    position: 'absolute',
    left: layout.gutter,
    right: layout.gutter,
    top: '30%',
    backgroundColor: 'rgba(31,31,31,0.75)',
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  doneVeil: { backgroundColor: 'rgba(31,31,31,0.45)', alignItems: 'center', justifyContent: 'center' },
  doneTick: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', paddingTop: spacing.xl, backgroundColor: 'rgba(31,31,31,0.3)' },
});
