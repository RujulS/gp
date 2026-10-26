// "Exit Profile?" confirm, shown when closing the profile flow part-way.

import { Dialog, Icon } from '@/components/ui';
import { closeFlow } from '@/lib/close-flow';
import { colors } from '@/constants/tokens';
import { useApp } from '@/store/app-store';

export function ExitProfileDialog({ visible, onCancel }: { visible: boolean; onCancel: () => void }) {
  const { commitDraft, draft } = useApp();
  return (
    <Dialog
      visible={visible}
      icon={<Icon name="alert-circle-outline" size={56} color={colors.accent} />}
      title="Exit Profile?"
      message="Profile will be created with incomplete data. Do you still wish to exit?"
      cancel="No, continue updating"
      confirm="Yes, Exit profile."
      onCancel={onCancel}
      onConfirm={() => {
        onCancel();
        if (draft.name) commitDraft();
        closeFlow();
      }}
    />
  );
}
