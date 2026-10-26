// Measurement grid ("measurements", "manual1") and the per-measure ruler
// sheet ("meas edit1-5"): illustration, value field, scrollable tick ruler.
import * as Haptics from 'expo-haptics';
import { useRef, useState, type ComponentRef } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, IconButton, Pic, T } from '@/components/ui';
import { colors, layout, radius, spacing, type } from '@/constants/tokens';
import { measures, type MeasureKey, type Measurements } from '@/data/catalog';

const fmt = (v: number | undefined) => (v === undefined ? '00' : Number.isInteger(v) ? String(v).padStart(2, '0') : String(v));

export function MeasurementGrid({
  values,
  onPick,
  underline,
}: {
  values: Partial<Measurements>;
  onPick?: (k: MeasureKey) => void;
  underline?: boolean;
}) {
  return (
    <View style={styles.grid}>
      {measures.map((m) => (
        <Pressable
          key={m.key}
          style={styles.cell}
          onPress={onPick ? () => onPick(m.key) : undefined}
          disabled={!onPick}
          accessibilityRole={onPick ? 'button' : 'text'}
          accessibilityLabel={`${m.label}, ${values[m.key] ?? 'not set'} ${m.unit}`}>
          <Pic name={m.image} style={{ width: 72, height: 72 }} contentFit="contain" />
          <T variant="labelRegular" style={{ marginTop: spacing.xs }}>
            {m.label}
          </T>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
            <T variant="titleMedium" style={underline ? styles.underline : undefined}>
              {m.key === 'shoe' && values.shoe !== undefined ? String(values.shoe) : fmt(values[m.key])}
            </T>
            <T variant="labelRegular">{m.unit}</T>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const TICK = 8; // px per step on the ruler

export function MeasureSheet(props: {
  open: MeasureKey | null;
  initial?: Partial<Measurements>;
  values: Partial<Measurements>;
  onClose: () => void;
  onSave: (k: MeasureKey, v: number) => void;
}) {
  // remount per opening so the sheet starts from the tapped measure
  return props.open ? <MeasureSheetBody key={props.open} {...props} open={props.open} /> : null;
}

function MeasureSheetBody({
  open,
  initial,
  values,
  onClose,
  onSave,
}: {
  open: MeasureKey;
  initial?: Partial<Measurements>;
  values: Partial<Measurements>;
  onClose: () => void;
  onSave: (k: MeasureKey, v: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const [key, setKey] = useState<MeasureKey>(open);
  const [value, setValue] = useState(values[open] ?? 0);
  const [text, setText] = useState(values[open] ? String(values[open]) : '');
  const [rulerW, setRulerW] = useState(0);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const idx = measures.findIndex((m) => m.key === key);
  const m = measures[idx];

  const scrollTo = (v: number, mm = m, animated = true) =>
    scroll.current?.scrollTo({ x: ((v - mm.min) / mm.step) * TICK, animated });

  const load = (k: MeasureKey, saved: Partial<Measurements> = values) => {
    const mm = measures.find((x) => x.key === k)!;
    const v = saved[k] ?? 0;
    setKey(k);
    setValue(v);
    setText(v ? String(v) : '');
    requestAnimationFrame(() => scrollTo(v, mm, false));
  };

  const steps = Math.round((m.max - m.min) / m.step);
  const setFromRuler = (x: number) => {
    const v = Math.max(m.min, Math.min(m.max, Math.round(x / TICK) * m.step + m.min));
    if (v !== value) {
      Haptics.selectionAsync();
      setValue(v);
      setText(String(v));
    }
  };
  const go = (d: number, saved?: Partial<Measurements>) => load(measures[(idx + d + measures.length) % measures.length].key, saved);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={onClose} accessibilityLabel="Dismiss" />
      <Animated.View entering={SlideInDown.duration(260)} style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.grabber} />
        <View style={styles.nav}>
          <IconButton name="chevron-left" size={32} accessibilityLabel="Previous measurement" onPress={() => go(-1)} />
          <View style={{ alignItems: 'center' }}>
            <Pic name={m.image} style={{ width: 72, height: 72 }} contentFit="contain" />
            <T variant="labelRegular" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
              {m.label}
            </T>
          </View>
          <IconButton name="chevron-right" size={32} accessibilityLabel="Next measurement" onPress={() => go(1)} />
        </View>
        <View style={styles.valueRow}>
          <TextInput
            value={text}
            onChangeText={(t) => {
              setText(t);
              const n = Number(t.replace(',', '.'));
              if (!Number.isNaN(n)) {
                setValue(n);
                scrollTo(n);
              }
            }}
            placeholder="00"
            placeholderTextColor={colors.text}
            keyboardType="decimal-pad"
            selectTextOnFocus
            style={[type.titleMedium, styles.valueInput]}
            accessibilityLabel={`${m.label} in ${m.unit}`}
          />
          <T variant="labelRegular">{m.unit}</T>
        </View>
        <View style={styles.marker} />
        <View
          onLayout={(e) => {
            setRulerW(e.nativeEvent.layout.width);
            requestAnimationFrame(() => scrollTo(value, m, false));
          }}
          style={{ height: 28 }}>
          <ScrollView
            ref={scroll}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={TICK}
            decelerationRate="fast"
            scrollEventThrottle={16}
            onScroll={(e) => setFromRuler(e.nativeEvent.contentOffset.x)}
            contentContainerStyle={{ paddingHorizontal: rulerW / 2, alignItems: 'flex-start' }}>
            {Array.from({ length: steps + 1 }, (_, i) => (
              <View key={i} style={{ width: TICK, alignItems: 'center' }}>
                <View style={{ width: 1, height: i % 5 === 0 ? 20 : 12, backgroundColor: colors.textSecondary }} />
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xxl }}>
          <Button
            label="Reset"
            kind="secondary"
            style={{ flex: 1 }}
            onPress={() => {
              const v = initial?.[key] ?? 0;
              setValue(v);
              setText(v ? String(v) : '');
              scrollTo(v);
            }}
          />
          <Button
            label="Save"
            style={{ flex: 1 }}
            onPress={() => {
              onSave(key, value);
              // advance to the next measure, carrying the value just saved
              if (idx < measures.length - 1) go(1, { ...values, [key]: value });
              else onClose();
            }}
          />
        </View>
      </Animated.View>
    </Modal>
  );
}

export function bodyTypeFor(v: Partial<Measurements>) {
  const { chest = 0, waist = 0, hips = 0 } = v;
  if (!chest || !hips) return 'Rectangle';
  if (hips - chest > 8 && waist < hips * 0.75) return 'Pear';
  if (chest - hips > 8) return 'Inverted Triangle';
  if (waist < chest * 0.75 && waist < hips * 0.75) return 'Hourglass';
  if (waist > chest) return 'Apple';
  return 'Rectangle';
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: layout.gutter, rowGap: spacing.xl },
  cell: { width: '33.33%' },
  underline: { textDecorationLine: 'underline' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.sm,
  },
  grabber: { width: 40, height: 3, borderRadius: 2, backgroundColor: colors.textMuted, alignSelf: 'center', marginBottom: spacing.xl },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xl },
  valueInput: { minWidth: 36, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: colors.text, padding: 0, color: colors.text },
  marker: {
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.accent,
  },
});
