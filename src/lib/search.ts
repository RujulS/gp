// Stand-in for the AI search backend: keyword matching over the mock catalog.
// The screens only depend on `runSearch`, so a real API can replace this file.
import { products, type Product } from '@/data/catalog';

export type SearchContext = {
  prompt: string;
  refinements: string[];
  // "More items like this" / "Similar themed items to this" pin a product
  anchor?: { productId: string; mode: 'similar' | 'theme' | 'refine' };
};

const has = (text: string, ...words: string[]) => words.some((w) => text.includes(w));

export function runSearch(ctx: SearchContext): Product[] {
  const text = [ctx.prompt, ...ctx.refinements].join(' ').toLowerCase();
  let list = products.slice();

  if (has(text, 'shoe', 'boot', 'heel')) list = list.filter((p) => p.category === 'shoes');
  else if (has(text, 'jacket', 'coat', 'winter', 'trench')) list = list.filter((p) => p.category === 'jacket');
  else if (has(text, 'cardigan', 'knit', 'sweater')) list = list.filter((p) => p.category === 'cardigan');
  else if (has(text, 'bag')) list = list.filter((p) => p.category === 'bag');
  else list = list.filter((p) => p.category === 'dress');

  if (has(text, 'dark', 'black', 'concert', 'rock')) list = list.filter((p) => p.tone === 'dark');
  else if (has(text, 'pastel', 'light', 'pink', 'summer', 'beach')) list = list.filter((p) => p.tone === 'light');
  if (has(text, 'midi')) list = list.filter((p) => /midi|day/i.test(p.name)).concat(list.filter((p) => !/midi|day/i.test(p.name)));

  const anchor = ctx.anchor && products.find((p) => p.id === ctx.anchor!.productId);
  if (anchor) {
    const pool = products.filter((p) => p.category === anchor.category && p.id !== anchor.id);
    if (ctx.anchor!.mode === 'similar') {
      // same tone first: "more like this"
      list = [anchor, ...pool.filter((p) => p.tone === anchor.tone), ...pool.filter((p) => p.tone !== anchor.tone)];
    } else if (ctx.anchor!.mode === 'theme') {
      // themed: same occasion, varied colour
      list = [anchor, ...pool.filter((p) => p.tone !== anchor.tone), ...pool.filter((p) => p.tone === anchor.tone)];
    } else if (has(text, 'dark')) {
      list = pool.filter((p) => p.tone === 'dark');
    }
  }

  return list.length ? list : products.filter((p) => p.category === 'dress');
}

// Shown as "125 RESULTS" etc. — the mock catalog is small, so scale it to feel real.
export const resultCount = (ctx: SearchContext, n: number) =>
  ctx.prompt ? Math.max(n, 125 - ctx.refinements.length * 20) : 500;

export function titleFor(ctx: SearchContext, first?: Product) {
  const c = first?.category ?? 'dress';
  return { dress: 'Dresses', jacket: 'Jackets', cardigan: 'Cardigans', shoes: 'Shoes', bag: 'Bags', trousers: 'Trousers' }[c];
}
