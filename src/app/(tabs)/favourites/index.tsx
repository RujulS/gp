// "Wishlist page" (All favourites) and "all collections" (Collections),
// including the "Items Selected" multi-select mode for building a collection.
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { CollectionTile, NewCollectionTile } from '@/components/collection-tile';
import { ProductCard, useCardWidth } from '@/components/product-grid';
import { Button, CartButton, Chip, Header, IconButton, Screen, TabStrip, T, ToastHost } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { productById, type Owner } from '@/data/catalog';
import { useApp } from '@/store/app-store';

const FILTERS: { label: string; owner?: Owner }[] = [
  { label: 'All' },
  { label: 'Leena’s', owner: 'mine' },
  { label: 'Shared by you', owner: 'sharedByMe' },
  { label: 'Shared with you', owner: 'sharedWithMe' },
];

export default function Favourites() {
  const app = useApp();
  const cardW = useCardWidth();
  const [tab, setTab] = useState<'All favourites' | 'Collections'>('All favourites');
  const [filter, setFilter] = useState(0);
  const [selected, setSelected] = useState<string[] | null>(null);

  const favs = app.favourites.map((id) => productById(id)!).filter(Boolean);
  const owner = FILTERS[filter].owner;
  const firstName = app.activeProfile.name.split(' ')[0];
  const cols = app.collections.filter((c) => !owner || c.owner === owner);
  const selecting = selected !== null;

  const rows = <T,>(items: T[]) => items.reduce<T[][]>((acc, x, i) => (i % 2 ? acc[acc.length - 1].push(x) : acc.push([x]), acc), []);

  return (
    <Screen>
      {selecting ? (
        <Header
          title="Items Selected"
          subtitle={selected.length ? `${selected.length} Items` : undefined}
          trailing={
            <IconButton
              name="plus"
              accessibilityLabel="Create collection from selected"
              onPress={() => {
                if (!selected.length) return;
                router.push({ pathname: '/collection/new', params: { ids: selected.join(',') } });
                setSelected(null);
              }}
            />
          }
        />
      ) : (
        <Header title="Favourites" trailing={<CartButton />} />
      )}
      <View style={{ marginTop: spacing.sm }}>
        <TabStrip tabs={['All favourites', 'Collections'] as const} value={tab} onChange={(t) => (setTab(t), setSelected(null))} />
      </View>

      {tab === 'All favourites' ? (
        <ScrollView contentContainerStyle={{ padding: layout.gutter, gap: spacing.xl, paddingBottom: 100 }}>
          {!selecting && favs.length > 1 && (
            <T variant="caption" color={colors.textMuted} onPress={() => setSelected([])} style={{ alignSelf: 'flex-end' }} accessibilityRole="button">
              Select items
            </T>
          )}
          {rows(favs).map((r) => (
            <View key={r[0].id} style={{ flexDirection: 'row', gap: layout.gridGap }}>
              {r.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  width={cardW}
                  selectable={selecting}
                  selected={selected?.includes(p.id)}
                  onPress={
                    selecting
                      ? () => setSelected((s) => (s!.includes(p.id) ? s!.filter((x) => x !== p.id) : [...s!, p.id]))
                      : undefined
                  }
                  onRemove={() => app.removeFavourite(p.id)}
                  onAddToCart={() => {
                    app.addToCart(p.id);
                    app.showToast({ message: 'Added to Cart' });
                  }}
                />
              ))}
            </View>
          ))}
          {favs.length === 0 && (
            <T variant="bodyRegular" color={colors.textMuted} style={{ textAlign: 'center', marginTop: spacing.xxl }}>
              Long-press any product and tap ♡ to save it here.
            </T>
          )}
        </ScrollView>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: spacing.sm, padding: layout.gutter }}>
            {FILTERS.map((f, i) => (
              <Chip key={f.label} label={f.owner === 'mine' ? `${firstName}’s` : f.label} selected={i === filter} onPress={() => setFilter(i)} />
            ))}
          </ScrollView>
          <ScrollView contentContainerStyle={{ paddingHorizontal: layout.gutter, gap: spacing.xl, paddingBottom: 100 }}>
            {rows<'new' | (typeof cols)[number]>(owner === 'mine' ? ['new', ...cols] : cols).map((r, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: layout.gridGap }}>
                {r.map((c) =>
                  c === 'new' ? (
                    <NewCollectionTile key="new" width={cardW} onPress={() => (setTab('All favourites'), setSelected([]))} />
                  ) : (
                    <CollectionTile key={c.id} c={c} width={cardW} />
                  ),
                )}
              </View>
            ))}
          </ScrollView>
        </>
      )}

      <View style={{ position: 'absolute', left: layout.gutter, right: layout.gutter, bottom: spacing.lg }}>
        <Button label="Trial Room" onPress={() => router.push('/trial')} />
      </View>
      <ToastHost bottom={spacing.lg + 56} />
    </Screen>
  );
}
