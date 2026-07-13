import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Canvas } from '@/components/ui/Canvas';
import { CoverImage } from '@/components/ui/CoverImage';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Rating } from '@/components/ui/Rating';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getVendor, loadServiceDetail, SERVICES } from '@/lib/catalog';
import { formatPrice, getCategory } from '@/lib/config';
import { haptic } from '@/lib/haptics';
import type { Service, Vendor } from '@/lib/types';

const INCLUDED = ['Free consultation & measurements', 'Made to order, to your exact spec', 'Delivery & setup', 'Escrow-protected payment'];

export default function ServiceDetail() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const fallbackService = SERVICES.find((s) => s.id === id) ?? null;
  const fallbackVendor = fallbackService ? getVendor(fallbackService.vendorId) ?? null : null;
  const [service, setService] = useState<Service | null>(fallbackService);
  const [vendor, setVendor] = useState<Vendor | null>(fallbackVendor);

  useEffect(() => {
    let alive = true;
    loadServiceDetail(id).then((result) => {
      if (!alive) return;
      setService(result.service);
      setVendor(result.vendor);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (!service) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <ThemedText style={{ padding: Spacing.four }}>Listing not found.</ThemedText>
      </SafeAreaView>
    );
  }

  function requestQuote() {
    router.push({
      pathname: '/describe',
      params: { prefill: `Something similar to “${service!.title}” by ${vendor?.name ?? 'a maker'}. My budget is around ${formatPrice(service!.priceFrom)}.` },
    });
  }

  return (
    <Canvas>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <CoverImage uri={service.image} overlay={['rgba(0,0,0,0.28)', 'transparent']} style={styles.hero} align="flex-start">
          <SafeAreaView edges={['top']}>
            <Pressable onPress={() => { haptic.light(); router.back(); }} hitSlop={12} style={styles.backBtn}>
              <Icon name="arrow-left" size={20} color="#fff" />
            </Pressable>
          </SafeAreaView>
        </CoverImage>

        <View style={styles.body}>
          <Animated.View entering={FadeInDown.duration(340)} style={{ gap: Spacing.three }}>
            <ThemedText type="eyebrow" themeColor="muted">
              {getCategory(service.categoryId).label}
            </ThemedText>
            <ThemedText type="title">{service.title}</ThemedText>
            <View style={styles.metaRow}>
              <Rating value={service.rating} reviewCount={service.reviewCount} size={14} />
              <ThemedText type="small" themeColor="textSecondary">
                · ready in ~{service.etaDays} days
              </ThemedText>
            </View>
          </Animated.View>

          {vendor && (
            <Animated.View entering={FadeInDown.delay(60).duration(340)}>
              <Divider style={{ marginVertical: Spacing.four }} />
              <PressableScale scaleTo={0.99} onPress={() => router.push({ pathname: '/vendor/[id]', params: { id: vendor.id } })}>
                <View style={styles.vendorRow}>
                  <Avatar uri={vendor.image} name={vendor.name} size={48} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameLine}>
                      <ThemedText type="label">{vendor.name}</ThemedText>
                      {vendor.verified && <Icon name="check-circle" size={14} color={theme.tint} />}
                    </View>
                    <ThemedText type="small" themeColor="textSecondary">
                      {vendor.location} · {vendor.jobsDone} commissions
                    </ThemedText>
                  </View>
                  <Icon name="chevron-right" size={18} color={theme.muted} />
                </View>
              </PressableScale>
              <Divider style={{ marginVertical: Spacing.four }} />
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(120).duration(340)} style={{ gap: Spacing.three }}>
            <ThemedText type="eyebrow" themeColor="muted">
              What’s included
            </ThemedText>
            {INCLUDED.map((item) => (
              <View key={item} style={styles.bullet}>
                <Icon name="check" size={17} color={theme.tint} />
                <ThemedText type="default" style={{ flex: 1 }}>
                  {item}
                </ThemedText>
              </View>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(340)}>
            <ThemedText type="default" themeColor="textSecondary" style={{ marginTop: Spacing.four, lineHeight: 24 }}>
              This is a starting point. Describe your exact needs and {vendor?.name ?? 'makers'} — along with
              others — will send tailored bids, so you get the right price.
            </ThemedText>
          </Animated.View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <ThemedText type="eyebrow" themeColor="muted">
            Starting from
          </ThemedText>
          <ThemedText type="subtitle" style={{ marginTop: 2 }}>
            {formatPrice(service.priceFrom)}
          </ThemedText>
        </View>
        <Button title="Request bids" iconRight="arrow-right" onPress={requestQuote} style={{ flex: 1.3 }} />
      </View>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: Spacing.five },
  hero: { height: 300 },
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
  body: { padding: Spacing.gutter },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  vendorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bullet: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
});
