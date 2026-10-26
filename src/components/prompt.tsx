// Search inputs from the AI-search frames: the plain "Ask any requirement"
// bar, and the two-line prompt box on results ("Frame 15409").
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon, IconButton, Pic, T } from '@/components/ui';
import { colors, layout, spacing, type } from '@/constants/tokens';
import type { Product } from '@/data/catalog';

export function AskBar({
  placeholder = 'Ask any requirement',
  onSubmit,
  autoFocus,
}: {
  placeholder?: string;
  onSubmit: (q: string) => void;
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState('');
  return (
    <View style={styles.askBar}>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[type.bodyRegular, { flex: 1, color: colors.text }]}
        returnKeyType="search"
        autoFocus={autoFocus}
        onSubmitEditing={() => q.trim() && onSubmit(q.trim())}
      />
      <View style={{ flexDirection: 'row', gap: spacing.lg }}>
        <IconButton name="image-search-outline" accessibilityLabel="Search by image" onPress={() => searchByImage(onSubmit)} />
        <IconButton
          name="microphone-outline"
          accessibilityLabel="Voice search"
          onPress={() => Alert.alert('Voice search', 'Voice input is not wired up in the prototype yet.')}
        />
      </View>
    </View>
  );
}

async function searchByImage(onSubmit: (q: string) => void) {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
  if (!res.canceled) onSubmit('Items like this photo');
}

// The bordered box: current prompt (+ anchor chip) on top, refine input below.
export function PromptBox({
  prompt,
  anchor,
  anchorLabel,
  extra,
  refineAnchor,
  onClear,
  onRefine,
}: {
  prompt: string;
  anchor?: Product;
  anchorLabel?: string;
  extra?: number;
  refineAnchor?: Product;
  onClear: () => void;
  onRefine: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    onRefine(text.trim());
    setText('');
  };
  return (
    <View style={styles.box}>
      <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <T variant="bodyRegular" color={colors.textSecondary} numberOfLines={1} style={{ flexShrink: 1 }}>
            {anchorLabel ?? (prompt || 'Ask any requirement')}
          </T>
          {anchor && <Pic name={anchor.image} style={{ width: 20, height: 28 }} />}
          {!!extra && (
            <View style={styles.more}>
              <T variant="caption">+{extra}</T>
            </View>
          )}
        </View>
        <Pressable onPress={onClear} hitSlop={8} style={styles.clear} accessibilityLabel="Clear search">
          <Icon name="close" size={16} color={colors.text} />
        </Pressable>
      </View>
      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={refineAnchor ? 'Refine search related to this item' : 'Add on to the prompt to refine your search'}
          placeholderTextColor={colors.textMuted}
          style={[type.bodyRegular, { flex: 1, color: colors.text, fontSize: 15 }]}
          returnKeyType="send"
          autoFocus={!!refineAnchor}
          onSubmitEditing={send}
        />
        {refineAnchor && <Pic name={refineAnchor.image} style={{ width: 20, height: 28, marginRight: spacing.md }} />}
        {(text.length > 0 || refineAnchor) && (
          <IconButton name="send" color={colors.accent} accessibilityLabel="Refine" onPress={send} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  askBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.gutter + 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  box: { marginHorizontal: layout.gutter, borderWidth: 2, borderColor: colors.text },
  row: { height: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg },
  clear: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  more: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, backgroundColor: colors.surface },
});
