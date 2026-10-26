// Bottom bar (Figma "Component 34"): 64pt, white, 1px #DDDDDD top border,
// four icon-only tabs, active icon in the accent colour.
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui';
import { colors, layout } from '@/constants/tokens';

const TABS: Record<string, { icon: IconName; active: IconName; label: string }> = {
  index: { icon: 'home-outline', active: 'home', label: 'Home' },
  search: { icon: 'magnify-plus-outline', active: 'magnify-plus', label: 'Search' },
  favourites: { icon: 'heart-outline', active: 'heart', label: 'Favourites' },
  account: { icon: 'account-outline', active: 'account', label: 'Account' },
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
      tabBar={({ state, navigateToTab }) => (
        <View style={[styles.bar, { height: layout.tabBarHeight + insets.bottom, paddingBottom: insets.bottom }]}>
          {state.routes.map((route, i) => {
            const t = TABS[route.name];
            if (!t) return null;
            const focused = state.index === i;
            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityLabel={t.label}
                accessibilityState={{ selected: focused }}
                style={styles.item}
                onPress={() => !focused && navigateToTab(route.key)}>
                <Icon name={focused ? t.active : t.icon} color={focused ? colors.accent : colors.textSecondary} />
              </Pressable>
            );
          })}
        </View>
      )}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="favourites" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
