// Product page ("sku" / "sku2").
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShareSheet } from '@/components/share-sheet';
import { Button, CartButton, Header, Icon, IconButton, Pic, Price, Rating, Screen, T, ToastHost } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { productById, products } from '@/data/catalog';
import { useApp } from '@/store/app-store';

const SECTIONS = [
  { title: 'Product details', body: 'Relaxed silhouette with a soft drape. Model is 5′9″ and wears size S.' },
  { title: 'Composition, care and origin.', body: '72% viscose, 28% polyester. Machine wash cold, gentle cycle. Made in India.' },
  { title: 'Shipping, exchanges and returns', body: 'Free delivery in 3–5 days. Free exchanges and returns within 15 days.' },
];

export default function ProductPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = productById(id) ?? products[0];
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const app = useApp();
  const [colour, setColour] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [share, setShare] = useState(false);
  const inCart = app.cart.some((l) => l.productId === product.id);
  const fav = app.favourites.includes(product.id);
  const imgW = width - layout.gutter * 2;

  return (
    <Screen>
      <Header
        trailing={
          <>
            <IconButton name="share-variant-outline" accessibilityLabel="Share" onPress={() => setShare(true)} />
            <CartButton />
          </>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Pic name={product.image} style={{ width: imgW, height: (imgW * 492) / 398, marginTop: spacing.xl, marginHorizontal: layout.gutter }} />
        <View style={styles.info}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <T variant="subtitle" style={{ textTransform: 'capitalize' }}>
              {product.name}
            </T>
            <Price value={product.price} />
            <T variant="caption" color={colors.textMuted}>
              MRP incl. of all taxes
            </T>
          </View>
          <View style={{ alignItems: 'flex-end', gap: spacing.md }}>
            <Rating count={product.rating} />
            {product.colours && (
              <View style={{ flexDirection: 'row', gap: spacing.lg }}>
                {product.colours.map((c, i) => (
                  <Pressable key={c} onPress={() => setColour(i)} accessibilityLabel={`Colour ${i + 1}`} accessibilityState={{ selected: i === colour }}>
                    <View style={{ width: 32, height: 32, backgroundColor: c }} />
                    <View style={{ height: 2, width: 16, alignSelf: 'center', marginTop: 4, backgroundColor: i === colour ? colors.accent : 'transparent' }} />
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={{ paddingHorizontal: layout.gutter, marginTop: spacing.xl }}>
          {SECTIONS.map((s, i) => (
            <Pressable key={s.title} onPress={() => setOpen(open === i ? null : i)} style={[styles.accordion, i > 0 && { marginTop: -1 }]} accessibilityRole="button" accessibilityState={{ expanded: open === i }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T variant="labelRegular" color={colors.textSecondary}>
                  {s.title}
                </T>
                <T variant="labelRegular" color={colors.textSecondary}>
                  {open === i ? '–' : '+'}
                </T>
              </View>
              {open === i && (
                <T variant="labelRegular" color={colors.textMuted} style={{ marginTop: spacing.sm, lineHeight: 20 }}>
                  {s.body}
                </T>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          onPress={() => {
            app.toggleFavourite(product.id);
            if (!fav) app.showToast({ message: 'Added to Favourites', action: { label: 'Add to Collection', onPress: () => router.push({ pathname: '/collection/save', params: { productId: product.id } }) } });
          }}
          style={styles.wish}
          accessibilityRole="button"
          accessibilityLabel={fav ? 'Remove from favourites' : 'Add to favourites'}>
          <Icon name={fav ? 'heart' : 'heart-plus-outline'} color={colors.accent} />
        </Pressable>
        {inCart ? (
          <Button label="Go to Cart" style={{ flex: 1 }} onPress={() => router.push('/checkout')} />
        ) : (
          <Button label="Add to Cart" kind="accent" style={{ flex: 1 }} onPress={() => app.addToCart(product.id)} />
        )}
      </View>
      <ToastHost bottom={insets.bottom + 80} />
      <ShareSheet visible={share} onClose={() => setShare(false)} title="Share Item" text={`${product.name} – ₹${product.price}`} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: { flexDirection: 'row', paddingHorizontal: layout.gutter, marginTop: spacing.xl },
  accordion: { borderWidth: 1, borderColor: colors.text, paddingVertical: 6, paddingHorizontal: layout.gutter },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
  wish: { width: 54, height: 44, borderWidth: 2, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
