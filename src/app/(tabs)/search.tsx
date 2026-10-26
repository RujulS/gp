// "Search page": ask bar, prompt suggestions, continue-search carousel,
// category tiles.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AskBar } from '@/components/prompt';
import { Header, Icon, Pic, Screen, T } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { ThreadCard } from '@/components/thread-card';
import { promptSuggestions, promptThreads, searchCategories } from '@/data/catalog';

const search = (q: string) => router.push({ pathname: '/results', params: { q } });

export default function Search() {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const cardW = width - layout.gutter * 2 - 64;

  return (
    <Screen>
      <Header title="What are you looking for?" />
      <View style={{ marginTop: spacing.lg }}>
        <AskBar onSubmit={search} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <T variant="body" style={{ marginTop: spacing.xxl, marginHorizontal: layout.gutter + 8, marginBottom: spacing.lg }}>
          You can ask something like..
        </T>
        <View style={{ gap: spacing.sm, paddingHorizontal: layout.gutter }}>
          {promptSuggestions.map((s) => (
            <Pressable key={s} style={styles.suggestion} onPress={() => search(s)} accessibilityRole="button">
              <T variant="labelRegular" color={colors.textSecondary} style={{ flex: 1 }}>
                “{s}”
              </T>
              <Icon name="chevron-right" size={22} color={colors.text} />
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <T variant="body">Continue search for</T>
          <Pressable style={styles.historyLink} onPress={() => router.push('/prompt-history')} hitSlop={8}>
            <Icon name="history" size={22} color={colors.accent} />
            <T variant="labelRegular" color={colors.accent} style={{ textDecorationLine: 'underline' }}>
              Prompt history
            </T>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          snapToInterval={cardW + layout.gutter}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: layout.gutter + 4, gap: layout.gutter }}
          onScroll={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / (cardW + layout.gutter)))}
          scrollEventThrottle={32}>
          {promptThreads.slice(1).concat(promptThreads[0]).map((t) => (
            <ThreadCard key={t.id} thread={t} width={cardW} />
          ))}
        </ScrollView>
        <View style={styles.pager}>
          {promptThreads.slice(0, 4).map((t, i) => (
            <View key={t.id} style={[styles.pagerBar, i === Math.min(page, 3) && { backgroundColor: colors.accent }]} />
          ))}
        </View>

        <T variant="body" style={{ marginHorizontal: layout.gutter, marginTop: spacing.lg, marginBottom: spacing.lg }}>
          Categories you might be interested in
        </T>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: layout.gutter, gap: layout.gutter }}>
          {searchCategories.map((c) => (
            <Pressable key={c.label} onPress={() => search(c.query)} style={{ width: 97, alignItems: 'center', gap: spacing.lg }}>
              <Pic name={c.image} style={{ width: 97, height: 80 }} />
              <T variant="body" color={colors.textSecondary}>
                {c.label}
              </T>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  suggestion: {
    height: 56,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: layout.gutter,
    paddingRight: spacing.lg,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: layout.gutter,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  historyLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pager: { flexDirection: 'row', gap: 4, alignSelf: 'center', marginTop: spacing.md },
  pagerBar: { width: 24, height: 4, backgroundColor: colors.border },
});
