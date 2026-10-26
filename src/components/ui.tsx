// Shared primitives built from the Figma tokens. Screens compose these rather
// than restyling text, buttons and headers one by one.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, type ImageProps } from 'expo-image';
import { router } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, radius, shadow, spacing, type } from '@/constants/tokens';
import { img, type ImageKey } from '@/data/images';
import { cartCount, useApp } from '@/store/app-store';

// ---------- Text ----------

type Variant = keyof typeof type;

export function T({
  variant = 'labelRegular',
  color = colors.text,
  style,
  ...rest
}: TextProps & { variant?: Variant; color?: string; style?: StyleProp<TextStyle> }) {
  return <Text {...rest} style={[type[variant], { color }, style]} />;
}

// ---------- Icons ----------

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function Icon({ name, size = layout.iconSize, color = colors.textSecondary }: { name: IconName; size?: number; color?: string }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

export function IconButton({
  name,
  onPress,
  size = layout.iconSize,
  color,
  badge,
  accessibilityLabel,
}: {
  name: IconName;
  onPress?: () => void;
  size?: number;
  color?: string;
  badge?: number;
  accessibilityLabel: string;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
      <Icon name={name} size={size} color={color} />
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function Pic({ name, style, ...rest }: Omit<ImageProps, 'source'> & { name: ImageKey }) {
  return <Image source={img[name]} style={style} contentFit="cover" transition={150} {...rest} />;
}

// ---------- Screen + header ----------

export function Screen({
  children,
  style,
  edges = ['top'],
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom')[];
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        { paddingTop: edges.includes('top') ? insets.top : 0, paddingBottom: edges.includes('bottom') ? insets.bottom : 0 },
        style,
      ]}>
      {children}
    </View>
  );
}

export function CartButton() {
  const { cart } = useApp();
  const n = cartCount(cart);
  return (
    <IconButton name="shopping-outline" badge={n} accessibilityLabel={`Cart, ${n} items`} onPress={() => router.push('/checkout')} />
  );
}

// 44pt header: leading icon at x16, title at x64 (Figma "Frame 15604" / "Frame 15824").
export function Header({
  title,
  leading = 'back',
  trailing,
  subtitle,
}: {
  title?: string;
  leading?: 'back' | 'menu' | 'none';
  trailing?: ReactNode;
  subtitle?: string;
}) {
  return (
    <View style={styles.header}>
      {leading === 'back' && <IconButton name="chevron-left" size={28} accessibilityLabel="Back" onPress={() => router.back()} />}
      {leading === 'menu' && <IconButton name="menu" accessibilityLabel="Menu" onPress={() => router.push('/menu')} />}
      <View style={{ flex: 1, marginLeft: leading === 'none' ? 0 : spacing.xl - 4 }}>
        {title ? (
          <T variant="title" numberOfLines={1}>
            {title}
          </T>
        ) : null}
        {subtitle ? <T variant="caption" color={colors.textMuted}>{subtitle}</T> : null}
      </View>
      <View style={styles.headerTrailing}>{trailing}</View>
    </View>
  );
}

// Flow screens (profile, measurement, trial room) use a title + close "X" with
// an optional subtitle under it.
export function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose?: () => void }) {
  return (
    <View style={styles.modalHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <T variant="subtitle" style={{ flex: 1 }}>
          {title}
        </T>
        <IconButton name="close" size={20} accessibilityLabel="Close" onPress={onClose ?? (() => router.back())} />
      </View>
      {subtitle ? (
        <T variant="labelRegular" color={colors.textMuted} style={{ marginTop: spacing.xs, lineHeight: 20 }}>
          {subtitle}
        </T>
      ) : null}
    </View>
  );
}

// ---------- Buttons ----------

export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled,
  style,
  icon,
}: {
  label: string;
  onPress?: () => void;
  kind?: 'primary' | 'secondary' | 'accent' | 'accentOutline' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: IconName;
}) {
  const k = buttonKinds[kind];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        k.box,
        disabled && (kind === 'primary' ? { backgroundColor: '#A3A3A3' } : { opacity: 0.4 }),
        pressed && { opacity: 0.8 },
        style,
      ]}>
      {icon ? <Icon name={icon} size={20} color={k.text} /> : null}
      <T variant="button" color={k.text}>
        {label}
      </T>
    </Pressable>
  );
}

const buttonKinds = {
  primary: { box: { backgroundColor: colors.primary }, text: colors.textOnDark },
  secondary: { box: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderStrong }, text: colors.text },
  accent: { box: { backgroundColor: colors.accent }, text: colors.textOnDark },
  accentOutline: { box: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.accent }, text: colors.accent },
  ghost: { box: { backgroundColor: 'transparent' }, text: colors.textMuted },
} as const;

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && { borderColor: colors.text, borderWidth: 1.5 }]}>
      <T variant="captionMedium" color={selected ? colors.text : colors.textMuted}>
        {label}
      </T>
    </Pressable>
  );
}

// Square outline option (shopping preference fit)
export function Option({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={[styles.option, selected && { backgroundColor: colors.primary }]}>
      <T variant="labelRegular" color={selected ? colors.textOnDark : colors.text}>
        {label}
      </T>
    </Pressable>
  );
}

// Underlined tabs ("All favourites / Collections", "Women / Man / Kids")
export function TabStrip<K extends string>({
  tabs,
  value,
  onChange,
  spread,
}: {
  tabs: readonly K[];
  value: K;
  onChange: (k: K) => void;
  spread?: boolean;
}) {
  return (
    <View style={[styles.tabStrip, spread && { justifyContent: 'space-between' }]}>
      {tabs.map((t) => {
        const on = t === value;
        return (
          <Pressable key={t} onPress={() => onChange(t)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={styles.tab}>
            <T variant="body" color={on ? colors.text : colors.textMuted} style={!on && { fontFamily: type.bodyRegular.fontFamily }}>
              {t}
            </T>
            <View style={[styles.tabLine, on && { backgroundColor: colors.text }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------- Commerce bits ----------

export function Price({ value, size = 14, color = colors.textSecondary }: { value: number; size?: number; color?: string }) {
  return (
    <T variant="labelMedium" color={color} style={{ fontSize: size }}>
      ₹{value}
    </T>
  );
}

export function Rating({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      <View style={{ flexDirection: 'row' }} accessibilityLabel="4 out of 5 stars">
        {[0, 1, 2, 3, 4].map((i) => (
          <Icon key={i} name={i < 4 ? 'star' : 'star-outline'} size={10} color={colors.textSecondary} />
        ))}
      </View>
      <T variant="caption" color={colors.textSecondary}>
        {count}
      </T>
    </View>
  );
}

export function Avatars({ list, size = 22 }: { list: ImageKey[]; size?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {list.map((a, i) => (
        <Pic
          key={a}
          name={a}
          style={{ width: size, height: size, borderRadius: size / 2, marginLeft: i ? -size / 3 : 0, borderWidth: 1, borderColor: colors.background }}
        />
      ))}
    </View>
  );
}

// ---------- Overlays ----------

export function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Dismiss" />
      <Animated.View entering={SlideInDown.duration(260)} style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.grabber} />
        {title ? (
          <T variant="subtitle" style={{ marginBottom: spacing.xl }}>
            {title}
          </T>
        ) : null}
        {children}
      </Animated.View>
    </Modal>
  );
}

export function Dialog({
  visible,
  icon,
  title,
  message,
  cancel,
  confirm,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  icon: ReactNode;
  title: string;
  message: string;
  cancel: string;
  confirm: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={[styles.scrim, { justifyContent: 'center', padding: spacing.lg }]}>
        <View style={styles.dialog}>
          {icon}
          <T variant="subtitle" style={{ marginTop: spacing.lg, textAlign: 'center' }}>
            {title}
          </T>
          <T variant="labelRegular" color={colors.textSecondary} style={{ marginTop: spacing.xs, textAlign: 'center', lineHeight: 20 }}>
            {message}
          </T>
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, alignSelf: 'stretch' }}>
            <Button label={cancel} kind="accentOutline" onPress={onCancel} style={{ flex: 1, height: 40 }} />
            <Button label={confirm} kind="accent" onPress={onConfirm} style={{ flex: 1, height: 40 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function ToastHost({ bottom = layout.tabBarHeight + spacing.lg }: { bottom?: number }) {
  const { toast, hideToast } = useApp();
  if (!toast) return null;
  return (
    <View style={[styles.toast, { bottom }]} accessibilityLiveRegion="polite">
      <T variant="labelMedium" color={colors.textOnDark} style={{ flex: 1 }}>
        {toast.message}
      </T>
      {toast.action ? (
        <Pressable
          onPress={() => {
            toast.action!.onPress();
            hideToast();
          }}
          hitSlop={8}>
          <T variant="labelMedium" color={colors.accent}>
            {toast.action.label}
          </T>
        </Pressable>
      ) : null}
    </View>
  );
}

// Round accent badge used by success / body-type / deleted screens
export function ResultBadge({ icon }: { icon: IconName }) {
  return (
    <View style={styles.resultBadge}>
      <Icon name={icon} size={64} color={colors.textOnDark} />
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }, style]} />;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    height: layout.headerHeight,
    marginTop: 8,
    paddingHorizontal: layout.gutter,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTrailing: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  modalHeader: { paddingHorizontal: layout.gutter, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  badge: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.textOnDark, fontSize: 9, fontWeight: '700' },
  button: {
    height: layout.buttonHeight,
    borderRadius: radius.none,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    height: 33,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  tabStrip: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingHorizontal: layout.gutter,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: { paddingTop: spacing.sm, alignItems: 'center' },
  tabLine: { height: 2, alignSelf: 'stretch', marginTop: spacing.sm, backgroundColor: 'transparent' },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.sm,
  },
  grabber: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  dialog: {
    backgroundColor: colors.background,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadow.float,
  },
  toast: {
    position: 'absolute',
    left: layout.gutter,
    right: layout.gutter,
    height: 40,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
