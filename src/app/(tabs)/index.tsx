import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { CategoryPill, ServiceCard, VendorCard } from '@/components/marketplace';
import { CoverImage } from '@/components/ui/CoverImage';
import { PressableScale } from '@/components/ui/PressableScale';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { featuredVendors, popularServices } from '@/lib/catalog';
import { CATEGORIES } from '@/lib/config';
import { HERO_IMAGE } from '@/lib/images';

const SERVICE_GAP = Spacing.three;

export default function DiscoverScreen() {
  const theme = useTheme();
  const vendors = featuredVendors();
  const services = popularServices();
  const cats = CATEGORIES.filter((c) => c.id !== 'other');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <View>
            <ThemedText type="small" themeColor="textSecondary">
              📍 Singapore
            </ThemedText>
            <ThemedText style={[styles.wordmark, { color: theme.tint }]}>Briefly</ThemedText>
          </View>
          <View style={[styles.avatar, { backgroundColor: theme.tintSoft }]}>
            <ThemedText style={{ fontSize: 20 }}>👋</ThemedText>
          </View>
        </Animated.View>

        {/* Hero — the AI describe entry */}
        <Animated.View entering={FadeInDown.delay(60).duration(350)} style={styles.section}>
          <PressableScale onPress={() => router.push('/describe')}>
            <CoverImage
              uri={HERO_IMAGE}
              overlay={['rgba(79,70,229,0.86)', 'rgba(124,58,237,0.94)']}
              style={[styles.hero, Shadow.float]}>
              <View style={styles.heroInner}>
                <View style={styles.heroTag}>
                  <ThemedText type="small" style={{ color: '#fff', fontWeight: '700' }}>
                    🪄 AI-powered
                  </ThemedText>
                </View>
                <ThemedText style={styles.heroTitle}>Describe it.{'\n'}They build it.</ThemedText>
                <ThemedText style={styles.heroSub}>
                  Tell our AI what you want made — vendors bid, you pick.
                </ThemedText>
                <View style={styles.heroSearch}>
                  <ThemedText style={{ fontSize: 16 }}>🔎</ThemedText>
                  <ThemedText style={{ color: '#5B6470', flex: 1 }} numberOfLines={1}>
                    e.g. walnut coffee table under S$800…
                  </ThemedText>
                  <View style={[styles.heroSearchBtn, { backgroundColor: theme.tint }]}>
                    <ThemedText style={{ color: '#fff', fontWeight: '700' }}>Start</ThemedText>
                  </View>
                </View>
              </View>
            </CoverImage>
          </PressableScale>
        </Animated.View>

        {/* Categories */}
        <SectionHeader title="Browse categories" />
        <Animated.View entering={FadeInDown.delay(120).duration(350)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}>
            {cats.map((c) => (
              <CategoryPill
                key={c.id}
                category={c}
                onPress={() => router.push({ pathname: '/browse', params: { category: c.id } })}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Featured vendors */}
        <SectionHeader title="Top-rated vendors" actionLabel="See all" onAction={() => router.push('/browse')} />
        <Animated.View entering={FadeInDown.delay(180).duration(350)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}>
            {vendors.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Popular services grid */}
        <SectionHeader title="Popular right now" />
        <Animated.View entering={FadeInDown.delay(240).duration(350)} style={styles.grid}>
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} width="48%" />
          ))}
        </Animated.View>

        {/* Trust banner */}
        <Animated.View entering={FadeInDown.delay(300).duration(350)} style={styles.section}>
          <View style={[styles.trust, { backgroundColor: theme.tintSoft }]}>
            <ThemedText style={{ fontSize: 24 }}>🔒</ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold" style={{ color: theme.tint }}>
                Protected by escrow
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Your payment is held safely and only released when the job is done right.
              </ThemedText>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.section, styles.sectionHeader]}>
      <ThemedText type="default" style={{ fontWeight: '800', fontSize: 19 }}>
        {title}
      </ThemedText>
      {actionLabel && (
        <ThemedText type="small" style={{ color: theme.tint, fontWeight: '700' }} onPress={onAction}>
          {actionLabel}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: Spacing.six },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  wordmark: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  avatar: { width: 44, height: 44, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },

  section: { paddingHorizontal: Spacing.three, marginTop: Spacing.three },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  hero: { borderRadius: Radius.xl, minHeight: 232 },
  heroInner: { padding: Spacing.four, gap: Spacing.two, flex: 1, justifyContent: 'center' },
  heroTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    marginBottom: Spacing.one,
  },
  heroTitle: { color: '#fff', fontSize: 30, fontWeight: '800', lineHeight: 34 },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 20 },
  heroSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    padding: Spacing.two,
    marginTop: Spacing.two,
  },
  heroSearchBtn: { paddingHorizontal: Spacing.three, paddingVertical: 6, borderRadius: Radius.sm },

  hScroll: { paddingHorizontal: Spacing.three, gap: Spacing.two, paddingVertical: Spacing.one },

  grid: {
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SERVICE_GAP,
    marginTop: Spacing.one,
  },

  trust: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.lg,
  },
});
