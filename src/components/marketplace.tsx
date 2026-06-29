import { router } from 'expo-router';
import { StyleSheet, View, type DimensionValue } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CoverImage } from '@/components/ui/CoverImage';
import { PressableScale } from '@/components/ui/PressableScale';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/config';
import type { Category, Service, Vendor } from '@/lib/types';

const SCRIM: [string, string] = ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.62)'];

// --- Category pill (horizontal scroller) ----------------------------------

export function CategoryPill({ category, onPress }: { category: Category; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress}>
      <CoverImage uri={category.image} overlay={SCRIM} style={styles.catTile} align="space-between">
        <View style={styles.catBadge}>
          <ThemedText style={{ fontSize: 16 }}>{category.emoji}</ThemedText>
        </View>
        <ThemedText style={styles.catLabel} numberOfLines={2}>
          {category.label.split(' &')[0]}
        </ThemedText>
      </CoverImage>
    </PressableScale>
  );
}

// --- Vendor card (carousel / list) ----------------------------------------

export function VendorCard({ vendor, full }: { vendor: Vendor; full?: boolean }) {
  const theme = useTheme();
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/vendor/[id]', params: { id: vendor.id } })}
      style={full ? styles.vendorWrapFull : styles.vendorWrap}>
      <View style={[styles.card, { backgroundColor: theme.card }, Shadow.card]}>
        <CoverImage uri={vendor.image} overlay={SCRIM} style={styles.vendorBanner} align="flex-end">
          <View style={styles.bannerRow}>
            <View style={styles.glassAvatar}>
              <ThemedText style={{ fontSize: 22 }}>{vendor.avatar}</ThemedText>
            </View>
            {vendor.verified && (
              <View style={styles.verifiedPill}>
                <ThemedText type="small" style={styles.verifiedText}>
                  ✓ Verified
                </ThemedText>
              </View>
            )}
          </View>
        </CoverImage>
        <View style={styles.vendorBody}>
          <ThemedText type="default" style={{ fontWeight: '700' }} numberOfLines={1}>
            {vendor.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2} style={{ minHeight: 38 }}>
            {vendor.tagline}
          </ThemedText>
          <View style={styles.metaRow}>
            <View style={[styles.ratingPill, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText type="small" style={{ color: theme.text, fontWeight: '700' }}>
                ⭐ {vendor.rating.toFixed(1)}
              </ThemedText>
            </View>
            <ThemedText type="small" themeColor="muted">
              from {formatPrice(vendor.priceFrom)}
            </ThemedText>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

// --- Service card (grid) --------------------------------------------------

export function ServiceCard({ service, width }: { service: Service; width?: DimensionValue }) {
  const theme = useTheme();
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/service/[id]', params: { id: service.id } })}
      style={width ? { width } : undefined}>
      <View style={[styles.card, { backgroundColor: theme.card }, Shadow.card]}>
        <CoverImage uri={service.image} overlay={SCRIM} style={styles.serviceBanner} align="space-between">
          <View style={styles.serviceTop}>
            <View style={styles.catBadge}>
              <ThemedText style={{ fontSize: 14 }}>{service.emoji}</ThemedText>
            </View>
          </View>
          <View style={styles.pricePill}>
            <ThemedText type="small" style={{ color: '#fff', fontWeight: '800' }}>
              from {formatPrice(service.priceFrom)}
            </ThemedText>
          </View>
        </CoverImage>
        <View style={styles.serviceBody}>
          <ThemedText type="small" style={{ fontWeight: '700', minHeight: 38 }} numberOfLines={2}>
            {service.title}
          </ThemedText>
          <ThemedText type="small" themeColor="muted">
            ⭐ {service.rating.toFixed(1)} · {service.reviewCount} reviews
          </ThemedText>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, overflow: 'hidden' },

  catTile: { width: 130, height: 100, padding: Spacing.two, borderRadius: Radius.lg },
  catBadge: {
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: { color: '#fff', fontWeight: '800', fontSize: 14 },

  vendorWrap: { width: 230 },
  vendorWrapFull: { width: '100%' },
  vendorBanner: { height: 104 },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: Spacing.two,
  },
  glassAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedPill: {
    backgroundColor: 'rgba(16,163,74,0.95)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  verifiedText: { color: '#fff', fontWeight: '700' },
  vendorBody: { padding: Spacing.three, gap: Spacing.one },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.one },
  ratingPill: { paddingHorizontal: Spacing.two, paddingVertical: 2, borderRadius: Radius.pill },

  serviceBanner: { height: 118 },
  serviceTop: { flexDirection: 'row', justifyContent: 'flex-start', padding: Spacing.two },
  pricePill: {
    alignSelf: 'flex-start',
    margin: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  serviceBody: { padding: Spacing.two, gap: Spacing.one },
});
