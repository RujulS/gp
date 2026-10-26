// Collection mosaic (one large + two small images) from "all collections".
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatars, Icon, Pic, T } from '@/components/ui';
import { colors, spacing } from '@/constants/tokens';
import { productById, type Collection } from '@/data/catalog';

export function CollectionTile({ c, width }: { c: Collection; width: number }) {
  const [a, b, d] = c.productIds.map((id) => productById(id)).filter(Boolean);
  const big = width * 0.6;
  const small = width - big;
  return (
    <Pressable
      style={{ width }}
      onPress={() => router.push({ pathname: '/favourites/[id]', params: { id: c.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${c.name}, ${c.productIds.length} items`}>
      <View style={[styles.mosaic, { height: width }]}>
        <View style={{ width: big, backgroundColor: colors.surfaceAlt }}>{a && <Pic name={a.image} style={StyleSheet.absoluteFill} />}</View>
        <View style={{ width: small }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: colors.background }}>
            {b && <Pic name={b.image} style={StyleSheet.absoluteFill} />}
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderLeftWidth: 1, borderColor: colors.background }}>
            {d && <Pic name={d.image} style={StyleSheet.absoluteFill} />}
          </View>
        </View>
        {c.owner === 'sharedWithMe' && c.sharedWith[0] && (
          <View style={{ position: 'absolute', top: 6, left: 6 }}>
            <Avatars list={[c.sharedWith[0]]} size={24} />
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.md }}>
        <View style={{ flex: 1 }}>
          <T variant="labelMedium">{c.name}</T>
          <T variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
            {c.productIds.length} Items
          </T>
        </View>
        {c.owner === 'sharedByMe' && <Avatars list={c.sharedWith} />}
      </View>
    </Pressable>
  );
}

export function NewCollectionTile({ width, onPress }: { width: number; onPress: () => void }) {
  return (
    <Pressable style={{ width }} onPress={onPress} accessibilityRole="button">
      <View style={{ height: width, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="plus" size={48} color={colors.text} />
      </View>
      <T variant="labelMedium" style={{ marginTop: spacing.md }}>
        New Collection
      </T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mosaic: { flexDirection: 'row', overflow: 'hidden' },
});
