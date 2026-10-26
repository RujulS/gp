// "prompt history": saved search threads grouped by date.
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AskBar } from '@/components/prompt';
import { ThreadCard } from '@/components/thread-card';
import { Header, Icon, Screen, T } from '@/components/ui';
import { colors, layout, spacing } from '@/constants/tokens';
import { promptThreads } from '@/data/catalog';

export default function PromptHistory() {
  const [filter, setFilter] = useState('');
  const list = promptThreads.filter((t) => (t.title + t.subtitle).toLowerCase().includes(filter.toLowerCase()));
  const dates = [...new Set(list.map((t) => t.date))];

  return (
    <Screen>
      <Header title="Prompt History" />
      <View style={{ marginTop: spacing.lg }}>
        <AskBar placeholder="Search history" onSubmit={setFilter} />
      </View>
      <ScrollView contentContainerStyle={{ padding: layout.gutter, paddingBottom: spacing.xxl }}>
        {dates.map((d) => (
          <View key={d} style={{ marginTop: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
              <Icon name="history" size={22} />
              <T variant="labelRegular" color={colors.textSecondary}>
                {d}
              </T>
            </View>
            <View style={{ gap: layout.gutter }}>
              {list
                .filter((t) => t.date === d)
                .map((t) => (
                  <ThreadCard
                    key={t.id}
                    thread={t}
                    chevron
                    onPress={() => router.push({ pathname: '/prompt-history/[id]', params: { id: t.id } })}
                  />
                ))}
            </View>
          </View>
        ))}
        {list.length === 0 && (
          <T variant="labelRegular" color={colors.textMuted} style={{ textAlign: 'center', marginTop: spacing.xxl }}>
            No searches match “{filter}”.
          </T>
        )}
      </ScrollView>
    </Screen>
  );
}
