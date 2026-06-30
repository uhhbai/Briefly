import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ServiceCard } from '@/components/marketplace';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Canvas } from '@/components/ui/Canvas';
import { CoverImage } from '@/components/ui/CoverImage';
import { Icon } from '@/components/ui/Icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getVendor, SERVICES } from '@/lib/catalog';
import { formatPrice } from '@/lib/config';
import { haptic } from '@/lib/haptics';

export default function VendorDetail() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vendor = getVendor(id);
  const services = SERVICES.filter((s) => s.vendorId === id);

  if (!vendor) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <ThemedText style={{ padding: Spacing.four }}>Maker not found.</ThemedText>
      </SafeAreaView>
    );
  }

  const stats = [
    { n: vendor.rating.toFixed(1), l: 'Rating' },
    { n: `${vendor.reviewCount}`, l: 'Reviews' },
    { n: `${vendor.jobsDone}`, l: 'Commissions' },
  ];

  return (
    <Canvas>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <CoverImage uri={vendor.image} overlay={['rgba(0,0,0,0.30)', 'rgba(0,0,0,0.10)']} style={styles.hero} align="flex-start">
          <SafeAreaView edges={['top']}>
            <Pressable onPress={() => { haptic.light(); router.back(); }} hitSlop={12} style={styles.backBtn}>
              <Icon name="arrow-left" size={20} color="#fff" />
            </Pressable>
          </SafeAreaView>
        </CoverImage>

        <View style={styles.body}>
          {/* Identity */}
          <Animated.View entering={FadeInDown.duration(340)} style={styles.identity}>
            <View style={styles.avatarRing}>
              <Avatar uri={vendor.image} name={vendor.name} size={72} />
            </View>
            <View style={styles.nameLine}>
              <ThemedText type="title" style={{ fontSize: 26 }}>
                {vendor.name}
              </ThemedText>
              {vendor.verified && <Icon name="check-circle" size={18} color={theme.tint} />}
            </View>
            <View style={styles.locRow}>
              <Icon name="map-pin" size={13} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                {vendor.location}
              </ThemedText>
            </View>
          </Animated.View>

          {/* Stats */}
          <Animated.View entering={FadeInDown.delay(60).duration(340)} style={[styles.stats, { borderColor: theme.border }]}>
            {stats.map((s, i) => (
              <View key={s.l} style={styles.statBox}>
                {i > 0 && <View style={[styles.vRule, { backgroundColor: theme.border }]} />}
                <ThemedText type="subtitle">{s.n}</ThemedText>
                <ThemedText type="eyebrow" themeColor="muted">
                  {s.l}
                </ThemedText>
              </View>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(340)}>
            <ThemedText type="default" themeColor="textSecondary" style={{ lineHeight: 24 }}>
              {vendor.tagline}
            </ThemedText>
          </Animated.View>

          {services.length > 0 && (
            <Animated.View entering={FadeInDown.delay(180).duration(340)} style={{ gap: Spacing.four, marginTop: Spacing.two }}>
              <ThemedText type="eyebrow" themeColor="muted">
                Selected work
              </ThemedText>
              <View style={styles.grid}>
                {services.map((s) => (
                  <View key={s.id} style={{ width: '47%' }}>
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
          iconRight="arrow-right"
          onPress={() =>
            router.push({
              pathname: '/describe',
              params: { prefill: `I'd like a quote from ${vendor.name} for a custom ${vendor.categoryId} project.` },
            })
          }
        />
      </View>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: Spacing.five },
  hero: { height: 220 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.gutter,
    marginTop: Spacing.two,
  },
  body: { paddingHorizontal: Spacing.gutter, gap: Spacing.four },
  identity: { alignItems: 'center', gap: Spacing.two, marginTop: -52 },
  avatarRing: { borderRadius: Radius.pill, borderWidth: 3, borderColor: '#F4F0E7' },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.two },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  stats: { flexDirection: 'row', borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.lg, paddingVertical: Spacing.three },
  statBox: { flex: 1, alignItems: 'center', gap: 2, position: 'relative' },
  vRule: { position: 'absolute', left: 0, top: 4, bottom: 4, width: StyleSheet.hairlineWidth },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.five },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
});
