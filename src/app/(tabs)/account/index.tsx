// "Account" / "account2": profile header with points, settings rows.
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/profile-avatar';
import { SwitchProfileSheet } from '@/components/switch-profile';
import { CartButton, Header, Icon, Screen, T } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { accountRows } from '@/data/catalog';
import { useApp } from '@/store/app-store';

export default function Account() {
  const { activeProfile } = useApp();
  const [switching, setSwitching] = useState(false);

  const open = (row: string) => {
    if (row === 'Account Details') router.push('/account/manage');
    else if (row === 'Orders') router.push('/checkout');
    else Alert.alert(row, 'This page isn’t in the designs yet.');
  };

  return (
    <Screen>
      <Header leading="menu" trailing={<CartButton />} />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={{ alignItems: 'center', marginTop: spacing.sm }}>
          <Avatar profile={activeProfile} size={80} ring />
          <Pressable onPress={() => setSwitching(true)} style={styles.nameRow} accessibilityRole="button" accessibilityHint="Switch profile">
            <T variant="titleMedium">{activeProfile.name}</T>
            <Icon name="chevron-down" color={colors.text} />
          </Pressable>
          <T variant="labelRegular" color={colors.accent}>
            100/250 Points
          </T>
          <T variant="labelRegular" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
            You are <T variant="labelRegular" color={colors.accent}>150</T> points away from your next voucher!
          </T>
        </View>
        <View style={{ marginTop: spacing.xl }}>
          {accountRows.map((r) => (
            <Pressable key={r} style={styles.row} onPress={() => open(r)} accessibilityRole="button">
              <T variant="labelRegular" color={colors.textSecondary}>
                {r}
              </T>
              <Icon name="chevron-right" color={colors.text} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <SwitchProfileSheet visible={switching} onClose={() => setSwitching(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md, marginBottom: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: layout.gutter, height: 52 },
});
