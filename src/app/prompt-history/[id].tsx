// "Prompt history2": one thread's refinements as a timeline, newest first.
// Tapping a step reopens results at that point; X drops the step.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AskBar } from '@/components/prompt';
import { Header, IconButton, Pic, Screen, T } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { promptThreads } from '@/data/catalog';

export default function PromptThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const thread = promptThreads.find((t) => t.id === id) ?? promptThreads[0];
  const [steps, setSteps] = useState(thread.steps);

  return (
    <Screen>
      <Header title="Prompt History" />
      <View style={{ marginTop: spacing.lg }}>
        <AskBar placeholder="Search history" onSubmit={(q) => router.push({ pathname: '/results', params: { q } })} />
      </View>
      <ScrollView contentContainerStyle={{ padding: layout.gutter, paddingBottom: spacing.xxl }}>
        <T variant="labelRegular" color={colors.textSecondary} style={{ marginVertical: spacing.lg }}>
          {thread.date}
        </T>
        {steps.map((s, i) => (
          <View key={s.text} style={styles.step}>
            <Pressable
              onPress={() => router.push({ pathname: '/results', params: { q: [...steps].reverse().slice(0, steps.length - i).map((x) => x.text).join('. ') } })}
              accessibilityRole="button"
              accessibilityLabel={s.text}>
              <Pic name={s.image} style={{ width: 52, height: 74 }} />
              <View style={styles.count}>
                <T variant="labelMedium" color={colors.textOnDark}>
                  {s.count}
                </T>
              </View>
            </Pressable>
            <View style={styles.rail}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <T variant="labelRegular" color={colors.text} style={{ flex: 1 }}>
                  {s.text}
                </T>
                <IconButton name="close" size={18} accessibilityLabel={`Remove ${s.text}`} onPress={() => setSteps(steps.filter((x) => x !== s))} />
              </View>
              {s.itemImage && <Pic name={s.itemImage} style={{ width: 40, height: 56, marginTop: spacing.lg }} />}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: spacing.md, minHeight: 104 },
  count: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  rail: { flex: 1, borderLeftWidth: 1, borderLeftColor: colors.textMuted, paddingLeft: spacing.md, paddingBottom: spacing.xl },
});
