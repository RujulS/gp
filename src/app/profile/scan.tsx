// Body scan ("Scan1" → "front prof" → "front prof scan" → "front done" →
// "scan2" → "side prof1" → "scan done"). Each side runs: the floor circle
// appears, the person steps onto it, the scan sweeps, then success.
// On a real device the live camera replaces the sample photos; the
// measurement model itself isn't built yet, so the scan returns the design's
// values.
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Dialog, Icon, IconButton, Pic, T } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { scannedMeasurements } from '@/data/catalog';
import { useApp } from '@/store/app-store';

type Phase =
  | 'frontCircle' // empty room, circle on the floor, "stand on the circle"
  | 'frontStand' // person steps onto the circle
  | 'frontScanning'
  | 'frontDone'
  | 'sideTurn' // "turn your body to the side"
  | 'sideStand' // person now side-on, on the circle
  | 'sideScanning'
  | 'done';

// how long each phase lasts before moving on, and where it goes
const FLOW: Partial<Record<Phase, [Phase, number]>> = {
  frontCircle: ['frontStand', 2200],
  frontStand: ['frontScanning', 1200],
  frontScanning: ['frontDone', 3200],
  frontDone: ['sideTurn', 1600],
  sideTurn: ['sideStand', 2600],
  sideStand: ['sideScanning', 1000],
  sideScanning: ['done', 3200],
};

const TITLE: Record<Phase, string> = {
  frontCircle: 'Front profile scan',
  frontStand: 'Front profile scan',
  frontScanning: 'Scanning front profile..',
  frontDone: '',
  sideTurn: 'Side profile scan.',
  sideStand: 'Side profile scan.',
  sideScanning: 'Scanning side profile..',
  done: '',
};

const TIP: Partial<Record<Phase, string>> = {
  frontCircle: 'Stand on the circle, facing the camera and make sure your full body is in the frame, to start front profile scan.',
  sideTurn: 'Continue to stay within the circle and turn your body to the side, to start the side profile scan.',
};

// Figma frame geometry (430×932), scaled to the device width
const FRAME = { x: 32, y: 224, w: 366, h: 556 };
// one ring per pose, each with gaps so the feet read as standing in front of it
const RINGS = {
  empty: { image: 'scanCircle', x: 97, y: 703, w: 228, h: 87 },
  front: { image: 'scanCircleFront', x: 99, y: 703, w: 224, h: 85 },
  side: { image: 'scanCircleSide', x: 97, y: 692, w: 224, h: 84 },
} as const;
const GLOW = 120;

export default function Scan() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = width / 430;
  const { updateDraft, setTrialPhoto } = useApp();
  const [perm, requestPerm] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('frontCircle');
  const [facing, setFacing] = useState<CameraType>('back');
  const [torch, setTorch] = useState(false);
  const cam = useRef<CameraView>(null);
  const shots = useRef<string[]>([]);
  const live = Device.isDevice && perm?.granted;

  useEffect(() => {
    if (Device.isDevice && perm && !perm.granted && perm.canAskAgain) requestPerm();
  }, [perm, requestPerm]);

  useEffect(() => {
    const n = FLOW[phase];
    if (!n) return;
    const t = setTimeout(async () => {
      if ((phase === 'frontScanning' || phase === 'sideScanning') && live) {
        const pic = await cam.current?.takePictureAsync({ quality: 0.6 }).catch(() => undefined);
        if (pic) shots.current.push(pic.uri);
      }
      if (n[0] === 'frontDone' || n[0] === 'done') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase(n[0]);
    }, n[1]);
    return () => clearTimeout(t);
  }, [phase, live]);

  const onSide = phase === 'sideStand' || phase === 'sideScanning' || phase === 'done';
  const sideStep = phase.startsWith('side') || phase === 'done';
  const scanning = phase === 'frontScanning' || phase === 'sideScanning';
  const personOnCircle = phase !== 'frontCircle';
  // live camera: the person's feet aren't known, so keep the plain ring
  const ring = live || !personOnCircle ? RINGS.empty : onSide ? RINGS.side : RINGS.front;

  const finish = (savePhotos: boolean) => {
    updateDraft({ measurements: scannedMeasurements });
    if (savePhotos) setTrialPhoto(shots.current[0]);
    router.replace('/profile/confirm');
  };

  const box = (r: { x: number; y: number; w: number; h: number }) => ({
    position: 'absolute' as const,
    left: r.x * s,
    top: r.y * s,
    width: r.w * s,
    height: r.h * s,
  });
  const scene = { position: 'absolute' as const, left: 0, top: 0, width, height: 932 * s };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {live ? (
        <CameraView ref={cam} style={StyleSheet.absoluteFill} facing={facing} enableTorch={torch} />
      ) : (
        <>
          <Pic name="scanEmpty" style={scene} transition={0} />
          {personOnCircle && !onSide && (
            <Animated.View key="front" entering={FadeIn.duration(600)} exiting={FadeOut.duration(500)} style={scene}>
              <Pic name="scanFrontScene" style={StyleSheet.absoluteFill} transition={0} />
            </Animated.View>
          )}
          {onSide && (
            <Animated.View key="side" entering={FadeIn.duration(600)} style={scene}>
              <Pic name="scanSideScene" style={StyleSheet.absoluteFill} transition={0} />
            </Animated.View>
          )}
        </>
      )}

      {/* floor circle: first thing on screen, then the person stands on it */}
      <Animated.View entering={ZoomIn.duration(450)} pointerEvents="none" style={box(ring)}>
        <Pic name={ring.image} style={StyleSheet.absoluteFill} contentFit="contain" transition={0} />
      </Animated.View>

      {scanning && <ScanSweep key={phase} style={box(FRAME)} />}

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.topRow}>
          <IconButton name="close" color={colors.textOnDark} accessibilityLabel="Cancel scan" onPress={() => router.back()} />
          <T variant="body" color={colors.textOnDark} style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 18 }}>
            {TITLE[phase]}
          </T>
          <IconButton name={torch ? 'flash' : 'flash-outline'} color={colors.textOnDark} accessibilityLabel="Torch" onPress={() => setTorch((t) => !t)} />
        </View>
        {phase === 'frontCircle' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}>
            <Icon name="information-outline" size={20} color={colors.textOnDark} />
            <T variant="labelRegular" color={colors.textOnDark}>
              Wear fitted clothes to get more accurate measurements.
            </T>
          </View>
        )}
      </View>

      <View style={[styles.steps, { top: 157 * s }]}>
        {[1, 2].map((n) => {
          const current = n === 1 ? !sideStep : sideStep;
          const complete = n === 1 && sideStep;
          return (
            <View key={n} style={styles.stepWell}>
              <View style={[styles.step, (current || complete) && { backgroundColor: colors.background }]}>
                <T variant="label" color={current || complete ? colors.textMuted : colors.textOnDark} style={{ fontFamily: 'Manrope_700Bold' }}>
                  {n}
                </T>
              </View>
            </View>
          );
        })}
      </View>

      {TIP[phase] && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={[styles.tip, { top: 300 * s }]}>
          <Icon name={sideStep ? 'human-handsdown' : 'human-handsup'} size={36} color={colors.textOnDark} />
          <T variant="labelRegular" color={colors.textOnDark} style={{ flex: 1, lineHeight: 18 }}>
            {TIP[phase]}
          </T>
        </Animated.View>
      )}

      {phase === 'frontDone' && (
        <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(250)} style={[StyleSheet.absoluteFill, styles.doneVeil]}>
          <Animated.View entering={ZoomIn.springify()} style={styles.doneTick}>
            <Icon name="check" size={48} color={colors.text} />
          </Animated.View>
          <T variant="body" color={colors.textOnDark} style={{ marginTop: spacing.xl, fontFamily: 'Manrope_600SemiBold', fontSize: 18 }}>
            Front profile scan complete.
          </T>
        </Animated.View>
      )}

      <View style={[styles.bottomBar, { top: 804 * s }]}>
        <Pressable onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))} accessibilityLabel="Flip camera" hitSlop={12} style={{ marginTop: 32 * s }}>
          <Icon name="camera-flip-outline" size={36} color={colors.textOnDark} />
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
          <View style={[styles.doneTick, { backgroundColor: colors.accent, width: 80, height: 80, borderRadius: 40 }]}>
            <Icon name="check" size={48} color={colors.textOnDark} />
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

// Corner frame ("Group 14524") with a glowing line sweeping top to bottom.
function ScanSweep({ style }: { style: object }) {
  const t = useSharedValue(0);
  const [h, setH] = useState(0);

  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, true);
    return () => cancelAnimation(t);
  }, [t]);

  const line = useAnimatedStyle(() => ({ transform: [{ translateY: t.value * h }] }));
  // soft band of light centred on the line, so it reads the same both ways
  const glow = useAnimatedStyle(() => ({ transform: [{ translateY: t.value * h - GLOW / 2 }] }));

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      pointerEvents="none"
      style={style}
      onLayout={(e) => setH(e.nativeEvent.layout.height)}>
      <Pic name="scanFrame" style={StyleSheet.absoluteFill} contentFit="fill" transition={0} />
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', marginHorizontal: 6 }]}>
        <Animated.View style={[styles.glow, glow]}>
          <LinearGradient
            colors={['rgba(232,136,96,0)', 'rgba(232,136,96,0.35)', 'rgba(232,136,96,0)']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View style={[styles.line, line]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  topBar: { position: 'absolute', left: 0, right: 0, top: 0, backgroundColor: 'rgba(31,31,31,0.3)', paddingHorizontal: layout.gutter, paddingBottom: spacing.lg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  steps: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', gap: 1 },
  stepWell: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(31,31,31,0.3)', alignItems: 'center', justifyContent: 'center' },
  step: { width: 30, height: 30, borderRadius: 15, borderWidth: 3, borderColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  tip: {
    position: 'absolute',
    left: layout.gutter,
    right: layout.gutter,
    backgroundColor: 'rgba(31,31,31,0.75)',
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  doneVeil: { backgroundColor: 'rgba(31,31,31,0.45)', alignItems: 'center', justifyContent: 'center' },
  doneTick: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', backgroundColor: 'rgba(31,31,31,0.3)' },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 3,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  glow: { position: 'absolute', left: 0, right: 0, top: 0, height: GLOW },
});
