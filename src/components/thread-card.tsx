// Saved prompt thread card ("Continue search for", Prompt History).
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Pic, T } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import type { PromptThread } from '@/data/catalog';

export function ThreadCard({
  thread,
  width,
  chevron,
  onPress,
}: {
  thread: PromptThread;
  width?: number;
  chevron?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={[styles.thread, width ? { width } : null]}
      onPress={onPress ?? (() => router.push({ pathname: '/results', params: { thread: thread.id } }))}
      accessibilityRole="button"
      accessibilityLabel={thread.title}>
      <View>
        <Pic name={thread.image} style={{ width: 80, height: 112 }} />
        <View style={styles.threadCount}>
          <T variant="body" color={colors.textOnDark} style={{ fontFamily: 'Manrope_600SemiBold' }}>
            {thread.count}
          </T>
        </View>
      </View>
      <View style={{ flex: 1, gap: spacing.lg }}>
        <T variant="body" style={{ fontFamily: 'Manrope_600SemiBold' }}>
          {thread.title}
        </T>
        <T variant="labelRegular" color={colors.textMuted} style={{ lineHeight: 17 }}>
          {thread.subtitle}
          {'\n'}+ {thread.more} more prompts
        </T>
      </View>
      {chevron && <Icon name="chevron-right" size={22} color={colors.text} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  thread: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    paddingHorizontal: layout.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.gutter,
  },
  threadCount: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
