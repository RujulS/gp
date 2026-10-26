// Home ("Home Screen"): hero carousel, New Arrival tabs, product grid, and the
// first-launch personalisation popup ("homescreen overlay").
import { router, useIsFocused } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ProductGrid } from '@/components/product-grid';
import { CartButton, Header, Icon, Pic, Screen, T, ToastHost } from '@/components/ui';
import { colors, layout, radius, spacing, type } from '@/constants/tokens';
import { homeTabs, newArrivals, products, productById, type Product } from '@/data/catalog';
import type { ImageKey } from '@/data/images';
import { useCardActions } from '@/lib/card-actions';
import { useApp } from '@/store/app-store';

const HERO: { image: ImageKey; title: string }[] = [
  { image: 'heroBanner', title: 'Luxury\nFashion' },
  { image: 'creamLongDress', title: 'New\nSeason' },
  { image: 'blueLongDress', title: 'Evening\nEdit' },
];

let popupShown = false; // once per app launch

export default function Home() {
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<(typeof homeTabs)[number]>('All');
  const [hero, setHero] = useState(0);
  const [popup, setPopup] = useState(!popupShown);
  const onAction = useCardActions();
  const focused = useIsFocused();

  const list: Product[] =
    tab === 'All'
      ? newArrivals.map((id) => productById(id)!)
      : tab === 'Dress'
        ? products.filter((p) => p.category === 'dress')
        : tab === 'Bag'
          ? products.filter((p) => p.category === 'bag')
          : tab === 'Apparel'
            ? products.filter((p) => p.category === 'jacket' || p.category === 'cardigan')
            : [];

  const s = width / 430;
  const heroH = Math.round(584 * s);

  return (
    <Screen>
      <Header leading="menu" title="Discover" trailing={<CartButton />} />
      <ProductGrid
        products={list}
        onAction={onAction}
        header={
          <>
            <View style={{ height: heroH, backgroundColor: colors.surfaceAlt }}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => setHero(Math.round(e.nativeEvent.contentOffset.x / width))}>
                {HERO.map((h) => (
                  <View key={h.image} style={{ width, height: heroH, overflow: 'hidden' }}>
                    <Pic
                      name={h.image}
                      style={
                        h.image === 'heroBanner'
                          ? // Figma "image 10": 556×620 at (-77, -17) inside the 430×584 banner
                            { position: 'absolute', left: -77 * s, top: -17 * s, width: 556 * s, height: 620 * s }
                          : StyleSheet.absoluteFill
                      }
                    />
                    <T style={styles.heroTitle}>{h.title.toUpperCase()}</T>
                  </View>
                ))}
              </ScrollView>
              <Pressable style={styles.explore} onPress={() => router.push({ pathname: '/results', params: { q: 'New collection' } })}>
                <T variant="body" color={colors.offWhite} style={{ fontFamily: type.label.fontFamily }}>
                  EXPLORE COLLECTION
                </T>
              </Pressable>
              <View style={styles.dots}>
                {HERO.map((h, i) => (
                  <View key={h.image} style={[styles.dot, i === hero && { backgroundColor: colors.background }]} />
                ))}
              </View>
            </View>

            <View style={{ alignItems: 'center', paddingTop: spacing.xxl, paddingBottom: spacing.xl }}>
              <T variant="subtitle" color="#000" style={{ letterSpacing: 4 }}>
                NEW ARRIVAL
              </T>
              <View style={styles.flourish} />
              <View style={styles.homeTabs}>
                {homeTabs.map((t) => (
                  <Pressable key={t} onPress={() => setTab(t)} hitSlop={8} style={{ alignItems: 'center' }} accessibilityRole="tab" accessibilityState={{ selected: t === tab }}>
                    <T variant="labelRegular" color={t === tab ? colors.text : colors.placeholderText}>
                      {t}
                    </T>
                    <View style={[styles.tabDot, t === tab && { backgroundColor: colors.accent }]} />
                  </Pressable>
                ))}
              </View>
            </View>
            {list.length === 0 && (
              <T variant="labelRegular" color={colors.textMuted} style={{ textAlign: 'center', marginBottom: spacing.xl }}>
                Nothing new in {tab} yet.
              </T>
            )}
          </>
        }
      />
      <ToastHost />
      <PersonalisePopup
        // only while Home is on screen: an RN Modal left up on a background
        // tab would block other modals (Trial Room, profile) from presenting
        visible={popup && focused}
        onClose={() => {
          popupShown = true;
          setPopup(false);
        }}
      />
    </Screen>
  );
}

function PersonalisePopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { width } = useWindowDimensions();
  const { activeProfile, updateDraft } = useApp();
  const cardW = width - layout.gutter * 4;
  const [page, setPage] = useState(0);
  const slides = [
    {
      image: 'overlayMeasure' as const,
      title: 'Let’s Personalise your experience!',
      body: 'Answer a few questions to get a more personalised shopping experience.',
      cta: 'Start',
      go: () => {
        // personalise the current profile rather than creating a new one
        updateDraft({ ...activeProfile });
        router.push('/profile/preferences');
      },
    },
    {
      image: 'overlayTrial' as const,
      title: 'Try on clothes virtually!',
      body: 'Use the AI feature to virtually try on the products in your wishlist.',
      cta: 'Try Trial Room',
      go: () => router.push('/trial'),
    },
  ];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.popupScrim}>
        <View style={styles.popupFrame}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / cardW))}
            style={{ width: cardW, height: 220, flexGrow: 0 }}>
            {slides.map((s) => (
              <View key={s.cta} style={{ width: cardW, height: 220 }}>
                <Pic name={s.image} style={StyleSheet.absoluteFill} />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />
                <View style={styles.popupBody}>
                  <T variant="body" color={colors.textOnDark} style={{ fontFamily: 'Manrope_700Bold', textAlign: 'center' }}>
                    {s.title}
                  </T>
                  <T variant="labelRegular" color={colors.textOnDark} style={{ textAlign: 'center', marginTop: spacing.xs }}>
                    {s.body}
                  </T>
                  <Pressable
                    style={styles.popupCta}
                    onPress={() => {
                      onClose();
                      s.go();
                    }}>
                    <T variant="button" color={colors.textOnDark}>
                      {s.cta}
                    </T>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
          <Pressable onPress={onClose} hitSlop={12} style={styles.popupClose} accessibilityLabel="Close">
            <Icon name="close" size={18} color={colors.textOnDark} />
          </Pressable>
          <View style={[styles.dots, { bottom: 24 }]}>
            {slides.map((s, i) => (
              <View key={s.cta} style={[styles.dot, i === page && { backgroundColor: colors.background }]} />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  heroTitle: {
    position: 'absolute',
    left: 40,
    top: 200, // Figma: "Luxury" at y=320 in a banner starting at y=120
    fontFamily: 'Manrope_700Bold',
    fontSize: 38,
    lineHeight: 40,
    color: '#8093B3',
  },
  explore: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 68,
    height: 40,
    paddingHorizontal: 30,
    borderRadius: 30,
    backgroundColor: 'rgba(31,31,31,0.4)',
    justifyContent: 'center',
  },
  dots: { position: 'absolute', bottom: 40, alignSelf: 'center', flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: colors.background },
  flourish: { width: 125, height: 1, backgroundColor: colors.label, marginTop: 6 },
  homeTabs: { flexDirection: 'row', gap: 28, marginTop: spacing.xl },
  tabDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, backgroundColor: 'transparent' },
  popupScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  popupFrame: { padding: layout.gutter, backgroundColor: colors.background, borderRadius: radius.none },
  popupBody: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  popupCta: {
    marginTop: spacing.lg,
    height: 40,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.accent,
    justifyContent: 'center',
  },
  popupClose: { position: 'absolute', top: 28, right: 28 },
});
