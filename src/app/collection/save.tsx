// "Save item to" sheet ("add to collection" frame): create new, top, all.
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Pic, T } from '@/components/ui';
import { colors, layout, radius, spacing } from '@/constants/tokens';
import { productById } from '@/data/catalog';
import { useApp } from '@/store/app-store';

export default function SaveToCollection() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { collections, addToCollection, removeFromCollection, showToast } = useApp();
  const insets = useSafeAreaInsets();
  const mine = collections.filter((c) => c.owner !== 'sharedWithMe');

  const save = (id: string, name: string) => {
    addToCollection(id, productId);
    router.back();
    showToast({ message: `Added to ${name}`, action: { label: 'Undo', onPress: () => removeFromCollection(id, productId) } });
  };

  const row = (section: string, id: string, name: string, firstProduct?: string) => {
    const p = firstProduct ? productById(firstProduct) : undefined;
    return (
      <Pressable key={`${section}-${id}`} style={styles.row} onPress={() => save(id, name)} accessibilityRole="button">
        {p ? <Pic name={p.image} style={styles.thumb} contentFit="contain" /> : <View style={styles.thumb} />}
        <T variant="labelRegular">{name}</T>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} accessibilityLabel="Dismiss" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.grabber} />
        <T variant="subtitle" style={{ marginBottom: spacing.lg }}>
          Save item to
        </T>
        <ScrollView style={{ maxHeight: 420 }}>
          <Pressable
            style={styles.row}
            onPress={() => {
              router.back();
              router.push({ pathname: '/collection/new', params: { ids: productId } });
            }}>
            <View style={[styles.thumb, { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }]}>
              <Icon name="plus" size={20} />
            </View>
            <T variant="labelRegular">Create New Collection</T>
          </Pressable>
          <T variant="labelMedium" style={styles.section}>
            Top Collections
          </T>
          {mine.slice(0, 2).map((c) => row('top', c.id, c.name, c.productIds[0]))}
          <T variant="labelMedium" style={styles.section}>
            All Collections
          </T>
          {mine.map((c) => row('all', c.id, c.name, c.productIds[0]))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.sm,
  },
  grabber: { width: 40, height: 3, borderRadius: 2, backgroundColor: colors.textMuted, alignSelf: 'center', marginBottom: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.sm },
  thumb: { width: 32, height: 32 },
  section: { marginTop: spacing.lg, marginBottom: spacing.xs },
});
