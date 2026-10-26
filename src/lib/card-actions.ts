// What the long-press menu does outside the results screen (Home, Search):
// cart/wishlist act in place, the three search actions open results.
import { router } from 'expo-router';

import type { CardAction } from '@/components/product-grid';
import type { Product } from '@/data/catalog';
import { useApp } from '@/store/app-store';

export function useCardActions() {
  const app = useApp();
  return (action: CardAction, p: Product) => {
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
      default:
        router.push({ pathname: '/results', params: { anchor: p.id, mode: action } });
    }
  };
}
