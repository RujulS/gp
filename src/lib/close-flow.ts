// Close a full-screen modal flow (profile, trial room) from any depth:
// dismissAll() unwinds that flow's own stack, back() then closes the modal.
import { router } from 'expo-router';

export function closeFlow() {
  if (router.canDismiss()) router.dismissAll();
  if (router.canGoBack()) router.back();
}
