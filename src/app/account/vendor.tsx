import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORIES } from '@/lib/config';
import type { CategoryId } from '@/lib/types';
import { pickAndUploadImage } from '@/lib/upload';
import { loadVendorProfile, saveVendorProfileForUser } from '@/lib/vendorMarketplace';
import { useAuth } from '@/store/AuthContext';

export default function BecomeVendor() {
  const theme = useTheme();
  const toast = useToast();
  const { user, profile, updateProfile } = useAuth();
  const [form, setForm] = useState({
    business_name: profile?.display_name ?? '',
    category_id: CATEGORIES[0].id as CategoryId,
    service_area: 'Singapore',
    bio: '',
    logo_url: '' as string,
  });
  const [existing, setExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    loadVendorProfile(user.id)
      .then((vp) => {
        if (!alive || !vp) return;
        setExisting(true);
        setForm({
          business_name: vp.business_name,
          category_id: vp.category_id,
          service_area: vp.service_area,
          bio: vp.bio,
          logo_url: vp.logo_url ?? '',
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [user]);

  async function uploadLogo() {
    setUploading(true);
    try {
      const url = await pickAndUploadImage('logos');
      if (url) {
        setForm((f) => ({ ...f, logo_url: url }));
        toast.success('Logo uploaded.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload logo.');
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!user) return;
    if (!form.business_name.trim()) {
      toast.error('Add your business or display name.');
      return;
    }
    setSaving(true);
    try {
      await saveVendorProfileForUser(user.id, {
        business_name: form.business_name,
        category_id: form.category_id,
        bio: form.bio,
        service_area: form.service_area,
        logo_url: form.logo_url || null,
      });
      await updateProfile({ role: 'vendor' });
      toast.success('Vendor profile saved. Opening your workspace…');
      router.replace('/vendor-dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save vendor profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      showBack
      showHome
      eyebrow="Account"
      title={existing ? 'Your vendor profile' : 'Become a vendor'}
      subtitle="Create the storefront buyers see when your bid lands, then add services from your workspace."
      footer={
        <Button
          title={existing ? 'Save & open workspace' : 'Create vendor profile'}
          iconRight="arrow-right"
          loading={saving}
          onPress={save}
        />
      }>
      <View style={styles.logoRow}>
        <View style={[styles.logoPreview, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
          {form.logo_url ? (
            <Image source={{ uri: form.logo_url }} style={styles.logoImage} contentFit="cover" />
          ) : (
            <Icon name="image" size={22} color={theme.muted} />
          )}
        </View>
        <View style={{ flex: 1, gap: Spacing.two }}>
          <ThemedText type="small" themeColor="textSecondary">
            Company logo — shown on your storefront and vendor page.
          </ThemedText>
          <Button
            title={form.logo_url ? 'Change logo' : 'Upload logo'}
            variant="secondary"
            iconRight="upload"
            loading={uploading}
            onPress={uploadLogo}
          />
        </View>
      </View>

      <TextField
        label="Business name"
        value={form.business_name}
        onChangeText={(business_name) => setForm((f) => ({ ...f, business_name }))}
        placeholder="Briefly Studio"
      />
      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            label={c.label}
            selected={form.category_id === c.id}
            onPress={() => setForm((f) => ({ ...f, category_id: c.id }))}
          />
        ))}
      </View>
      <TextField
        label="Service area"
        value={form.service_area}
        onChangeText={(service_area) => setForm((f) => ({ ...f, service_area }))}
        placeholder="Singapore"
      />
      <TextField
        label="Company description"
        value={form.bio}
        onChangeText={(bio) => setForm((f) => ({ ...f, bio }))}
        placeholder="Tell buyers what you make and what you're best at."
        multiline
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoRow: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  logoPreview: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: { width: '100%', height: '100%' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
