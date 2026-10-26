// Product card + two-column grid (Figma "Card": 191×423, image 191×280) with
// the long-press action menu from the "option *" frames: hold a card, then
// drag onto an action (or release and tap one).
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View, type LayoutRectangle } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

import { Button, Icon, IconButton, Pic, Price, Rating, T, type IconName } from '@/components/ui';
import { colors, layout, shadow, spacing } from '@/constants/tokens';
import type { Product } from '@/data/catalog';

export type CardAction = 'cart' | 'wish' | 'similar' | 'theme' | 'refine';

const ACTIONS: { key: CardAction; icon: IconName; label: string; dx: number; dy: number }[] = [
  // offsets from the touch point, measured from "option cart1" (Group 14506)
  { key: 'cart', icon: 'shopping-outline', label: 'Add to Cart', dx: -116, dy: -20 },
  { key: 'wish', icon: 'heart-outline', label: 'Add to Wishlist', dx: -56, dy: -76 },
  { key: 'similar', icon: 'note-multiple-outline', label: 'More items like this', dx: 22, dy: -80 },
  { key: 'theme', icon: 'format-paint', label: 'Similar themed items', dx: 86, dy: -32 },
  { key: 'refine', icon: 'chat-question-outline', label: 'Refine search related to this item', dx: 106, dy: 44 },
];
const BUBBLE = 56;
const LONG_PRESS_MS = 350;
const BUBBLE_ACTIVE = 64;

export function useCardWidth() {
  const { width } = useWindowDimensions();
  return (width - layout.gutter * 2 - layout.gridGap) / 2;
}

export function ProductCard({
  product,
  width,
  onPress,
  onExpand,
  onRemove,
  onAddToCart,
  likes,
  selectable,
  selected,
}: {
  product: Product;
  width: number;
  onPress?: () => void;
  onExpand?: () => void;
  onRemove?: () => void;
  onAddToCart?: () => void;
  likes?: number;
  selectable?: boolean;
  selected?: boolean;
}) {
  const imageH = Math.round((width * 280) / 191);
  return (
    <View style={{ width }}>
      <Pressable
        onPress={onPress ?? (() => router.push({ pathname: '/product/[id]', params: { id: product.id } }))}
        // a long press belongs to the action menu; claiming it here stops the
        // release from also counting as a tap
        onLongPress={() => {}}
        delayLongPress={LONG_PRESS_MS}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ₹${product.price}`}>
        <View style={{ width, height: imageH, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
          <Pic name={product.image} style={StyleSheet.absoluteFill} />
          {onExpand && (
            <Pressable onPress={onExpand} hitSlop={8} style={styles.cornerBtn} accessibilityLabel="Expand">
              <Icon name="arrow-expand" size={14} color={colors.textSecondary} />
            </Pressable>
          )}
          {onRemove && !selectable && (
            <Pressable onPress={onRemove} hitSlop={8} style={styles.cornerBtn} accessibilityLabel="Remove">
              <Icon name="close" size={16} color={colors.textSecondary} />
            </Pressable>
          )}
          {selectable && (
            <View style={[styles.selectRing, selected && { backgroundColor: colors.primary }]}>
              {selected && <Icon name="check" size={16} color={colors.textOnDark} />}
            </View>
          )}
          {likes !== undefined && (
            <View style={styles.likes}>
              <Icon name="heart" size={16} color={colors.danger} />
              {likes > 1 ? <T variant="caption">{likes}</T> : null}
            </View>
          )}
        </View>
        <View style={{ marginTop: spacing.lg, gap: spacing.xs }}>
          <T variant="label" color={colors.textSecondary} numberOfLines={1}>
            {product.name}
          </T>
          <Rating count={product.rating} />
          <Price value={product.price} />
        </View>
      </Pressable>
      {onAddToCart && (
        <Button
          label="Add to Cart"
          kind="secondary"
          disabled={selectable}
          onPress={onAddToCart}
          style={{ marginTop: spacing.md, height: 40 }}
        />
      )}
    </View>
  );
}

type Menu = { product: Product; x: number; y: number; card: LayoutRectangle };

// Two-column grid. A card can be "maximised" to full width (Figma "maximise").
export function ProductGrid({
  products,
  header,
  onAction,
  footerSpace = 120,
}: {
  products: Product[];
  header?: ReactNode;
  onAction?: (action: CardAction, product: Product) => void;
  footerSpace?: number;
}) {
  const cardW = useCardWidth();
  const { width } = useWindowDimensions();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [hover, setHover] = useState<CardAction | null>(null);
  const rootOrigin = useRef({ x: 0, y: 0 });
  const rootRef = useRef<ComponentRef<typeof View>>(null);
  // gesture callbacks outlive renders, so they read these instead of state
  const menuRef = useRef<Menu | null>(null);
  const hoverRef = useRef<CardAction | null>(null);

  const close = () => {
    menuRef.current = null;
    hoverRef.current = null;
    setMenu(null);
    setHover(null);
  };

  const rows: (Product | Product[])[] = [];
  let pair: Product[] = [];
  for (const p of products) {
    if (p.id === expanded) {
      if (pair.length) rows.push(pair);
      pair = [];
      rows.push(p);
    } else {
      pair.push(p);
      if (pair.length === 2) {
        rows.push(pair);
        pair = [];
      }
    }
  }
  if (pair.length) rows.push(pair);

  // the design's arc opens to the right; mirror it for right-column cards so it stays on screen
  const bubbleAt = (a: (typeof ACTIONS)[number], m: Menu) => ({
    x: Math.min(Math.max(m.x + (m.x > width / 2 ? -a.dx : a.dx), BUBBLE / 2 + 4), width - BUBBLE / 2 - 4),
    y: m.y + a.dy,
  });

  const hitTest = (x: number, y: number, m: Menu): CardAction | null => {
    for (const a of ACTIONS) {
      const b = bubbleAt(a, m);
      if (Math.hypot(b.x - x, b.y - y) < BUBBLE * 0.7) return a.key;
    }
    return null;
  };

  const fire = (key: CardAction, product: Product) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    close();
    onAction?.(key, product);
  };

  const card = (p: Product, w: number) => (
    <LongPressCard
      key={p.id}
      enabled={!!onAction}
      onOpen={(absX, absY, rect) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const m = { product: p, x: absX - rootOrigin.current.x, y: absY - rootOrigin.current.y, card: { ...rect, x: rect.x - rootOrigin.current.x, y: rect.y - rootOrigin.current.y } };
        menuRef.current = m;
        hoverRef.current = null;
        setHover(null);
        setMenu(m);
      }}
      onMove={(absX, absY) => {
        const m = menuRef.current;
        if (!m) return;
        const h = hitTest(absX - rootOrigin.current.x, absY - rootOrigin.current.y, m);
        if (h !== hoverRef.current) {
          if (h) Haptics.selectionAsync();
          hoverRef.current = h;
          setHover(h);
        }
      }}
      onRelease={() => {
        // released over an action fires it; otherwise the menu stays open for a tap
        if (hoverRef.current && menuRef.current) fire(hoverRef.current, menuRef.current.product);
      }}>
      <ProductCard product={p} width={w} onExpand={() => setExpanded(expanded === p.id ? null : p.id)} />
    </LongPressCard>
  );

  return (
    <View
      ref={rootRef}
      style={{ flex: 1 }}
      onLayout={() => rootRef.current?.measureInWindow((x, y) => (rootOrigin.current = { x, y }))}>
      <ScrollView contentContainerStyle={{ paddingBottom: footerSpace }} scrollEnabled={!menu}>
        {header}
        <View style={{ paddingHorizontal: layout.gutter, gap: spacing.xl }}>
          {rows.map((r) =>
            Array.isArray(r) ? (
              <View key={r[0].id} style={{ flexDirection: 'row', gap: layout.gridGap }}>
                {r.map((p) => card(p, cardW))}
              </View>
            ) : (
              <View key={r.id}>{card(r, width - layout.gutter * 2)}</View>
            ),
          )}
        </View>
      </ScrollView>

      {menu && (
        <View style={StyleSheet.absoluteFill}>
          <Pressable style={[StyleSheet.absoluteFill, styles.veil]} onPress={close} accessibilityLabel="Close actions" />
          <View pointerEvents="none" style={{ position: 'absolute', left: menu.card.x, top: menu.card.y, width: menu.card.width, height: menu.card.height }}>
            <Pic name={menu.product.image} style={StyleSheet.absoluteFill} />
          </View>
          <T
            variant="titleMedium"
            style={{
              position: 'absolute',
              top: Math.max(menu.card.y + 8, 8),
              left: menu.card.x < width / 2 ? menu.card.x + menu.card.width + 16 : layout.gutter,
              width: cardW - 16,
            }}>
            {ACTIONS.find((a) => a.key === hover)?.label ?? ''}
          </T>
          {ACTIONS.map((a) => {
            const b = bubbleAt(a, menu);
            const on = hover === a.key;
            const size = on ? BUBBLE_ACTIVE : BUBBLE;
            return (
              <Pressable
                key={a.key}
                onPress={() => fire(a.key, menu.product)}
                accessibilityRole="button"
                accessibilityLabel={a.label}
                style={[styles.bubble, { width: size, height: size, borderRadius: size / 2, left: b.x - size / 2, top: b.y - size / 2 }, on && { backgroundColor: colors.accent }]}>
                <Icon name={a.icon} size={28} color={on ? colors.textOnDark : colors.textSecondary} />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function LongPressCard({
  children,
  enabled,
  onOpen,
  onMove,
  onRelease,
}: {
  children: ReactNode;
  enabled: boolean;
  onOpen: (x: number, y: number, rect: LayoutRectangle) => void;
  onMove: (x: number, y: number) => void;
  onRelease: () => void;
}) {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const pan = usePanGesture({
    enabled,
    activateAfterLongPress: LONG_PRESS_MS,
    runOnJS: true,
    onActivate: (e) => {
      ref.current?.measureInWindow((x, y, w, h) => {
        // the menu covers the image area only, not the text under it
        onOpen(e.absoluteX, e.absoluteY, { x, y, width: w, height: Math.round((w * 280) / 191) });
      });
    },
    onUpdate: (e) => onMove(e.absoluteX, e.absoluteY),
    onDeactivate: () => onRelease(),
  });
  return (
    <GestureDetector gesture={pan}>
      <View ref={ref} collapsable={false}>
        {children}
      </View>
    </GestureDetector>
  );
}

// Product chips used inside prompt boxes ("More items like this [img] +1")
export function Thumb({ product, size = 28 }: { product: Product; size?: number }) {
  return <Pic name={product.image} style={{ width: size * 0.7, height: size }} />;
}

export function RoundIcon({ name, onPress, label }: { name: IconName; onPress: () => void; label: string }) {
  return (
    <View style={styles.roundIcon}>
      <IconButton name={name} size={16} onPress={onPress} accessibilityLabel={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  cornerBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectRing: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likes: { position: 'absolute', right: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 2 },
  veil: { backgroundColor: 'rgba(254,253,255,0.9)' },
  bubble: {
    position: 'absolute',
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.float,
  },
  roundIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
