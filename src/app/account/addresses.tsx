import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/AuthContext';

type Address = {
  id: string;
  label: string;
  line1: string;
  unit: string | null;
  postal_code: string | null;
  country: string;
};

export default function AccountAddresses() {
  const theme = useTheme();
  const toast = useToast();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [form, setForm] = useState({ label: 'Home', line1: '', unit: '', postal_code: '', country: 'Singapore' });

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_addresses')
      .select('id, label, line1, unit, postal_code, country')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setAddresses(data as Address[]);
  }, [user]);

  useEffect(() => {
    const h = setTimeout(() => void load(), 0);
    return () => clearTimeout(h);
  }, [load]);

  async function save() {
    if (!user) return;
    if (!form.line1.trim()) {
      toast.error('Add the street or site address first.');
      return;
    }
    setSaving('add');
    try {
      const { error } = await supabase.from('user_addresses').insert({
        profile_id: user.id,
        label: form.label.trim() || 'Address',
        line1: form.line1.trim(),
        unit: form.unit.trim() || null,
        postal_code: form.postal_code.trim() || null,
        country: form.country.trim() || 'Singapore',
      });
      if (error) throw error;
      setForm({ label: 'Home', line1: '', unit: '', postal_code: '', country: 'Singapore' });
      await load();
      toast.success('Address saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save address.');
    } finally {
      setSaving(null);
    }
  }

  async function remove(id: string) {
    setSaving(id);
    try {
      const { error } = await supabase.from('user_addresses').delete().eq('id', id);
      if (error) throw error;
      setAddresses((items) => items.filter((a) => a.id !== id));
      toast.success('Address removed.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove address.');
    } finally {
      setSaving(null);
    }
  }

  return (
    <Screen showBack showHome eyebrow="Account" title="Saved addresses" subtitle="Delivery or on-site addresses for your jobs.">
      <TextField label="Label" value={form.label} onChangeText={(label) => setForm((f) => ({ ...f, label }))} placeholder="Home" />
      <TextField
        label="Address"
        value={form.line1}
        onChangeText={(line1) => setForm((f) => ({ ...f, line1 }))}
        placeholder="Block, street, building"
      />
      <View style={styles.twoCols}>
        <TextField
          label="Unit"
          value={form.unit}
          onChangeText={(unit) => setForm((f) => ({ ...f, unit }))}
          placeholder="#12-34"
          containerStyle={styles.flexField}
        />
        <TextField
          label="Postal code"
          value={form.postal_code}
          onChangeText={(postal_code) => setForm((f) => ({ ...f, postal_code }))}
          placeholder="123456"
          keyboardType="number-pad"
          containerStyle={styles.flexField}
        />
      </View>
      <Button title="Save address" iconRight="check-circle" loading={saving === 'add'} onPress={save} />

      {addresses.map((address) => (
        <View key={address.id} style={[styles.row, { borderColor: theme.border }]}>
          <View style={{ flex: 1 }}>
            <ThemedText type="label">{address.label}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {[address.line1, address.unit, address.postal_code, address.country].filter(Boolean).join(', ')}
            </ThemedText>
          </View>
          <Pressable
            onPress={() => remove(address.id)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${address.label}`}
            style={styles.iconBtn}>
            <Icon name="trash-2" size={18} color={theme.danger} />
          </Pressable>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  twoCols: { flexDirection: 'row', gap: Spacing.two },
  flexField: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.pill },
});
