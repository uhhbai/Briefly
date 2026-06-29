import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/config';
import { useBrief } from '@/store/BriefContext';

export default function BriefsScreen() {
  const theme = useTheme();
  const { spec, bids, selectedBidId } = useBrief();
  const selected = bids.find((b) => b.id === selectedBidId) ?? null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ThemedText type="subtitle" style={styles.title}>
          My Briefs
        </ThemedText>

        {spec ? (
          <Animated.View entering={FadeInDown.duration(350)}>
            <Card accentColor={selected ? theme.success : theme.tint}>
              <View style={styles.rowBetween}>
                <ThemedText type="small" themeColor="textSecondary">
                  {spec.category.emoji} {spec.category.label}
                </ThemedText>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: selected ? theme.successBg : theme.tintSoft },
                  ]}>
                  <ThemedText
                    type="small"
                    style={{ color: selected ? theme.success : theme.tint, fontWeight: '700' }}>
                    {selected ? 'Booked' : bids.length ? 'Bids in' : 'Draft'}
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="default" style={{ fontWeight: '700', fontSize: 18 }}>
                {spec.title}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                {spec.summary}
              </ThemedText>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              {selected ? (
                <ThemedText type="small" style={{ color: theme.text }}>
                  ✅ {selected.vendorName} · {formatPrice(selected.price)} · ~{selected.etaDays} days
                </ThemedText>
              ) : bids.length ? (
                <Button title={`Compare ${bids.length} bids`} variant="secondary" onPress={() => router.push('/bids')} />
              ) : (
                <Button title="Continue this brief" variant="secondary" onPress={() => router.push('/spec')} />
              )}
            </Card>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(350)} style={styles.empty}>
            <ThemedText style={{ fontSize: 52 }}>📋</ThemedText>
            <ThemedText type="default" style={{ fontWeight: '800', fontSize: 20 }}>
              No briefs yet
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
              Describe something you want made or done, and vendors will bid for the job.
            </ThemedText>
          </Animated.View>
        )}

        <Button
          title="Start a new brief"
          icon="✨"
          onPress={() => router.push('/describe')}
          style={{ marginTop: Spacing.four }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.three },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusPill: { paddingHorizontal: Spacing.two, paddingVertical: 3, borderRadius: Radius.pill },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.one },
  empty: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.six },
});
