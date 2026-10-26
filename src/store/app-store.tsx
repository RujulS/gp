// In-memory app state for the prototype. No persistence or backend yet:
// everything resets on reload, seeded from data/catalog.ts.
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  seedCollections,
  seedFavourites,
  seedProfiles,
  type Collection,
  type Measurements,
  type Profile,
} from '@/data/catalog';

export type CartLine = { productId: string; qty: number };

export type Toast = { message: string; action?: { label: string; onPress: () => void } };

type State = {
  cart: CartLine[];
  favourites: string[];
  collections: Collection[];
  profiles: Profile[];
  activeProfileId: string;
  draft: Partial<Profile>; // profile being created or re-measured
  trialPhotoUri?: string;
  toast?: Toast;
};

type Actions = {
  addToCart: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  toggleFavourite: (productId: string) => void;
  removeFavourite: (productId: string) => void;
  addToCollection: (collectionId: string, productId: string) => void;
  createCollection: (name: string, productIds: string[]) => string;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  removeFromCollection: (id: string, productId: string) => void;
  clearCollection: (id: string) => void;
  setActiveProfile: (id: string) => void;
  updateDraft: (patch: Partial<Profile>) => void;
  commitDraft: () => Profile;
  updateProfile: (id: string, patch: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  setTrialPhoto: (uri?: string) => void;
  showToast: (toast: Toast) => void;
  hideToast: () => void;
};

const Ctx = createContext<(State & Actions & { activeProfile: Profile }) | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({
    cart: [],
    favourites: seedFavourites,
    collections: seedCollections,
    profiles: seedProfiles,
    activeProfileId: seedProfiles[0].id,
    draft: {},
  });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const patch = useCallback((fn: (s: State) => Partial<State>) => setState((s) => ({ ...s, ...fn(s) })), []);

  const hideToast = useCallback(() => patch(() => ({ toast: undefined })), [patch]);

  const showToast = useCallback(
    (toast: Toast) => {
      clearTimeout(toastTimer.current);
      patch(() => ({ toast }));
      toastTimer.current = setTimeout(hideToast, 4000);
    },
    [patch, hideToast],
  );

  const actions = useMemo<Actions>(
    () => ({
      addToCart: (productId) =>
        patch((s) => {
          const line = s.cart.find((l) => l.productId === productId);
          return {
            cart: line
              ? s.cart.map((l) => (l.productId === productId ? { ...l, qty: l.qty + 1 } : l))
              : [...s.cart, { productId, qty: 1 }],
          };
        }),
      setQty: (productId, qty) =>
        patch((s) => ({
          cart:
            qty <= 0
              ? s.cart.filter((l) => l.productId !== productId)
              : s.cart.map((l) => (l.productId === productId ? { ...l, qty } : l)),
        })),
      clearCart: () => patch(() => ({ cart: [] })),
      toggleFavourite: (productId) =>
        patch((s) => ({
          favourites: s.favourites.includes(productId)
            ? s.favourites.filter((id) => id !== productId)
            : [productId, ...s.favourites],
        })),
      removeFavourite: (productId) => patch((s) => ({ favourites: s.favourites.filter((id) => id !== productId) })),
      addToCollection: (collectionId, productId) =>
        patch((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId && !c.productIds.includes(productId)
              ? { ...c, productIds: [productId, ...c.productIds] }
              : c,
          ),
          favourites: s.favourites.includes(productId) ? s.favourites : [productId, ...s.favourites],
        })),
      createCollection: (name, productIds) => {
        const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
        patch((s) => ({
          collections: [{ id, name, owner: 'mine', productIds, sharedWith: [] }, ...s.collections],
        }));
        return id;
      },
      renameCollection: (id, name) =>
        patch((s) => ({ collections: s.collections.map((c) => (c.id === id ? { ...c, name } : c)) })),
      deleteCollection: (id) => patch((s) => ({ collections: s.collections.filter((c) => c.id !== id) })),
      removeFromCollection: (id, productId) =>
        patch((s) => ({
          collections: s.collections.map((c) =>
            c.id === id ? { ...c, productIds: c.productIds.filter((p) => p !== productId) } : c,
          ),
        })),
      clearCollection: (id) =>
        patch((s) => ({ collections: s.collections.map((c) => (c.id === id ? { ...c, productIds: [] } : c)) })),
      setActiveProfile: (id) => patch(() => ({ activeProfileId: id })),
      updateDraft: (p) => patch((s) => ({ draft: { ...s.draft, ...p } })),
      commitDraft: () => {
        let saved: Profile | undefined;
        setState((s) => {
          const d = s.draft;
          if (d.id && s.profiles.some((p) => p.id === d.id)) {
            saved = { ...s.profiles.find((p) => p.id === d.id)!, ...d } as Profile;
            return { ...s, profiles: s.profiles.map((p) => (p.id === d.id ? saved! : p)), draft: {} };
          }
          saved = { fit: [], ...d, id: d.id ?? `p-${Date.now().toString(36)}`, name: d.name ?? 'New profile' } as Profile;
          return { ...s, profiles: [...s.profiles, saved], activeProfileId: saved.id, draft: {} };
        });
        return saved!;
      },
      updateProfile: (id, p) =>
        patch((s) => ({ profiles: s.profiles.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      deleteProfile: (id) =>
        patch((s) => {
          const profiles = s.profiles.filter((p) => p.id !== id);
          return {
            profiles,
            activeProfileId: s.activeProfileId === id ? (profiles[0]?.id ?? '') : s.activeProfileId,
          };
        }),
      setTrialPhoto: (uri) => patch(() => ({ trialPhotoUri: uri })),
      showToast,
      hideToast,
    }),
    [patch, showToast, hideToast],
  );

  const activeProfile =
    state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0] ?? { id: '', name: 'Guest', fit: [] };

  return <Ctx.Provider value={{ ...state, ...actions, activeProfile }}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppStoreProvider');
  return v;
}

export const cartCount = (cart: CartLine[]) => cart.reduce((n, l) => n + l.qty, 0);

export type { Measurements };
