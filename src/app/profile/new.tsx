// "add profile" / "add name" / "name added"
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { ExitProfileDialog } from '@/components/exit-profile';
import { AvatarPicker } from '@/components/profile-avatar';
import { Button, ModalHeader, Screen, T } from '@/components/ui';
import { colors, layout, spacing, type } from '@/constants/tokens';
import { useApp } from '@/store/app-store';

export default function NewProfile() {
  const { draft, updateDraft } = useApp();
  const [name, setName] = useState(draft.name ?? '');
  const [exit, setExit] = useState(false);

  useEffect(() => {
    // fresh draft every time the flow starts here
    updateDraft({ id: undefined, name: undefined, photoUri: undefined, measurements: undefined, fit: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ModalHeader title="Add new profile" onClose={() => (name || draft.photoUri ? setExit(true) : router.back())} />
        <View style={{ flex: 1, paddingHorizontal: layout.gutter }}>
          <View style={{ marginTop: spacing.xl }}>
            <AvatarPicker profile={draft} onPicked={(uri) => updateDraft({ photoUri: uri })} />
          </View>
          <T variant="caption" style={{ marginTop: spacing.xxl, marginBottom: spacing.sm }}>
            Name *
          </T>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[type.labelRegular, styles.input]}
            autoCapitalize="words"
            returnKeyType="next"
            accessibilityLabel="Name"
          />
        </View>
        <Button
          label="Next"
          disabled={!name.trim()}
          style={{ margin: layout.gutter }}
          onPress={() => {
            updateDraft({ name: name.trim() });
            router.push('/profile/preferences');
          }}
        />
      </KeyboardAvoidingView>
      <ExitProfileDialog visible={exit} onCancel={() => setExit(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { height: 44, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, color: colors.text },
});
