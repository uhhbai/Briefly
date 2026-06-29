import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { GradientCard } from '@/components/ui/GradientCard';
import { PressableScale } from '@/components/ui/PressableScale';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MENU: { icon: string; label: string; hint?: string }[] = [
  { icon: '🤝', label: 'Become a vendor', hint: 'Earn by bidding on briefs' },
  { icon: '💳', label: 'Payment & escrow' },
  { icon: '📍', label: 'Saved addresses' },
  { icon: '🔔', label: 'Notifications' },
  { icon: '❓', label: 'Help & support' },
  { icon: '⚙️', label: 'Settings' },
];

export default function ProfileScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ThemedText type="subtitle" style={styles.title}>
          Profile
        </ThemedText>

        {/* Profile header card */}
        <Animated.View entering={FadeInDown.duration(350)}>
          <GradientCard colors={['#4F46E5', '#7C3AED']} style={styles.headerCard}>
            <View style={styles.avatar}>
              <ThemedText style={{ fontSize: 30 }}>🙂</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 20 }}>Guest user</ThemedText>
              <ThemedText style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                Singapore · Joined 2026
              </ThemedText>
            </View>
          </GradientCard>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(80).duration(350)} style={styles.stats}>
          {[
            { n: '0', l: 'Briefs' },
            { n: '0', l: 'Booked' },
            { n: '—', l: 'Rating' },
          ].map((s) => (
            <View key={s.l} style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <ThemedText style={{ fontWeight: '800', fontSize: 20, color: theme.text }}>{s.n}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {s.l}
              </ThemedText>
            </View>
          ))}
        </Animated.View>

        {/* Menu */}
        <View style={[styles.menu, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {MENU.map((m, i) => (
            <Animated.View key={m.label} entering={FadeInDown.delay(120 + i * 40).duration(300)}>
              <PressableScale
                scaleTo={0.985}
                onPress={() => Alert.alert(m.label, 'Coming soon in a future build.')}>
                <View
                  style={[
                    styles.menuRow,
                    i < MENU.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
                  ]}>
                  <ThemedText style={{ fontSize: 20 }}>{m.icon}</ThemedText>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="default" style={{ fontWeight: '600' }}>
                      {m.label}
                    </ThemedText>
                    {m.hint ? (
                      <ThemedText type="small" themeColor="textSecondary">
                        {m.hint}
                      </ThemedText>
                    ) : null}
                  </View>
                  <ThemedText style={{ color: theme.muted, fontSize: 20 }}>›</ThemedText>
                </View>
              </PressableScale>
            </Animated.View>
          ))}
        </View>

        <ThemedText type="small" themeColor="muted" style={{ textAlign: 'center', marginTop: Spacing.three }}>
          Briefly v1.0 · beta
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.three },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800' },
  headerCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.four },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: { flexDirection: 'row', gap: Spacing.two },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  menu: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three },
});
