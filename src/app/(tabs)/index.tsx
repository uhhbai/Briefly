import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryRow, ServiceCard, VendorCard } from '@/components/marketplace';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Canvas } from '@/components/ui/Canvas';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import { KenBurns } from '@/components/ui/KenBurns';
import { Logo } from '@/components/ui/Logo';
import { Spacing, Type } from '@/constants/theme';
import { useCatalog } from '@/hooks/use-catalog';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORIES } from '@/lib/config';
import { HERO_IMAGE } from '@/lib/images';

export default function DiscoverScreen() {
  const theme = useTheme();
  const catalog = useCatalog();
  const vendors = [...catalog.vendors].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const services = [...catalog.services].sort((a, b) => b.reviewCount - a.reviewCount);
  const cats = CATEGORIES.filter((c) => c.id !== 'other');

  return (
    <Canvas>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Masthead */}
        <Animated.View entering={FadeInDown.duration(320)} style={styles.masthead}>
          <Logo size={24} withMark />
          <View style={styles.locality}>
            <Icon name="map-pin" size={13} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">
              Singapore
            </ThemedText>
          </View>
        </Animated.View>
        <Divider style={{ marginTop: Spacing.three }} />

        {/* Editorial hero */}
        <Animated.View entering={FadeInDown.delay(60).duration(380)} style={styles.hero}>
          <ThemedText type="eyebrow" themeColor="muted">
            A reverse marketplace
          </ThemedText>
          <ThemedText type="display" style={styles.heroTitle}>
            Made to order, by{' '}
            <ThemedText type="display" style={{ color: theme.tint, fontFamily: Type.serifDisplayItalic }}>
              Singapore’s
            </ThemedText>{' '}
            finest makers.
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={{ maxWidth: 380 }}>
            Describe what you want made. Vendors bid for the work. You choose the one.
          </ThemedText>
          <View style={styles.signalRow}>
            <View style={[styles.signalPill, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <Icon name="activity" size={14} color={theme.tint} />
              <ThemedText type="smallBold" style={{ color: theme.text }}>
                {catalog.loading ? 'Syncing catalog' : catalog.source === 'supabase' ? 'Live marketplace' : 'Demo marketplace'}
              </ThemedText>
            </View>
            <View style={[styles.signalPill, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <Icon name="zap" size={14} color={theme.accent} />
              <ThemedText type="smallBold" style={{ color: theme.text }}>
                {vendors.length} makers ready
              </ThemedText>
            </View>
          </View>
          <Button
            title="Start a brief"
            iconRight="arrow-right"
            onPress={() => router.push('/describe')}
            style={{ marginTop: Spacing.two, alignSelf: 'flex-start', paddingHorizontal: Spacing.five }}
          />
        </Animated.View>

        {/* Wide art-directed image */}
        <Animated.View entering={FadeInDown.delay(120).duration(380)} style={styles.heroImageWrap}>
          <KenBurns uri={HERO_IMAGE} style={styles.heroImage} />
        </Animated.View>

        {/* Categories — numbered editorial index */}
        <SectionHeader label="Browse by craft" />
        <View style={styles.block}>
          {cats.map((c, i) => (
            <Animated.View key={c.id} entering={FadeInDown.delay(60 + i * 40).duration(320)}>
              {i > 0 && <Divider />}
              <CategoryRow
                index={i}
                category={c}
                onPress={() => router.push({ pathname: '/browse', params: { category: c.id } })}
              />
            </Animated.View>
          ))}
        </View>

        {/* Featured makers */}
        <SectionHeader label="Featured makers" actionLabel="View all" onAction={() => router.push('/browse')} />
        <Animated.View entering={FadeInDown.delay(80).duration(360)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {vendors.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Popular pieces */}
        <SectionHeader label="Pieces in demand" />
        <Animated.View entering={FadeInDown.delay(80).duration(360)} style={styles.grid}>
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} width="47%" />
          ))}
        </Animated.View>

        {/* Trust note */}
        <View style={styles.trust}>
          <Divider style={{ marginBottom: Spacing.three }} />
          <View style={styles.trustRow}>
            <Icon name="shield" size={18} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary" style={{ flex: 1 }}>
              Every payment is held in escrow and released only when the work is delivered as agreed.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </Canvas>
  );
}

function SectionHeader({ label, actionLabel, onAction }: { label: string; actionLabel?: string; onAction?: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <ThemedText type="eyebrow" themeColor="muted">
        {label}
      </ThemedText>
      {actionLabel && (
        <Pressable onPress={onAction} hitSlop={10} style={styles.action}>
          <ThemedText type="link" style={{ color: theme.tint }}>
            {actionLabel}
          </ThemedText>
          <Icon name="arrow-right" size={15} color={theme.tint} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.gutter, paddingBottom: Spacing.huge },
  masthead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Spacing.two },
  locality: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  hero: { marginTop: Spacing.section, gap: Spacing.three },
  heroTitle: { fontSize: 40, lineHeight: 44 },
  signalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  signalPill: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },

  heroImageWrap: { marginTop: Spacing.four },
  heroImage: { width: '100%', height: 230, borderRadius: 8 },

  sectionHeader: {
    marginTop: Spacing.section,
    marginBottom: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  block: { marginTop: Spacing.one },
  hScroll: { gap: Spacing.four, paddingVertical: Spacing.one, paddingRight: Spacing.four },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.five },

  trust: { marginTop: Spacing.section },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
});
