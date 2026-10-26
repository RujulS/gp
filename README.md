# GP

Expo (SDK 58) + expo-router app built from the Figma file **GP → Prototype**
(`MqExVSvDOdm90y3efv7kHh`, node `3239:39471`). One codebase for iOS and Android.

## Run

```bash
npm install
npx expo start          # press i (iOS simulator) or a (Android emulator), or scan with Expo Go
```

Builds for the stores go through EAS: `npx eas-cli@latest build -p ios|android`.

## Where things are

- `src/constants/tokens.ts` — design tokens pulled from Figma (colours, Manrope type scale, spacing, radii, shadows).
- `src/components/ui.tsx` — shared primitives (text, buttons, header, sheets, dialog, toast).
- `src/data/catalog.ts` — mock products, prompts, collections, profiles; every value is from the designs.
- `src/data/images.ts` + `assets/img/` — images exported from Figma, resized to 3× their on-screen size.
- `src/store/app-store.tsx` — in-memory state (cart, favourites, collections, profiles). Resets on reload.
- `src/app/` — one route per screen:
  - `(tabs)/` Home, Search, Favourites (+ collection detail), Account (+ Manage Profile)
  - `results`, `prompt-history/`, `product/[id]`, `menu`, `checkout`
  - `profile/` add profile → preferences → measure → scan / manual → confirm → done
  - `trial/` Trial Room entry → camera → room
  - `collection/` save-to and create

## Not real yet (stand-ins)

- **AI search** is keyword matching over the mock catalog (`src/lib/search.ts`).
- **Body scan** runs the camera flow but returns the design's measurements; no measurement model.
- **Virtual try-on** shows the design's pre-rendered composites for the outfits they cover (Long Blue Dress, + boots, Abstract Tulle Dress); other picks show a "preview not available" note.
- No backend, accounts, persistence, payments or voice search.
