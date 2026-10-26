// Collection detail ("Jackets", "leena collection"): shared-with row, share,
// "more" sheet (rename / delete / remove all / add all to cart), visibility.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

import { ProductCard, useCardWidth } from '@/components/product-grid';
import { ShareSheet } from '@/components/share-sheet';
import { Avatars, Button, CartButton, Header, Icon, IconButton, Pic, Sheet, T, ToastHost, Screen, type IconName } from '@/components/ui';
import { colors, layout, spacing, type } from '@/constants/tokens';
import { productById, shareContacts } from '@/data/catalog';
import { useApp } from '@/store/app-store';

export default function CollectionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const cardW = useCardWidth();
  const c = app.collections.find((x) => x.id === id);
  const [more, setMore] = useState(false);
  const [share, setShare] = useState(false);
  const [visibility, setVisibility] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(c?.name ?? '');
  const [visible, setVisible] = useState<Record<string, boolean>>({ Joanne: true, Manu: true, Niya: false });

  if (!c) return null;
  const items = c.productIds.map((p) => productById(p)!).filter(Boolean);
  const mine = c.owner !== 'sharedWithMe';

  const actions: { icon: IconName; label: string; run: () => void }[] = [
    { icon: 'pencil-outline', label: 'Rename List', run: () => setRenaming(true) },
    {
      icon: 'trash-can-outline',
      label: 'Delete List',
      run: () =>
        Alert.alert(`Delete ${c.name}?`, undefined, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => (app.deleteCollection(c.id), router.back()) },
        ]),
    },
    { icon: 'close-circle-outline', label: 'Remove all Items', run: () => app.clearCollection(c.id) },
    {
      icon: 'shopping-outline',
      label: 'Add All Items To Cart',
      run: () => {
        c.productIds.forEach(app.addToCart);
        app.showToast({ message: `${c.productIds.length} items added to Cart` });
      },
    },
  ];

  return (
    <Screen>
      <Header title={c.name} trailing={<CartButton />} />
      <View style={styles.meta}>
        <View style={{ flex: 1 }}>
          {c.sharedWith.length > 0 && (
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }} onPress={() => mine && setVisibility(true)}>
              <Avatars list={c.sharedWith} />
              <T variant="caption" color={colors.textSecondary}>
                {mine ? `Shared with Jo and ${c.sharedWith.length - 1} other` : 'Shared with you'}
              </T>
            </Pressable>
          )}
          <T variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>
            {items.length} Items
          </T>
        </View>
        <IconButton name="share-variant-outline" accessibilityLabel="Share collection" onPress={() => setShare(true)} />
        {mine && <IconButton name="dots-horizontal" accessibilityLabel="More options" onPress={() => setMore(true)} />}
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: layout.gutter, gap: spacing.xl, paddingBottom: 100 }}>
        {items
          .reduce<(typeof items)[]>((acc, x, i) => (i % 2 ? acc[acc.length - 1].push(x) : acc.push([x]), acc), [])
          .map((r) => (
            <View key={r[0].id} style={{ flexDirection: 'row', gap: layout.gridGap }}>
              {r.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  width={cardW}
                  likes={c.likes?.[p.id]}
                  onRemove={mine ? () => app.removeFromCollection(c.id, p.id) : undefined}
                  onAddToCart={() => {
                    app.addToCart(p.id);
                    app.showToast({ message: 'Added to Cart' });
                  }}
                />
              ))}
            </View>
          ))}
        {items.length === 0 && (
          <T variant="bodyRegular" color={colors.textMuted} style={{ textAlign: 'center', marginTop: spacing.xxl }}>
            This collection is empty.
          </T>
        )}
      </ScrollView>
      <View style={{ position: 'absolute', left: layout.gutter, right: layout.gutter, bottom: spacing.lg }}>
        <Button label="Trial Room" onPress={() => router.push({ pathname: '/trial/room', params: { collection: c.id } })} />
      </View>
      <ToastHost bottom={spacing.lg + 56} />

      <Sheet visible={more} onClose={() => setMore(false)}>
        {actions.map((a) => (
          <Pressable key={a.label} style={styles.moreRow} onPress={() => (setMore(false), a.run())} accessibilityRole="button">
            <Icon name={a.icon} size={20} />
            <T variant="labelRegular" color={colors.textSecondary}>
              {a.label}
            </T>
          </Pressable>
        ))}
      </Sheet>

      <Sheet visible={renaming} onClose={() => setRenaming(false)} title="Rename List">
        <TextInput value={name} onChangeText={setName} autoFocus style={[type.labelRegular, styles.input]} accessibilityLabel="Collection name" />
        <Button
          label="Save"
          disabled={!name.trim()}
          style={{ marginTop: spacing.xl }}
          onPress={() => {
            app.renameCollection(c.id, name.trim());
            setRenaming(false);
          }}
        />
      </Sheet>

      <Sheet visible={visibility} onClose={() => setVisibility(false)} title="Manage Visibilty">
        {shareContacts.map((s) => (
          <View key={s.name} style={styles.visRow}>
            <Pic name={s.avatar} style={{ width: 40, height: 40, borderRadius: 20 }} />
            <T variant="labelRegular" style={{ flex: 1 }}>
              {s.name}
            </T>
            <Switch
              value={visible[s.name]}
              onValueChange={(v) => setVisible((cur) => ({ ...cur, [s.name]: v }))}
              trackColor={{ true: colors.accent, false: colors.border }}
              accessibilityLabel={`Share with ${s.name}`}
            />
          </View>
        ))}
      </Sheet>

      <ShareSheet visible={share} onClose={() => setShare(false)} title="Share Collection" text={`My “${c.name}” collection – ${items.length} items`} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, paddingHorizontal: layout.gutter, paddingVertical: spacing.lg },
  moreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.md },
  visRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.sm },
  input: { height: 44, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, color: colors.text },
});
