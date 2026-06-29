import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ServiceCard, VendorCard } from '@/components/marketplace';
import { Chip } from '@/components/ui/Chip';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { searchCatalog } from '@/lib/catalog';
import { CATEGORIES } from '@/lib/config';
import type { CategoryId } from '@/lib/types';

export default function BrowseScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<CategoryId | 'all'>(
    (params.category as CategoryId) ?? 'all'
  );

  const { vendors, services } = useMemo(() => {
    const base = searchCatalog(query);
    if (activeCat === 'all') return base;
    return {
      vendors: base.vendors.filter((v) => v.categoryId === activeCat),
      services: base.services.filter((s) => s.categoryId === activeCat),
    };
  }, [query, activeCat]);

  const cats = CATEGORIES.filter((c) => c.id !== 'other');
  const empty = vendors.length === 0 && services.length === 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.headerWrap}>
        <ThemedText type="subtitle" style={styles.title}>
          Browse
        </ThemedText>
        {/* Search */}
        <View style={[styles.search, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText style={{ fontSize: 16 }}>🔎</ThemedText>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search services or vendors…"
            placeholderTextColor={theme.muted}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>
        {/* Category filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}>
          <Chip label="All" selected={activeCat === 'all'} onPress={() => setActiveCat('all')} />
          {cats.map((c) => (
            <Chip
              key={c.id}
              label={`${c.emoji} ${c.label.split(' &')[0]}`}
              selected={activeCat === c.id}
              onPress={() => setActiveCat(c.id)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {empty ? (
          <View style={styles.emptyWrap}>
            <ThemedText style={{ fontSize: 40 }}>🤷</ThemedText>
            <ThemedText type="default" style={{ fontWeight: '700' }}>
              Nothing matches “{query}”
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
              Can’t find it? Describe exactly what you want and let vendors bid.
            </ThemedText>
          </View>
        ) : (
          <>
            {services.length > 0 && (
              <Animated.View layout={LinearTransition}>
                <ThemedText type="default" style={styles.sectionTitle}>
                  Services ({services.length})
                </ThemedText>
                <View style={styles.grid}>
                  {services.map((s, i) => (
                    <Animated.View
                      key={s.id}
                      entering={FadeInDown.delay(i * 40).duration(300)}
                      style={{ width: '48%' }}>
                      <ServiceCard service={s} width="100%" />
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            )}

            {vendors.length > 0 && (
              <Animated.View layout={LinearTransition}>
                <ThemedText type="default" style={styles.sectionTitle}>
                  Vendors ({vendors.length})
                </ThemedText>
                <View style={styles.vendorList}>
                  {vendors.map((v, i) => (
                    <Animated.View
                      key={v.id}
                      entering={FadeInDown.delay(i * 40).duration(300)}
                      style={{ width: '100%' }}>
                      <VendorCard vendor={v} full />
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerWrap: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: Spacing.two },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 48,
  },
  searchInput: { flex: 1, fontSize: 16 },
  filters: { gap: Spacing.two, paddingVertical: Spacing.one, paddingRight: Spacing.three },
  scroll: { padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.two },
  sectionTitle: { fontWeight: '800', fontSize: 17, marginBottom: Spacing.two, marginTop: Spacing.two },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.three },
  vendorList: { gap: Spacing.three },
  emptyWrap: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.six },
});
