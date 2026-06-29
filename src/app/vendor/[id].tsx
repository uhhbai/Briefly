import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ServiceCard } from '@/components/marketplace';
import { Button } from '@/components/ui/Button';
import { CoverImage } from '@/components/ui/CoverImage';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getVendor, SERVICES } from '@/lib/catalog';
import { formatPrice } from '@/lib/config';

export default function VendorDetail() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vendor = getVendor(id);
  const services = SERVICES.filter((s) => s.vendorId === id);

  if (!vendor) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <ThemedText style={{ padding: Spacing.four }}>Vendor not found.</ThemedText>
      </SafeAreaView>
    );
  }

  const stats = [
    { n: vendor.rating.toFixed(1), l: 'Rating' },
    { n: `${vendor.reviewCount}`, l: 'Reviews' },
    { n: `${vendor.jobsDone}`, l: 'Jobs done' },
  ];

  return (
    <View style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <CoverImage
          uri={vendor.image}
          overlay={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.72)']}
          style={styles.hero}
          align="space-between">
          <SafeAreaView edges={['top']}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
              <ThemedText style={{ color: '#fff', fontSize: 22 }}>‹</ThemedText>
            </Pressable>
          </SafeAreaView>
          <View style={styles.heroContent}>
            <View style={styles.heroAvatar}>
              <ThemedText style={{ fontSize: 30 }}>{vendor.avatar}</ThemedText>
            </View>
            <ThemedText style={styles.heroName}>
              {vendor.name} {vendor.verified ? '✓' : ''}
            </ThemedText>
            <ThemedText style={styles.heroLoc}>📍 {vendor.location}</ThemedText>
          </View>
        </CoverImage>

        <View style={styles.body}>
          {/* Stats */}
          <Animated.View entering={FadeInDown.duration(350)} style={styles.stats}>
            {stats.map((s) => (
              <View key={s.l} style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <ThemedText style={{ fontWeight: '800', fontSize: 18, color: theme.text }}>
                  {s.l === 'Rating' ? `⭐ ${s.n}` : s.n}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {s.l}
                </ThemedText>
              </View>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(60).duration(350)}>
            <ThemedText type="default" style={{ lineHeight: 22 }}>
              {vendor.tagline}
            </ThemedText>
          </Animated.View>

          {services.length > 0 && (
            <Animated.View entering={FadeInDown.delay(120).duration(350)} style={{ gap: Spacing.two }}>
              <ThemedText type="default" style={{ fontWeight: '800', fontSize: 17 }}>
                Services
              </ThemedText>
              <View style={styles.grid}>
                {services.map((s) => (
                  <View key={s.id} style={{ width: '48%' }}>
                    <ServiceCard service={s} width="100%" />
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <Button
          title={`Request a quote · from ${formatPrice(vendor.priceFrom)}`}
          icon="✨"
          onPress={() =>
            router.push({
              pathname: '/describe',
              params: { prefill: `I'd like a quote from ${vendor.name} for a custom ${vendor.categoryId} project.` },
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: Spacing.five },
  hero: { height: 260 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.three,
    marginTop: Spacing.two,
  },
  heroContent: { alignItems: 'center', gap: 4, paddingBottom: Spacing.four },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  heroName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heroLoc: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  body: { padding: Spacing.three, gap: Spacing.three },
  stats: { flexDirection: 'row', gap: Spacing.two },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.three },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
});
