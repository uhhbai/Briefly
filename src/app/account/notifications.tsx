import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/AuthContext';

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export default function AccountNotifications() {
  const theme = useTheme();
  const toast = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('id, title, body, read_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) setItems(data as NotificationRow[]);
  }, [user]);

  useEffect(() => {
    const h = setTimeout(() => void load(), 0);
    return () => clearTimeout(h);
  }, [load]);

  async function markRead() {
    if (!user) return;
    setBusy('read');
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);
      if (error) throw error;
      await load();
      toast.success('Marked all as read.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update notifications.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen
      showBack
      showHome
      eyebrow="Account"
      title="Notifications"
      footer={<Button title="Mark all as read" variant="secondary" iconRight="check-circle" loading={busy === 'read'} onPress={markRead} />}>
      {items.length ? (
        items.map((item) => (
          <View key={item.id} style={[styles.row, { borderColor: item.read_at ? theme.border : theme.tint }]}>
            <View style={{ flex: 1 }}>
              <ThemedText type="label">{item.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.body}
              </ThemedText>
            </View>
            {!item.read_at ? <View style={[styles.dot, { backgroundColor: theme.tint }]} /> : null}
          </View>
        ))
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          No notifications yet. You&apos;ll see updates here when vendors bid on your briefs.
        </ThemedText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  dot: { width: 9, height: 9, borderRadius: Radius.pill },
});
