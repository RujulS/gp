// "Cart" frame (titled Checkout): address, card, line items with qty, total.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Divider, Header, Icon, Pic, ResultBadge, Screen, T } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { checkoutAddress, productById } from '@/data/catalog';
import { useApp } from '@/store/app-store';

export default function Checkout() {
  const { cart, setQty, clearCart } = useApp();
  const insets = useSafeAreaInsets();
  const [paid, setPaid] = useState(false);
  const lines = cart.map((l) => ({ ...l, product: productById(l.productId)! })).filter((l) => l.product);
  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);

  if (paid) {
    return (
      <Screen edges={['top', 'bottom']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: layout.gutter }}>
          <ResultBadge icon="check" />
          <T variant="headline" style={{ marginTop: spacing.xxl }}>
            Order placed!
          </T>
          <T variant="labelRegular" color={colors.textSecondary} style={{ marginTop: spacing.md }}>
            We’ll let you know when it ships.
          </T>
        </View>
        <Button label="Continue shopping" onPress={() => router.dismissTo('/')} style={{ margin: layout.gutter }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Checkout" />
      {lines.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
          <Icon name="shopping-outline" size={48} color={colors.textMuted} />
          <T variant="bodyRegular" color={colors.textMuted}>
            Your cart is empty
          </T>
          <Button label="Start shopping" kind="secondary" style={{ paddingHorizontal: spacing.xxl }} onPress={() => router.dismissTo('/search')} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingHorizontal: layout.gutter * 2, paddingBottom: 160 }}>
            <View style={{ paddingVertical: spacing.xl, gap: spacing.xs }}>
              <T variant="subtitle">{checkoutAddress.name}</T>
              {checkoutAddress.lines.map((l) => (
                <T key={l} variant="labelRegular" color={colors.textSecondary}>
                  {l}
                </T>
              ))}
            </View>
            <Divider />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.lg }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={[styles.mc, { backgroundColor: '#EB001B' }]} />
                <View style={[styles.mc, { backgroundColor: '#F79E1B', marginLeft: -12, opacity: 0.9 }]} />
              </View>
              <T variant="labelRegular">{checkoutAddress.card}</T>
            </View>
            <Divider style={{ marginBottom: spacing.sm }} />
            {lines.map((l) => (
              <View key={l.productId} style={styles.line}>
                <Pic name={l.product.image} style={{ width: 88, height: 120, backgroundColor: colors.surfaceAlt }} contentFit="contain" />
                <View style={{ flex: 1, gap: spacing.sm }}>
                  <T variant="body">{l.product.name}</T>
                  <View style={styles.qty}>
                    <Pressable onPress={() => setQty(l.productId, l.qty - 1)} hitSlop={8} accessibilityLabel="Decrease quantity">
                      <Icon name="minus" size={18} />
                    </Pressable>
                    <T variant="labelRegular">{l.qty}</T>
                    <Pressable onPress={() => setQty(l.productId, l.qty + 1)} hitSlop={8} accessibilityLabel="Increase quantity">
                      <Icon name="plus" size={18} />
                    </Pressable>
                  </View>
                  <T variant="labelMedium">₹ {l.product.price * l.qty}</T>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.total}>
              <T variant="labelRegular" style={{ letterSpacing: 2 }}>
                TOTAL
              </T>
              <T variant="subtitle">₹{total}</T>
            </View>
            <Button
              label="Pay Now"
              onPress={() => {
                clearCart();
                setPaid(true);
              }}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  mc: { width: 22, height: 22, borderRadius: 11 },
  line: { flexDirection: 'row', gap: layout.gutter * 1.5, paddingVertical: spacing.md },
  qty: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: layout.gutter, backgroundColor: colors.background },
  total: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: layout.gutter, paddingVertical: spacing.xl },
});
