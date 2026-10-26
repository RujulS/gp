// "Manage Profile" + "edit prof" sheet + delete.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Avatar, AvatarPicker } from '@/components/profile-avatar';
import { Button, CartButton, Dialog, Header, Icon, IconButton, Screen, Sheet, T, type IconName } from '@/components/ui';
import { colors, layout, spacing, type } from '@/constants/tokens';
import { measures } from '@/data/catalog';
import { useApp } from '@/store/app-store';

export default function ManageProfile() {
  const { activeProfile: p, updateProfile, deleteProfile, updateDraft } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(p.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const section = (icon: IconName, title: string, onEdit: () => void, rows: [string, string][]) => (
    <View style={{ marginTop: spacing.xxl }}>
      <View style={styles.sectionHead}>
        <Icon name={icon} size={26} />
        <T variant="body" color={colors.textSecondary} style={{ flex: 1, fontFamily: 'Manrope_700Bold' }}>
          {title}
        </T>
        <IconButton name="pencil-outline" accessibilityLabel={`Edit ${title}`} onPress={onEdit} />
      </View>
      <View style={styles.table}>
        {rows.map(([k, v]) => (
          <View key={k} style={styles.tr}>
            <T variant="labelRegular" color={colors.textSecondary} style={{ width: 104 }}>
              {k}
            </T>
            <T variant="labelRegular" color={colors.textSecondary} style={{ flex: 1, fontFamily: 'Manrope_700Bold' }}>
              {v}
            </T>
          </View>
        ))}
      </View>
    </View>
  );

  const m = p.measurements;
  return (
    <Screen>
      <Header leading="back" trailing={<CartButton />} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xl, marginTop: spacing.lg }}>
          <Avatar profile={p} size={80} />
          <T variant="titleMedium" style={{ flex: 1 }}>
            {p.name}
          </T>
          <IconButton name="pencil-outline" accessibilityLabel="Edit name and photo" onPress={() => setEditing(true)} />
        </View>

        {section('shape-outline', 'Categories', () => router.push({ pathname: '/profile/preferences', params: { edit: '1' } }), [
          ['Gender', p.gender ?? '—'],
          ['Fit', p.fit.length ? p.fit.join(', ') : '—'],
        ])}

        {m
          ? section('tape-measure', 'Body Size & Type', () => router.push({ pathname: '/profile/manual', params: { edit: 'profile' } }), [
              ...measures.map((x): [string, string] => [x.label === 'Shoulders' ? 'Shoulder' : x.label, `${m[x.key]} ${x.unit}`]),
              ['Body Type', p.bodyType ?? '—'],
            ])
          : (
            <View style={{ marginTop: spacing.xxl, gap: spacing.md }}>
              <T variant="body" color={colors.textSecondary}>
                No measurements yet
              </T>
              <Button
                label="Find my size"
                kind="secondary"
                onPress={() => {
                  updateDraft({ ...p });
                  router.push('/profile/measure');
                }}
              />
            </View>
          )}

        <Pressable style={styles.delete} onPress={() => setConfirmDelete(true)} accessibilityRole="button">
          <Icon name="trash-can-outline" color={colors.accent} />
          <T variant="bodyRegular" color={colors.accent}>
            Delete profile
          </T>
        </Pressable>
      </ScrollView>

      <Sheet visible={editing} onClose={() => setEditing(false)} title="Edit profile">
        <AvatarPicker profile={p} onPicked={(uri) => updateProfile(p.id, { photoUri: uri })} />
        <T variant="caption" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
          Name *
        </T>
        <TextInput value={name} onChangeText={setName} style={[type.labelRegular, styles.input]} accessibilityLabel="Name" />
        <Button
          label="Save Changes"
          disabled={!name.trim()}
          style={{ marginTop: spacing.xxl }}
          onPress={() => {
            updateProfile(p.id, { name: name.trim() });
            setEditing(false);
          }}
        />
      </Sheet>

      <Dialog
        visible={confirmDelete}
        icon={<Icon name="trash-can-outline" size={48} color={colors.accent} />}
        title={`Delete ${p.name}?`}
        message="Their preferences and measurements will be removed."
        cancel="Cancel"
        confirm="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          deleteProfile(p.id);
          router.back();
          router.push({ pathname: '/profile/done', params: { kind: 'deleted' } });
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.md },
  table: { backgroundColor: colors.surface, paddingVertical: spacing.sm },
  tr: { flexDirection: 'row', paddingHorizontal: spacing.sm, paddingVertical: 8 },
  delete: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xxl },
  input: { height: 44, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, color: colors.text },
});
