import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Canvas } from '@/components/ui/Canvas';
import { Divider } from '@/components/ui/Divider';
import { Icon, type IconName } from '@/components/ui/Icon';
import { LogoMark } from '@/components/ui/Logo';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptic } from '@/lib/haptics';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/AuthContext';
import { useBrief } from '@/store/BriefContext';

type MenuItem = { icon: IconName; label: string; hint: string; href: Href; badge?: number };

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, profile } = useAuth();
  const { orders } = useBrief();
  const [unread, setUnread] = useState(0);
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Briefly user';

  const loadCounts = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null);
    setUnread(count ?? 0);
  }, [user]);

  useEffect(() => {
    const h = setTimeout(() => void loadCounts(), 0);
    return () => clearTimeout(h);
  }, [loadCounts]);

  const menu: MenuItem[] = [
    { icon: 'credit-card', label: 'Payment & escrow', hint: 'Fund jobs and check status', href: '/account/payments' },
    { icon: 'map-pin', label: 'Saved addresses', hint: 'Delivery or on-site addresses', href: '/account/addresses' },
    { icon: 'bell', label: 'Notifications', hint: 'Updates from Briefly', href: '/account/notifications', badge: unread },
    { icon: 'help-circle', label: 'Help & support', hint: 'Send us a message', href: '/account/support' },
    { icon: 'settings', label: 'Settings', hint: 'Profile, Telegram alerts, sign out', href: '/account/settings' },
  ];

  return (
    <Canvas>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.headerLine}>
            <ThemedText type="title">Account</ThemedText>
            <LogoMark size={42} />
          </View>

          <Animated.View entering={FadeInDown.duration(340)} style={styles.identity}>
            <View style={[styles.avatar, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <Icon name="user" size={24} color={theme.textSecondary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="subtitle">{displayName}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {profile?.location || 'Singapore'} · Buyer account
              </ThemedText>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.tintSoft }]}>
              <ThemedText type="smallBold" style={{ color: theme.tint }}>
                {orders.length} booked
              </ThemedText>
            </View>
          </Animated.View>

          <View style={styles.menu}>
            {menu.map((item, i) => (
              <Animated.View key={item.label} entering={FadeInDown.delay(80 + i * 40).duration(300)}>
                {i > 0 ? <Divider /> : null}
                <Pressable
                  onPress={() => {
                    haptic.light();
                    router.push(item.href);
                  }}
                  style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.tintSoft }]}>
                  <View style={[styles.rowIcon, { backgroundColor: theme.backgroundElement }]}>
                    <Icon name={item.icon} size={19} color={theme.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="label">{item.label}</ThemedText>
                    <ThemedText type="small" themeColor="muted">
                      {item.hint}
                    </ThemedText>
                  </View>
                  {item.badge ? (
                    <View style={[styles.count, { backgroundColor: theme.tint }]}>
                      <ThemedText type="smallBold" style={{ color: theme.tintText, fontSize: 11 }}>
                        {item.badge}
                      </ThemedText>
                    </View>
                  ) : null}
                  <Icon name="chevron-right" size={18} color={theme.muted} />
                </Pressable>
              </Animated.View>
            ))}
          </View>

          <ThemedText type="small" themeColor="muted" style={{ textAlign: 'center', marginTop: Spacing.four }}>
            Briefly v1.0 · beta
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.gutter, paddingTop: Spacing.two, paddingBottom: Spacing.huge, gap: Spacing.four },
  headerLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  badge: { borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: 6 },
  menu: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
  },
  rowIcon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  count: { minWidth: 22, height: 22, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
});
