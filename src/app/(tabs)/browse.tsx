import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ServiceCard, VendorCard } from '@/components/marketplace';
import { Canvas } from '@/components/ui/Canvas';
import { Chip } from '@/components/ui/Chip';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import { Radius, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORIES } from '@/lib/config';
import { fetchCategories, searchCatalog } from '@/lib/db';
import type { Category, CategoryId, Service, Vendor } from '@/lib/types';

export default function BrowseScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<CategoryId | 'all'>((params.category as CategoryId) ?? 'all');
  const [cats, setCats] = useState<Category[]>(CATEGORIES.filter((c) => c.id !== 'other'));
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    let active = true;
    fetchCategories().then((nextCats) => {
      if (active) setCats(nextCats.filter((c) => c.id !== 'other'));
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    searchCatalog(query).then((base) => {
      if (!active) return;
      const next =
        activeCat === 'all'
          ? base
          : {
              vendors: base.vendors.filter((v) => v.categoryId === activeCat),
              services: base.services.filter((s) => s.categoryId === activeCat),
            };
      setVendors(next.vendors);
      setServices(next.services);
    });
    return () => {
      active = false;
    };
  }, [query, activeCat]);

  const empty = vendors.length === 0 && services.length === 0;

  return (
    <Canvas>
      <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <ThemedText type="title">Browse</ThemedText>
        <View style={[styles.search, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Icon name="search" size={17} color={theme.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search services or makers"
            placeholderTextColor={theme.muted}
            style={[styles.searchInput, { color: theme.text, fontFamily: Type.sans }]}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <Chip label="All" selected={activeCat === 'all'} onPress={() => setActiveCat('all')} />
          {cats.map((c) => (
            <Chip
              key={c.id}
              label={c.label.split(' &')[0]}
              selected={activeCat === c.id}
              onPress={() => setActiveCat(c.id)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {empty ? (
          <View style={styles.emptyWrap}>
            <Icon name="search" size={28} color={theme.muted} />
            <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
              Nothing matches “{query}”
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center', maxWidth: 280 }}>
              Can’t find it? Describe exactly what you want and let makers bid for the work.
            </ThemedText>
          </View>
        ) : (
          <>
            {services.length > 0 && (
              <Animated.View layout={LinearTransition}>
                <ThemedText type="eyebrow" themeColor="muted" style={styles.sectionTitle}>
                  Listings · {services.length}
                </ThemedText>
                <View style={styles.grid}>
                  {services.map((s, i) => (
                    <Animated.View key={s.id} entering={FadeInDown.delay(i * 40).duration(300)} style={{ width: '47%' }}>
                      <ServiceCard service={s} width="100%" />
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            )}

            {vendors.length > 0 && (
              <Animated.View layout={LinearTransition} style={{ marginTop: Spacing.section }}>
                <ThemedText type="eyebrow" themeColor="muted" style={styles.sectionTitle}>
                  Makers · {vendors.length}
                </ThemedText>
                <View>
                  {vendors.map((v, i) => (
                    <Animated.View key={v.id} entering={FadeInDown.delay(i * 40).duration(300)}>
                      {i > 0 && <Divider />}
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
    </Canvas>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerWrap: { paddingHorizontal: Spacing.gutter, paddingTop: Spacing.two, gap: Spacing.three },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 50,
  },
  searchInput: { flex: 1, fontSize: 16 },
  filters: { gap: Spacing.two, paddingVertical: Spacing.one, paddingRight: Spacing.three },
  scroll: { paddingHorizontal: Spacing.gutter, paddingTop: Spacing.four, paddingBottom: Spacing.huge },
  sectionTitle: { marginBottom: Spacing.three },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.five },
  emptyWrap: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.huge },
});
