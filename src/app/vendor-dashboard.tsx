import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { CATEGORIES } from '@/lib/config';
import {
  loadOpenBriefs,
  loadVendorProfile,
  saveVendorProfileForUser,
  submitVendorBid,
  type VendorBrief,
  type VendorProfileRow,
} from '@/lib/vendorMarketplace';
import type { CategoryId } from '@/lib/types';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptic } from '@/lib/haptics';
import { useAuth } from '@/store/AuthContext';

type CategoryFilter = 'all' | CategoryId;

export default function VendorDashboardScreen() {
  const theme = useTheme();
  const { user, profile, signOut, updateProfile } = useAuth();
  const [vendorProfile, setVendorProfile] = useState<VendorProfileRow | null>(null);
  const [briefs, setBriefs] = useState<VendorBrief[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vendorForm, setVendorForm] = useState({
    business_name: profile?.display_name ?? '',
    category_id: CATEGORIES[0].id,
    bio: '',
    service_area: 'Singapore',
  });
  const [bidForm, setBidForm] = useState({
    price: '',
    etaDays: '7',
    message: '',
  });

  const filteredBriefs = useMemo(
    () => (category === 'all' ? briefs : briefs.filter((brief) => brief.category.id === category)),
    [briefs, category]
  );
  const selectedBrief = filteredBriefs.find((brief) => brief.id === selectedId) ?? filteredBriefs[0] ?? null;

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const [nextVendor, nextBriefs] = await Promise.all([loadVendorProfile(user.id), loadOpenBriefs()]);
      setVendorProfile(nextVendor);
      setBriefs(nextBriefs);
      if (nextVendor) {
        setVendorForm({
          business_name: nextVendor.business_name,
          category_id: nextVendor.category_id,
          bio: nextVendor.bio,
          service_area: nextVendor.service_area,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load vendor dashboard.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const handle = setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => clearTimeout(handle);
  }, [loadDashboard]);

  async function saveProfile() {
    if (!user) return;
    if (!vendorForm.business_name.trim()) {
      setError('Add your vendor or business name.');
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const next = await saveVendorProfileForUser(user.id, {
        business_name: vendorForm.business_name,
        category_id: vendorForm.category_id,
        bio: vendorForm.bio,
        service_area: vendorForm.service_area,
      });
      setVendorProfile(next);
      await updateProfile({ role: 'vendor' });
      setNotice('Vendor profile saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save vendor profile.');
    } finally {
      setSaving(false);
    }
  }

  async function submitBid() {
    if (!selectedBrief || !vendorProfile) return;

    const price = Number.parseInt(bidForm.price, 10);
    const etaDays = Number.parseInt(bidForm.etaDays, 10);

    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(etaDays) || etaDays <= 0 || !bidForm.message.trim()) {
      setError('Add a price, timeline, and short pitch before submitting.');
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      await submitVendorBid({
        briefId: selectedBrief.id,
        profile: vendorProfile,
        price,
        etaDays,
        message: bidForm.message,
      });
      setBidForm({ price: '', etaDays: '7', message: '' });
      setNotice(`Bid submitted for ${selectedBrief.title}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit this bid.');
    } finally {
      setSaving(false);
    }
  }

  async function switchToBuyer() {
    setSaving(true);
    try {
      await updateProfile({ role: 'buyer' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      eyebrow="Vendor workspace"
      title={`Welcome${profile?.display_name ? `, ${profile.display_name}` : ''}`}
      subtitle="Browse open buyer briefs, pick the jobs that fit your craft, and send a bid."
      footer={
        <View style={styles.footerActions}>
          <Button title="Refresh briefs" variant="secondary" iconRight="refresh-cw" loading={loading} onPress={loadDashboard} />
          <Button title="Sign out" variant="ghost" iconRight="log-out" onPress={signOut} />
        </View>
      }>
      {notice ? (
        <ThemedText type="smallBold" themeColor="success">
          {notice}
        </ThemedText>
      ) : null}
      {error ? (
        <ThemedText type="smallBold" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}

      <View style={[styles.vendorSetup, { borderColor: theme.border, backgroundColor: theme.card }]}>
        <View style={styles.panelHeader}>
          <Icon name="briefcase" color={theme.tint} />
          <View style={{ flex: 1 }}>
            <ThemedText type="subtitle">{vendorProfile ? 'Vendor profile' : 'Set up your vendor profile'}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Buyers will see this name when your bid lands.
            </ThemedText>
          </View>
        </View>
        <TextField
          label="Business name"
          value={vendorForm.business_name}
          onChangeText={(business_name) => setVendorForm((form) => ({ ...form, business_name }))}
          placeholder="Briefly Studio"
        />
        <View style={styles.chips}>
          {CATEGORIES.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              selected={vendorForm.category_id === item.id}
              onPress={() => setVendorForm((form) => ({ ...form, category_id: item.id }))}
            />
          ))}
        </View>
        <TextField
          label="Service area"
          value={vendorForm.service_area}
          onChangeText={(service_area) => setVendorForm((form) => ({ ...form, service_area }))}
          placeholder="Singapore"
        />
        <TextField
          label="Short pitch"
          value={vendorForm.bio}
          onChangeText={(bio) => setVendorForm((form) => ({ ...form, bio }))}
          placeholder="What jobs are you best at?"
          multiline
        />
        <View style={styles.actionRow}>
          <Button title="Save vendor profile" iconRight="check-circle" loading={saving} onPress={saveProfile} style={styles.actionButton} />
          <Button title="Buyer mode" variant="secondary" onPress={switchToBuyer} style={styles.actionButton} />
        </View>
      </View>

      <View style={styles.sectionHead}>
        <ThemedText type="eyebrow" themeColor="muted">
          Open briefs
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {filteredBriefs.length} available
        </ThemedText>
      </View>

      <View style={styles.chips}>
        <Chip label="All" selected={category === 'all'} onPress={() => setCategory('all')} />
        {CATEGORIES.map((item) => (
          <Chip key={item.id} label={item.label} selected={category === item.id} onPress={() => setCategory(item.id)} />
        ))}
      </View>

      {filteredBriefs.length ? (
        <View style={styles.briefGrid}>
          <View style={styles.listColumn}>
            {filteredBriefs.map((brief, index) => (
              <Animated.View key={brief.id} entering={FadeInDown.delay(index * 45).duration(260)}>
                <BriefCard
                  brief={brief}
                  selected={brief.id === selectedBrief?.id}
                  onPress={() => {
                    haptic.light();
                    setSelectedId(brief.id);
                  }}
                />
              </Animated.View>
            ))}
          </View>

          {selectedBrief ? (
            <View style={[styles.detailPanel, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <View style={styles.panelHeader}>
                <Icon name="file-text" color={theme.tint} />
                <View style={{ flex: 1 }}>
                  <ThemedText type="subtitle">{selectedBrief.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {selectedBrief.category.label}
                  </ThemedText>
                </View>
              </View>
              <ThemedText themeColor="textSecondary">{selectedBrief.summary}</ThemedText>
              <Divider />
              {selectedBrief.fields.map((field) => (
                <View key={field.field_key} style={styles.fieldRow}>
                  <ThemedText type="small" themeColor="muted">
                    {field.label}
                  </ThemedText>
                  <ThemedText type="smallBold" style={{ textAlign: 'right', flexShrink: 1 }}>
                    {field.value ?? 'Not specified'}
                  </ThemedText>
                </View>
              ))}
              {selectedBrief.budget_note ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {selectedBrief.budget_note}
                </ThemedText>
              ) : null}
              <Divider />
              <TextField
                label="Your price"
                value={bidForm.price}
                onChangeText={(price) => setBidForm((form) => ({ ...form, price }))}
                placeholder="680"
                keyboardType="number-pad"
              />
              <TextField
                label="Timeline in days"
                value={bidForm.etaDays}
                onChangeText={(etaDays) => setBidForm((form) => ({ ...form, etaDays }))}
                placeholder="7"
                keyboardType="number-pad"
              />
              <TextField
                label="Pitch"
                value={bidForm.message}
                onChangeText={(message) => setBidForm((form) => ({ ...form, message }))}
                placeholder="Tell the buyer why your offer fits."
                multiline
              />
              <Button
                title={vendorProfile ? 'Submit bid' : 'Save vendor profile first'}
                iconRight="send"
                disabled={!vendorProfile}
                loading={saving}
                onPress={submitBid}
              />
            </View>
          ) : null}
        </View>
      ) : (
        <Card>
          <ThemedText type="subtitle">No open briefs yet</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            When buyers post briefs, they will appear here by category. Refresh after creating a buyer brief in another account.
          </ThemedText>
        </Card>
      )}
    </Screen>
  );
}

function BriefCard({ brief, selected, onPress }: { brief: VendorBrief; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.briefCard,
        {
          backgroundColor: theme.card,
          borderColor: selected ? theme.tint : theme.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}>
      <View style={styles.cardTop}>
        <ThemedText type="eyebrow" style={{ color: theme.tint }}>
          {brief.category.label}
        </ThemedText>
        <Icon name={selected ? 'check-circle' : 'chevron-right'} size={16} color={selected ? theme.tint : theme.muted} />
      </View>
      <ThemedText type="subtitle" style={{ fontSize: 19 }} numberOfLines={2}>
        {brief.title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
        {brief.summary}
      </ThemedText>
      <ThemedText type="smallBold" themeColor="muted">
        {brief.budget_note?.match(/S\$\d[\d,]*/)?.[0] ?? 'Open budget'}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  vendorSetup: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  actionRow: { flexDirection: 'row', gap: Spacing.two },
  actionButton: { flex: 1 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  briefGrid: { gap: Spacing.three },
  listColumn: { gap: Spacing.three },
  briefCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  detailPanel: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three },
  footerActions: { gap: Spacing.two },
});
