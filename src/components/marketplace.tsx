import { router } from 'expo-router';
import { StyleSheet, View, type DimensionValue } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/Avatar';
import { CoverImage } from '@/components/ui/CoverImage';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Rating } from '@/components/ui/Rating';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/config';
import type { Category, Service, Vendor } from '@/lib/types';

// --- Category — numbered editorial row (Discover / Browse) -----------------

export function CategoryRow({ index, category, onPress }: { index: number; category: Category; onPress: () => void }) {
  const theme = useTheme();
  return (
    <PressableScale scaleTo={0.99} onPress={onPress}>
      <View style={styles.catRow}>
        <ThemedText type="eyebrow" themeColor="muted" style={styles.catIndex}>
          {String(index + 1).padStart(2, '0')}
        </ThemedText>
        <View style={styles.catThumb}>
          <CoverImage uri={category.image} style={styles.fill} />
        </View>
        <ThemedText type="subtitle" style={{ flex: 1 }} numberOfLines={1}>
          {category.label.split(' &')[0]}
        </ThemedText>
        <Icon name="arrow-up-right" size={20} color={theme.muted} />
      </View>
    </PressableScale>
  );
}

// --- Vendor / maker -------------------------------------------------------

export function VendorCard({ vendor, full }: { vendor: Vendor; full?: boolean }) {
  const theme = useTheme();

  if (full) {
    return (
      <PressableScale
        scaleTo={0.99}
        onPress={() => router.push({ pathname: '/vendor/[id]', params: { id: vendor.id } })}>
        <View style={styles.makerRow}>
          <Avatar uri={vendor.image} name={vendor.name} size={56} />
          <View style={{ flex: 1, gap: 3 }}>
            <View style={styles.nameLine}>
              <ThemedText type="subtitle" numberOfLines={1} style={{ flexShrink: 1 }}>
                {vendor.name}
              </ThemedText>
              {vendor.verified && <Icon name="check-circle" size={15} color={theme.tint} />}
            </View>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {vendor.tagline}
            </ThemedText>
            <View style={styles.metaLine}>
              <Rating value={vendor.rating} reviewCount={vendor.reviewCount} />
              <ThemedText type="small" themeColor="muted">
                ·  from {formatPrice(vendor.priceFrom)}
              </ThemedText>
            </View>
          </View>
        </View>
      </PressableScale>
    );
  }

  return (
    <PressableScale
      style={styles.makerCard}
      onPress={() => router.push({ pathname: '/vendor/[id]', params: { id: vendor.id } })}>
      <View style={styles.makerPhoto}>
        <CoverImage uri={vendor.image} style={styles.fill} />
      </View>
      <View style={styles.nameLine}>
        <ThemedText type="subtitle" numberOfLines={1} style={{ flexShrink: 1 }}>
          {vendor.name}
        </ThemedText>
        {vendor.verified && <Icon name="check-circle" size={15} color={theme.tint} />}
      </View>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
        {vendor.location} · {vendor.jobsDone} commissions
      </ThemedText>
      <Rating value={vendor.rating} reviewCount={vendor.reviewCount} />
    </PressableScale>
  );
}

// --- Service / listing ----------------------------------------------------

export function ServiceCard({ service, width }: { service: Service; width?: DimensionValue }) {
  const theme = useTheme();
  return (
    <PressableScale
      style={width ? { width } : undefined}
      onPress={() => router.push({ pathname: '/service/[id]', params: { id: service.id } })}>
      <View style={styles.servicePhoto}>
        <CoverImage uri={service.image} style={styles.fill} />
      </View>
      <ThemedText type="subtitle" style={{ marginTop: Spacing.two }} numberOfLines={2}>
        {service.title}
      </ThemedText>
      <View style={styles.serviceMeta}>
        <Rating value={service.rating} reviewCount={service.reviewCount} />
        <ThemedText type="smallBold" style={{ color: theme.text }}>
          from {formatPrice(service.priceFrom)}
        </ThemedText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },

  catRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three },
  catIndex: { width: 22 },
  catThumb: { width: 46, height: 46, borderRadius: Radius.sm, overflow: 'hidden' },

  makerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: 2 },

  makerCard: { width: 232, gap: 4 },
  makerPhoto: { width: '100%', height: 280, borderRadius: Radius.md, overflow: 'hidden', marginBottom: Spacing.two },

  servicePhoto: { width: '100%', height: 200, borderRadius: Radius.md, overflow: 'hidden' },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
});
