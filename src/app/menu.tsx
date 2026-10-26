// "Menu Page": Women / Man / Kids, expandable category rows, contact + social.
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon, IconButton, Screen, T, type IconName } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { menuItems, menuSections } from '@/data/catalog';

const SUB: Record<string, string[]> = {
  New: ['This week', 'Trending'],
  Apparel: ['Dresses', 'Jackets', 'Cardigans', 'Trousers'],
  Bag: ['Totes', 'Shoulder bags'],
  Shoes: ['Boots', 'Heels', 'Flats'],
  Beauty: ['Skin', 'Fragrance'],
  Accessories: ['Belts', 'Jewellery'],
};

const SOCIAL: { icon: IconName; url: string; label: string }[] = [
  { icon: 'twitter', url: 'https://twitter.com', label: 'Twitter' },
  { icon: 'instagram', url: 'https://instagram.com', label: 'Instagram' },
  { icon: 'youtube', url: 'https://youtube.com', label: 'YouTube' },
];

export default function Menu() {
  const [section, setSection] = useState<(typeof menuSections)[number]>('Women');
  const [open, setOpen] = useState<string | null>(null);

  const go = (q: string) => {
    router.back();
    router.push({ pathname: '/results', params: { q: `${section} ${q}` } });
  };

  return (
    <Screen>
      <View style={{ height: 44, marginTop: 8, justifyContent: 'center', paddingHorizontal: layout.gutter }}>
        <IconButton name="close" size={22} accessibilityLabel="Close menu" onPress={() => router.back()} />
      </View>
      <View style={styles.sections}>
        {menuSections.map((s) => (
          <Pressable key={s} onPress={() => setSection(s)} style={{ flex: 1, alignItems: s === 'Women' ? 'flex-start' : s === 'Kids' ? 'flex-end' : 'center' }} accessibilityRole="tab" accessibilityState={{ selected: s === section }}>
            <T variant="labelRegular" color={s === section ? colors.label : colors.textMuted} style={{ letterSpacing: 3, paddingVertical: spacing.sm }}>
              {s.toUpperCase()}
            </T>
            <View style={{ height: 1, width: 64, backgroundColor: s === section ? colors.accent : 'transparent' }} />
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxl }}>
        {menuItems.map((m) => (
          <View key={m}>
            <Pressable style={styles.row} onPress={() => setOpen(open === m ? null : m)} accessibilityRole="button" accessibilityState={{ expanded: open === m }}>
              <T variant="bodyRegular" color={colors.textSecondary}>
                {m}
              </T>
              <Icon name={open === m ? 'chevron-up' : 'chevron-down'} color={colors.textMuted} />
            </Pressable>
            {open === m &&
              SUB[m].map((s) => (
                <Pressable key={s} onPress={() => go(s)} style={{ paddingVertical: spacing.sm, paddingLeft: spacing.lg }}>
                  <T variant="labelRegular" color={colors.textMuted}>
                    {s}
                  </T>
                </Pressable>
              ))}
          </View>
        ))}
        <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
          <Pressable style={styles.contact} onPress={() => Linking.openURL('tel:7867138616')}>
            <Icon name="phone-outline" color={colors.label} />
            <T variant="bodyRegular" color={colors.label} style={{ letterSpacing: 1 }}>
              (786) 713-8616
            </T>
          </Pressable>
          <Pressable style={styles.contact} onPress={() => Linking.openURL('https://maps.google.com/?q=store')}>
            <Icon name="map-marker-outline" color={colors.label} />
            <T variant="bodyRegular" color={colors.label}>
              Store locator
            </T>
          </Pressable>
        </View>
        <View style={{ width: 130, height: 1, backgroundColor: colors.label, alignSelf: 'center', marginTop: spacing.xxl }} />
        <View style={{ flexDirection: 'row', gap: 36, alignSelf: 'center', marginTop: spacing.xl }}>
          {SOCIAL.map((s) => (
            <IconButton key={s.label} name={s.icon} color={colors.textSecondary} accessibilityLabel={s.label} onPress={() => Linking.openURL(s.url)} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sections: {
    flexDirection: 'row',
    marginHorizontal: layout.gutter,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(136,134,131,0.2)',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  contact: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingLeft: spacing.lg, paddingVertical: spacing.sm },
});
