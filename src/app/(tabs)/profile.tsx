import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Canvas } from '@/components/ui/Canvas';
import { Divider } from '@/components/ui/Divider';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptic } from '@/lib/haptics';
import { useSession } from '@/store/SessionProvider';

const MENU: { icon: IconName; label: string; hint?: string }[] = [
  { icon: 'tool', label: 'Become a vendor', hint: 'Earn by bidding on briefs' },
  { icon: 'credit-card', label: 'Payment & escrow' },
  { icon: 'map-pin', label: 'Saved addresses' },
  { icon: 'bell', label: 'Notifications' },
  { icon: 'help-circle', label: 'Help & support' },
  { icon: 'settings', label: 'Settings' },
];

const STATS = [
  { n: '0', l: 'Briefs' },
  { n: '0', l: 'Booked' },
  { n: '—', l: 'Rating' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const { email, isGuest, signOut } = useSession();

  return (
    <Canvas>
      <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ThemedText type="title">Account</ThemedText>

        {/* Identity */}
        <Animated.View entering={FadeInDown.duration(340)} style={styles.identity}>
          <View style={[styles.avatar, { borderColor: theme.border }]}>
            <Icon name="user" size={24} color={theme.textSecondary} />
          </View>
          <View>
            <ThemedText type="subtitle">{isGuest ? 'Guest' : email ?? 'Account'}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {isGuest ? 'Demo mode' : 'Signed in'} · Singapore
            </ThemedText>
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(80).duration(340)} style={styles.stats}>
          {STATS.map((s, i) => (
            <View key={s.l} style={styles.statBox}>
              {i > 0 && <View style={[styles.vRule, { backgroundColor: theme.border }]} />}
              <ThemedText type="title" style={{ fontSize: 26 }}>
                {s.n}
              </ThemedText>
              <ThemedText type="eyebrow" themeColor="muted">
                {s.l}
              </ThemedText>
            </View>
          ))}
        </Animated.View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU.map((m, i) => (
            <Animated.View key={m.label} entering={FadeInDown.delay(120 + i * 40).duration(300)}>
              {i > 0 && <Divider />}
              <Pressable
                onPress={() => {
                  haptic.light();
                  Alert.alert(m.label, 'Coming soon in a future build.');
                }}
                style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.6 }]}>
                <Icon name={m.icon} size={19} color={theme.text} />
                <View style={{ flex: 1 }}>
                  <ThemedText type="label">{m.label}</ThemedText>
                  {m.hint ? (
                    <ThemedText type="small" themeColor="muted">
                      {m.hint}
                    </ThemedText>
                  ) : null}
                </View>
                <Icon name="chevron-right" size={18} color={theme.muted} />
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <Button title={isGuest ? 'Leave guest mode' : 'Sign out'} variant="secondary" iconRight="log-out" onPress={signOut} />

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
  scroll: { paddingHorizontal: Spacing.gutter, paddingTop: Spacing.two, paddingBottom: Spacing.huge, gap: Spacing.section },
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: { flexDirection: 'row' },
  statBox: { flex: 1, alignItems: 'center', gap: 4, position: 'relative' },
  vRule: { position: 'absolute', left: 0, top: 6, bottom: 6, width: StyleSheet.hairlineWidth },
  menu: {},
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three },
});
