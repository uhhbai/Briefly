import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Canvas } from '@/components/ui/Canvas';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { listBuyerBriefs, loadBriefDetail, type BuyerBrief } from '@/lib/briefsDb';
import { haptic } from '@/lib/haptics';
import { useBrief } from '@/store/BriefContext';

const STATUS: Record<string, { label: string; tone: 'tint' | 'success' | 'muted' }> = {
  draft: { label: 'Draft', tone: 'muted' },
  posted: { label: 'Getting bids', tone: 'tint' },
  bidding: { label: 'Getting bids', tone: 'tint' },
  booked: { label: 'Booked', tone: 'success' },
  completed: { label: 'Completed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'muted' },
};

export default function BriefsScreen() {
  const theme = useTheme();
  const { setSpec, setBids, setRemoteBriefId, selectBid } = useBrief();
  const [briefs, setBriefs] = useState<BuyerBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await listBuyerBriefs();
    setBriefs(rows);
    setLoading(false);
  }, []);

  // Reload every time the tab regains focus (e.g. after posting a brief or
  // switching roles) so posted briefs never look like they vanished.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setLoading(true);
      listBuyerBriefs().then((rows) => {
        if (alive) {
          setBriefs(rows);
          setLoading(false);
        }
      });
      return () => {
        alive = false;
      };
    }, [])
  );

  async function openBrief(brief: BuyerBrief) {
    setOpening(brief.id);
    try {
      const detail = await loadBriefDetail(brief.id);
      if (!detail) return;
      setSpec(detail.spec);
      setBids(detail.bids);
      setRemoteBriefId(brief.id);
      selectBid(null);
      router.push('/bids');
    } finally {
      setOpening(null);
    }
  }

  const isEmpty = !loading && briefs.length === 0;

  return (
    <Canvas>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.headerLine}>
            <ThemedText type="title">Briefs</ThemedText>
            <Pressable onPress={() => { haptic.light(); void load(); }} hitSlop={12} accessibilityLabel="Refresh">
              <Icon name="refresh-cw" size={18} color={theme.textSecondary} />
            </Pressable>
          </View>

          {loading && briefs.length === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator color={theme.tint} />
            </View>
          ) : null}

          {isEmpty && (
            <Animated.View entering={FadeInDown.duration(340)} style={styles.empty}>
              <Icon name="file-text" size={28} color={theme.muted} />
              <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
                No briefs yet
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center', maxWidth: 280 }}>
                Describe something you want made or done, and makers will bid for the job.
              </ThemedText>
            </Animated.View>
          )}

          {briefs.map((brief, i) => {
            const status = STATUS[brief.status] ?? STATUS.posted;
            const tone = status.tone === 'success' ? theme.success : status.tone === 'muted' ? theme.muted : theme.tint;
            return (
              <Animated.View key={brief.id} entering={FadeInDown.delay(i * 60).duration(320)}>
                <Card>
                  <View style={styles.statusRow}>
                    <View style={[styles.dot, { backgroundColor: tone }]} />
                    <ThemedText type="eyebrow" style={{ color: tone }}>
                      {status.label}
                    </ThemedText>
                    <ThemedText type="eyebrow" themeColor="muted">
                      · {brief.categoryLabel}
                    </ThemedText>
                  </View>
                  <ThemedText type="subtitle">{brief.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                    {brief.summary}
                  </ThemedText>
                  <Divider style={{ marginVertical: Spacing.two }} />
                  <Button
                    title={brief.bidCount ? `Compare ${brief.bidCount} bid${brief.bidCount > 1 ? 's' : ''}` : 'View brief'}
                    variant="secondary"
                    iconRight="arrow-right"
                    loading={opening === brief.id}
                    onPress={() => openBrief(brief)}
                  />
                </Card>
              </Animated.View>
            );
          })}

          <Button title="Start a new brief" iconRight="arrow-right" onPress={() => router.push('/describe')} style={{ marginTop: Spacing.two }} />
        </ScrollView>
      </SafeAreaView>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.gutter, paddingTop: Spacing.two, paddingBottom: Spacing.huge, gap: Spacing.four },
  headerLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  center: { paddingVertical: Spacing.six, alignItems: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dot: { width: 7, height: 7, borderRadius: 999 },
  empty: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.six },
});
