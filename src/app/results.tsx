// AI search results ("result1-4", "option *", "maximise"): prompt box with
// refinements, result count + filter, product grid with the long-press menu.
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProductGrid, type CardAction } from '@/components/product-grid';
import { PromptBox } from '@/components/prompt';
import { CartButton, Header, Icon, Screen, Sheet, T, ToastHost } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { productById, promptThreads, type Product } from '@/data/catalog';
import { resultCount, runSearch, titleFor, type SearchContext } from '@/lib/search';
import { useApp } from '@/store/app-store';

const SORTS = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Top Rated'] as const;

export default function Results() {
  const params = useLocalSearchParams<{ q?: string; anchor?: string; mode?: CardAction; thread?: string }>();
  const app = useApp();

  const initial = useMemo<SearchContext>(() => {
    const thread = promptThreads.find((t) => t.id === params.thread);
    if (thread) return { prompt: thread.title, refinements: thread.steps.slice(0, -1).map((s) => s.text) };
    if (params.anchor && (params.mode === 'similar' || params.mode === 'theme'))
      return { prompt: '', refinements: [], anchor: { productId: params.anchor, mode: params.mode } };
    return { prompt: params.q ?? '', refinements: [] };
  }, [params.thread, params.anchor, params.mode, params.q]);

  const [ctx, setCtx] = useState<SearchContext>(initial);
  const [refineAnchor, setRefineAnchor] = useState<Product | undefined>(
    params.mode === 'refine' && params.anchor ? productById(params.anchor) : undefined,
  );
  const [sort, setSort] = useState<(typeof SORTS)[number]>('Relevance');
  const [sortOpen, setSortOpen] = useState(false);

  const results = useMemo(() => {
    const list = runSearch(ctx);
    if (sort === 'Price: Low to High') return [...list].sort((a, b) => a.price - b.price);
    if (sort === 'Price: High to Low') return [...list].sort((a, b) => b.price - a.price);
    if (sort === 'Top Rated') return [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [ctx, sort]);

  const anchor = ctx.anchor ? productById(ctx.anchor.productId) : undefined;
  const lastRefinement = ctx.refinements[ctx.refinements.length - 1];
  const label =
    ctx.anchor?.mode === 'similar'
      ? 'More items like this'
      : ctx.anchor?.mode === 'theme'
        ? 'Similar themed items to this'
        : (lastRefinement ?? ctx.prompt);
  const extra = ctx.refinements.length + (ctx.anchor && ctx.prompt ? 1 : 0);

  const onAction = (action: CardAction, p: Product) => {
    switch (action) {
      case 'cart':
        app.addToCart(p.id);
        app.showToast({ message: 'Added to Cart', action: { label: 'View Cart', onPress: () => router.push('/checkout') } });
        break;
      case 'wish':
        if (!app.favourites.includes(p.id)) app.toggleFavourite(p.id);
        app.showToast({
          message: 'Added to Favourites',
          action: { label: 'Add to Collection', onPress: () => router.push({ pathname: '/collection/save', params: { productId: p.id } }) },
        });
        break;
      case 'similar':
      case 'theme':
        setRefineAnchor(undefined);
        setCtx((c) => ({ ...c, anchor: { productId: p.id, mode: action } }));
        break;
      case 'refine':
        setRefineAnchor(p);
        break;
    }
  };

  return (
    <Screen>
      <Header leading="back" title={titleFor(ctx, results[0])} trailing={<CartButton />} />
      <View style={{ marginTop: spacing.lg }}>
        <PromptBox
          key={refineAnchor?.id ?? 'plain'}
          prompt={ctx.prompt}
          anchor={ctx.anchor?.mode === 'refine' ? undefined : anchor}
          anchorLabel={label || undefined}
          extra={extra}
          refineAnchor={refineAnchor}
          onClear={() => router.back()}
          onRefine={(text) => {
            setCtx((c) => ({
              ...c,
              refinements: [...c.refinements, text],
              anchor: refineAnchor ? { productId: refineAnchor.id, mode: 'refine' } : c.anchor,
            }));
            setRefineAnchor(undefined);
          }}
        />
      </View>
      <View style={styles.countRow}>
        <T variant="captionMedium" color={colors.textSecondary}>
          {resultCount(ctx, results.length)} RESULTS
        </T>
        <Pressable style={styles.filter} onPress={() => setSortOpen(true)} accessibilityRole="button">
          <T variant="captionMedium" color={colors.textSecondary}>
            FILTER & SORT
          </T>
          <View style={styles.filterIcon}>
            <Icon name="sort-variant" size={18} />
          </View>
        </Pressable>
      </View>
      <ProductGrid key={JSON.stringify(ctx) + sort} products={results} onAction={onAction} footerSpace={60} />
      <ToastHost bottom={spacing.xl} />
      <Sheet visible={sortOpen} onClose={() => setSortOpen(false)} title="Sort by">
        {SORTS.map((s) => (
          <Pressable
            key={s}
            onPress={() => {
              setSort(s);
              setSortOpen(false);
            }}
            style={styles.sortRow}
            accessibilityRole="radio"
            accessibilityState={{ checked: s === sort }}>
            <T variant="bodyRegular">{s}</T>
            {s === sort && <Icon name="check" color={colors.accent} />}
          </Pressable>
        ))}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.gutter * 2,
    paddingVertical: spacing.lg,
  },
  filter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  filterIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
});
