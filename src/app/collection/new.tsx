// "Create new Collection" ("add new coll", "new coll from trial1"): preview
// strip of the chosen items + name field.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, ModalHeader, Pic, Screen, T } from '@/components/ui';
import { colors, layout, spacing, type } from '@/constants/tokens';
import { productById } from '@/data/catalog';
import { useApp } from '@/store/app-store';

export default function NewCollection() {
  const { ids = '' } = useLocalSearchParams<{ ids?: string }>();
  const productIds = ids.split(',').filter(Boolean);
  const { createCollection, showToast } = useApp();
  const [name, setName] = useState('');

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ModalHeader title="Create new Collection" />
        <View style={{ flex: 1, paddingHorizontal: layout.gutter }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: spacing.lg, paddingHorizontal: spacing.lg }}>
            {productIds.map((id) => {
              const p = productById(id);
              return p ? <Pic key={id} name={p.image} style={{ width: 48, height: 84 }} /> : null;
            })}
          </ScrollView>
          <T variant="caption" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
            Collection Name *
          </T>
          <TextInput
            value={name}
            onChangeText={setName}
            autoFocus
            style={[type.labelRegular, styles.input]}
            returnKeyType="done"
            accessibilityLabel="Collection name"
          />
        </View>
        <Button
          label="Create"
          disabled={!name.trim()}
          style={{ margin: layout.gutter }}
          onPress={() => {
            createCollection(name.trim(), productIds);
            router.back();
            showToast({ message: `Collection “${name.trim()}” created` });
          }}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { height: 44, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, color: colors.text },
});
