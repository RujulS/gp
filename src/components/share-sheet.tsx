// "Share Item" / "Share Collection" sheet: WhatsApp, Message, Twitter.
import * as Linking from 'expo-linking';
import { Pressable, Share, View } from 'react-native';

import { Pic, Sheet, T } from '@/components/ui';
import { colors, spacing } from '@/constants/tokens';

export function ShareSheet({ visible, onClose, title, text }: { visible: boolean; onClose: () => void; title: string; text: string }) {
  const msg = encodeURIComponent(text);
  const targets = [
    { label: 'Whatsapp', image: 'shareWhatsapp' as const, url: `whatsapp://send?text=${msg}` },
    { label: 'Message', image: 'shareMessage' as const, url: `sms:&body=${msg}` },
    { label: 'Twitter', image: 'shareTwitter' as const, url: `https://twitter.com/intent/tweet?text=${msg}` },
  ];
  const open = async (url: string) => {
    onClose();
    // fall back to the OS share sheet when the app isn't installed
    if (await Linking.canOpenURL(url).catch(() => false)) Linking.openURL(url);
    else Share.share({ message: text });
  };
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={{ flexDirection: 'row', gap: spacing.xxl - 4 }}>
        {targets.map((t) => (
          <Pressable key={t.label} onPress={() => open(t.url)} style={{ alignItems: 'center', gap: spacing.sm }} accessibilityRole="button">
            <Pic name={t.image} style={{ width: 48, height: 48, borderRadius: 24 }} />
            <T variant="caption" color={colors.textSecondary}>
              {t.label}
            </T>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}
