import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { CoverImage } from '@/components/ui/CoverImage';
import { PressableScale } from '@/components/ui/PressableScale';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getVendor, SERVICES } from '@/lib/catalog';
import { formatPrice } from '@/lib/config';

const INCLUDED = ['Free consultation & measurements', 'Made-to-order to your spec', 'Delivery & setup', 'Escrow-protected payment'];

export default function ServiceDetail() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const service = SERVICES.find((s) => s.id === id);
  const vendor = service ? getVendor(service.vendorId) : undefined;

  if (!service) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <ThemedText style={{ padding: Spacing.four }}>Service not found.</ThemedText>
      </SafeAreaView>
    );
  }

  function requestQuote() {
    router.push({
      pathname: '/describe',
      params: { prefill: `${service!.title} — similar to "${service!.title}" by ${vendor?.name ?? 'a vendor'}. My budget is around ${formatPrice(service!.priceFrom)}.` },
    });
  }

  return (
    <View style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Full-bleed photo hero */}
        <CoverImage
          uri={service.image}
          overlay={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.15)']}
          style={styles.hero}
          align="space-between">
          <SafeAreaView edges={['top']}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
              <ThemedText style={{ color: '#fff', fontSize: 22 }}>‹</ThemedText>
            </Pressable>
          </SafeAreaView>
          <View style={styles.heroBadge}>
            <ThemedText style={{ fontSize: 18 }}>{service.emoji}</ThemedText>
          </View>
        </CoverImage>

        <View style={styles.body}>
          <Animated.View entering={FadeInDown.duration(350)}>
            <ThemedText type="subtitle" style={styles.title}>
              {service.title}
            </ThemedText>
            <View style={styles.metaRow}>
              <ThemedText type="small" style={{ color: theme.text, fontWeight: '700' }}>
                ⭐ {service.rating.toFixed(1)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                ({service.reviewCount} reviews) · ~{service.etaDays} days
              </ThemedText>
            </View>
          </Animated.View>

          {/* Vendor row */}
          {vendor && (
            <Animated.View entering={FadeInDown.delay(60).duration(350)}>
              <PressableScale
                scaleTo={0.98}
                onPress={() => router.push({ pathname: '/vendor/[id]', params: { id: vendor.id } })}>
                <View style={[styles.vendorRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <ThemedText style={{ fontSize: 28 }}>{vendor.avatar}</ThemedText>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="default" style={{ fontWeight: '700' }}>
                      {vendor.name} {vendor.verified ? '✓' : ''}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {vendor.location} · {vendor.jobsDone} jobs done
                    </ThemedText>
                  </View>
                  <ThemedText style={{ color: theme.muted, fontSize: 20 }}>›</ThemedText>
                </View>
              </PressableScale>
            </Animated.View>
          )}

          {/* What's included */}
          <Animated.View entering={FadeInDown.delay(120).duration(350)} style={{ gap: Spacing.two }}>
            <ThemedText type="default" style={{ fontWeight: '800', fontSize: 17 }}>
              What’s included
            </ThemedText>
            {INCLUDED.map((item) => (
              <View key={item} style={styles.bullet}>
                <ThemedText style={{ color: theme.success }}>✓</ThemedText>
                <ThemedText type="default" style={{ flex: 1 }}>
                  {item}
                </ThemedText>
              </View>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(350)}>
            <ThemedText type="small" themeColor="textSecondary" style={{ lineHeight: 21 }}>
              This is a starting point. Tap below to describe your exact needs — {vendor?.name ?? 'vendors'} and
              others will send tailored bids so you get the best price.
            </ThemedText>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <ThemedText type="small" themeColor="textSecondary">
            Starting from
          </ThemedText>
          <ThemedText style={{ fontSize: 22, fontWeight: '800', color: theme.text }}>
            {formatPrice(service.priceFrom)}
          </ThemedText>
        </View>
        <Button title="Request bids" icon="✨" onPress={requestQuote} style={{ flex: 1.4 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: Spacing.five },
  hero: { height: 250 },
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
  heroBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.three,
    marginBottom: Spacing.three,
  },
  body: { padding: Spacing.three, gap: Spacing.three },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.one },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bullet: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
});
