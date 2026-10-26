// "trial menu" → "trial boots" → "trial 1-7": the user's photo on the left,
// a collection drawer on the right; tapping items dresses the photo.
// Real try-on needs an image model; until then the design's pre-rendered
// composites are shown for the outfits they cover, and other picks are listed
// as "wearing" chips over the photo.
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, CartButton, Header, Icon, Pic, Price, Screen, T, ToastHost } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { productById, tryOnRenders, type Product } from '@/data/catalog';
import { useApp } from '@/store/app-store';

const DRAWER = 154;

export default function TrialRoom() {
  const params = useLocalSearchParams<{ collection?: string }>();
  const app = useApp();
  const insets = useSafeAreaInsets();
  const [list, setList] = useState<string | null>(params.collection ?? null);
  const [wearing, setWearing] = useState<string[]>([]);

  const lists = [{ id: 'favourites', name: 'All Favourites', productIds: app.favourites }, ...app.collections];
  const current = lists.find((l) => l.id === list);
  const items = (current?.productIds ?? []).map((id) => productById(id)!).filter(Boolean);

  const toggle = (p: Product) =>
    setWearing((w) => {
      if (w.includes(p.id)) return w.filter((x) => x !== p.id);
      // one item per category: a new dress replaces the old dress
      return [...w.filter((x) => productById(x)?.category !== p.category), p.id];
    });

  const photo = app.trialPhotoUri;
  // the design's composites are of the sample model, so they only apply when
  // the sample photo (not the user's own) is in use
  const ownPhoto = photo && !photo.startsWith('asset:');
  const render = ownPhoto ? (wearing.length ? undefined : null) : tryOnRenders[[...wearing].sort().join('|')];
  const unrendered = wearing.length > 0 && !render;

  return (
    <Screen>
      <Header title="Trial Room" trailing={<CartButton />} />
      <View style={{ flex: 1, flexDirection: 'row', marginTop: spacing.lg }}>
        <View style={{ flex: 1, backgroundColor: colors.surfaceAlt }}>
          {ownPhoto ? (
            <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Pic name={render ?? 'tryOnBase'} style={StyleSheet.absoluteFill} contentPosition="top" />
          )}
          {unrendered && (
            <View style={styles.wearing}>
              <T variant="caption" color={colors.textOnDark}>
                Preview not available yet for:
              </T>
              {wearing.map((id) => (
                <T key={id} variant="captionMedium" color={colors.textOnDark}>
                  • {productById(id)?.name}
                </T>
              ))}
            </View>
          )}
        </View>

        <View style={styles.drawer}>
          {current ? (
            <>
              <Pressable style={styles.drawerHead} onPress={() => setList(null)} accessibilityRole="button" accessibilityLabel="Back to lists">
                <T variant="caption" numberOfLines={1} style={{ flex: 1 }}>
                  {current.name}
                </T>
                <Icon name="chevron-left" size={18} color={colors.text} />
              </Pressable>
              <ScrollView contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xl }}>
                {items.map((p) => {
                  const on = wearing.includes(p.id);
                  return (
                    <Pressable key={p.id} onPress={() => toggle(p)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={`Try on ${p.name}`}>
                      <View style={[styles.item, on && { borderColor: colors.accent }]}>
                        <Pic name={p.image} style={StyleSheet.absoluteFill} />
                        <Pressable
                          style={styles.bag}
                          hitSlop={6}
                          onPress={() => {
                            app.addToCart(p.id);
                            app.showToast({ message: 'Added to Cart' });
                          }}
                          accessibilityLabel={`Add ${p.name} to cart`}>
                          <Icon name="shopping-outline" size={14} />
                        </Pressable>
                      </View>
                      <T variant="caption" numberOfLines={1} style={{ marginTop: 4 }}>
                        {p.name}
                      </T>
                      <Price value={p.price} size={12} />
                    </Pressable>
                  );
                })}
                {items.length === 0 && (
                  <T variant="caption" color={colors.textMuted}>
                    Nothing saved here yet.
                  </T>
                )}
              </ScrollView>
            </>
          ) : (
            <ScrollView>
              {lists.map((l) => (
                <Pressable key={l.id} style={styles.listRow} onPress={() => setList(l.id)} accessibilityRole="button">
                  <T variant="caption" style={{ flex: 1 }}>
                    {l.name}
                  </T>
                  <Icon name="chevron-right" size={18} color={colors.text} />
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          style={styles.save}
          disabled={!wearing.length}
          onPress={() => router.push({ pathname: '/collection/new', params: { ids: wearing.join(',') } })}
          accessibilityRole="button"
          accessibilityLabel="Save outfit as collection">
          <Icon name="heart-plus-outline" color={wearing.length ? colors.text : colors.textMuted} />
        </Pressable>
        <Button
          label="Add  Outfit to Cart"
          disabled={!wearing.length}
          style={{ flex: 1 }}
          onPress={() => {
            wearing.forEach(app.addToCart);
            app.showToast({ message: `${wearing.length} item${wearing.length > 1 ? 's' : ''} added to Cart`, action: { label: 'View Cart', onPress: () => router.push('/checkout') } });
          }}
        />
      </View>
      <ToastHost bottom={insets.bottom + 80} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  drawer: {
    width: DRAWER,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xl,
  },
  drawerHead: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  item: { height: 112, backgroundColor: colors.background, borderWidth: 2, borderColor: 'transparent', overflow: 'hidden' },
  bag: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wearing: { position: 'absolute', left: spacing.sm, right: spacing.sm, bottom: spacing.sm, backgroundColor: colors.scrim, padding: spacing.sm, gap: 2 },
  footer: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: layout.gutter, paddingTop: spacing.lg },
  save: { width: 54, height: 44, borderWidth: 1, borderColor: colors.text, alignItems: 'center', justifyContent: 'center' },
});
