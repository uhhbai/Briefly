import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Canvas } from '@/components/ui/Canvas';
import { Chip } from '@/components/ui/Chip';
import { Divider } from '@/components/ui/Divider';
import { Icon, type IconName } from '@/components/ui/Icon';
import { LogoMark } from '@/components/ui/Logo';
import { TextField } from '@/components/ui/TextField';
import { CATEGORIES, formatPrice } from '@/lib/config';
import { haptic } from '@/lib/haptics';
import { createCheckoutSession, openCheckout } from '@/lib/payments';
import { supabase } from '@/lib/supabase';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/store/AuthContext';
import { useBrief } from '@/store/BriefContext';

type PanelKey = 'vendor' | 'payments' | 'addresses' | 'notifications' | 'support' | 'settings';

type MenuItem = {
  key: PanelKey;
  icon: IconName;
  label: string;
  hint: string;
};

type VendorProfile = {
  id: string;
  business_name: string;
  category_id: string;
  bio: string;
  service_area: string;
  verified: boolean;
};

type Address = {
  id: string;
  label: string;
  line1: string;
  unit: string | null;
  postal_code: string | null;
  country: string;
};

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

type RemoteOrder = {
  id: string;
  status: string;
  escrow_amount: number;
  created_at: string;
};

type PaymentSession = {
  id: string;
  order_id: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
};

const MENU: MenuItem[] = [
  { key: 'vendor', icon: 'tool', label: 'Become a vendor', hint: 'Create your public bidding profile' },
  { key: 'payments', icon: 'credit-card', label: 'Payment & escrow', hint: 'Fund pending jobs and check status' },
  { key: 'addresses', icon: 'map-pin', label: 'Saved addresses', hint: 'Store delivery or site addresses' },
  { key: 'notifications', icon: 'bell', label: 'Notifications', hint: 'Read updates from Briefly' },
  { key: 'support', icon: 'help-circle', label: 'Help & support', hint: 'Send a support request' },
  { key: 'settings', icon: 'settings', label: 'Settings', hint: 'Edit profile or sign out' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { orders } = useBrief();
  const [active, setActive] = useState<PanelKey>('vendor');
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [vendorForm, setVendorForm] = useState({
    business_name: '',
    category_id: CATEGORIES[0].id as string,
    bio: '',
    service_area: 'Singapore',
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    line1: '',
    unit: '',
    postal_code: '',
    country: 'Singapore',
  });
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [remoteOrders, setRemoteOrders] = useState<RemoteOrder[]>([]);
  const [paymentSessions, setPaymentSessions] = useState<PaymentSession[]>([]);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [settingsName, setSettingsName] = useState('');
  const [settingsLocation, setSettingsLocation] = useState('');
  const [checkoutOrderId, setCheckoutOrderId] = useState<string | null>(null);

  const unreadCount = notifications.filter((item) => !item.read_at).length;
  const pendingOrder = remoteOrders.find((order) => order.status === 'escrow_pending') ?? null;
  const fundedCount = remoteOrders.filter((order) => order.status === 'funded').length;
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Briefly user';

  const stats = useMemo(
    () => [
      { n: String(remoteOrders.length + orders.length), l: 'Briefs' },
      { n: String(fundedCount), l: 'Funded' },
      { n: vendorProfile?.verified ? 'Verified' : 'New', l: 'Status' },
    ],
    [fundedCount, orders.length, remoteOrders.length, vendorProfile?.verified]
  );

  const loadAccountData = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);

    try {
      const [vendorResult, addressResult, notificationResult, orderResult, paymentResult] = await Promise.all([
        supabase
          .from('vendor_profiles')
          .select('id, business_name, category_id, bio, service_area, verified')
          .eq('profile_id', user.id)
          .maybeSingle(),
        supabase
          .from('user_addresses')
          .select('id, label, line1, unit, postal_code, country')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('notifications')
          .select('id, title, body, read_at, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('orders')
          .select('id, status, escrow_amount, created_at')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('payment_sessions')
          .select('id, order_id, status, amount, currency, created_at')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (vendorResult.data) {
        const nextVendor = vendorResult.data as VendorProfile;
        setVendorProfile(nextVendor);
        setVendorForm({
          business_name: nextVendor.business_name,
          category_id: nextVendor.category_id,
          bio: nextVendor.bio,
          service_area: nextVendor.service_area,
        });
      }

      if (addressResult.data) setAddresses(addressResult.data as Address[]);
      if (notificationResult.data) setNotifications(notificationResult.data as NotificationRow[]);
      if (orderResult.data) setRemoteOrders(orderResult.data as RemoteOrder[]);
      if (paymentResult.data) setPaymentSessions(paymentResult.data as PaymentSession[]);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    const handle = setTimeout(() => {
      void loadAccountData();
    }, 0);

    return () => clearTimeout(handle);
  }, [loadAccountData]);

  function showNotice(text: string) {
    setError(null);
    setNotice(text);
  }

  function showError(err: unknown, fallback: string) {
    setNotice(null);
    setError(err instanceof Error ? err.message : fallback);
  }

  async function saveVendorProfile() {
    if (!user) return;
    if (!vendorForm.business_name.trim()) {
      setError('Add your business name first.');
      return;
    }

    setSaving('vendor');
    try {
      const { data, error: vendorError } = await supabase
        .from('vendor_profiles')
        .upsert(
          {
            profile_id: user.id,
            business_name: vendorForm.business_name.trim(),
            category_id: vendorForm.category_id,
            bio: vendorForm.bio.trim(),
            service_area: vendorForm.service_area.trim() || 'Singapore',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'profile_id' }
        )
        .select('id, business_name, category_id, bio, service_area, verified')
        .single();

      if (vendorError) throw vendorError;
      setVendorProfile(data as VendorProfile);
      await updateProfile({ role: 'vendor' });
      showNotice('Vendor profile saved. You can now receive and bid on briefs.');
    } catch (err) {
      showError(err, 'Could not save vendor profile.');
    } finally {
      setSaving(null);
    }
  }

  async function saveAddress() {
    if (!user) return;
    if (!addressForm.line1.trim()) {
      setError('Add the street or site address first.');
      return;
    }

    setSaving('address');
    try {
      const { error: addressError } = await supabase.from('user_addresses').insert({
        profile_id: user.id,
        label: addressForm.label.trim() || 'Address',
        line1: addressForm.line1.trim(),
        unit: addressForm.unit.trim() || null,
        postal_code: addressForm.postal_code.trim() || null,
        country: addressForm.country.trim() || 'Singapore',
      });

      if (addressError) throw addressError;
      setAddressForm({ label: 'Home', line1: '', unit: '', postal_code: '', country: 'Singapore' });
      await loadAccountData();
      showNotice('Address saved.');
    } catch (err) {
      showError(err, 'Could not save address.');
    } finally {
      setSaving(null);
    }
  }

  async function deleteAddress(id: string) {
    setSaving(id);
    try {
      const { error: deleteError } = await supabase.from('user_addresses').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setAddresses((items) => items.filter((item) => item.id !== id));
      showNotice('Address removed.');
    } catch (err) {
      showError(err, 'Could not remove address.');
    } finally {
      setSaving(null);
    }
  }

  async function markNotificationsRead() {
    if (!user) return;
    setSaving('notifications');
    try {
      const { error: notificationError } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);
      if (notificationError) throw notificationError;
      await loadAccountData();
      showNotice('Notifications marked as read.');
    } catch (err) {
      showError(err, 'Could not update notifications.');
    } finally {
      setSaving(null);
    }
  }

  async function sendTestNotification() {
    if (!user) return;
    setSaving('notify-test');
    try {
      const { error: notificationError } = await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Briefly check-in',
        body: 'Your notification centre is connected.',
      });
      if (notificationError) throw notificationError;
      await loadAccountData();
      showNotice('Test notification sent.');
    } catch (err) {
      showError(err, 'Could not create notification.');
    } finally {
      setSaving(null);
    }
  }

  async function sendSupportRequest() {
    if (!user) return;
    if (!supportSubject.trim() || !supportMessage.trim()) {
      setError('Add both a subject and message.');
      return;
    }

    setSaving('support');
    try {
      const { error: supportError } = await supabase.from('support_requests').insert({
        user_id: user.id,
        subject: supportSubject.trim(),
        message: supportMessage.trim(),
      });
      if (supportError) throw supportError;
      setSupportSubject('');
      setSupportMessage('');
      showNotice('Support request sent. It is saved in Supabase.');
    } catch (err) {
      showError(err, 'Could not send support request.');
    } finally {
      setSaving(null);
    }
  }

  async function saveSettings() {
    setSaving('settings');
    try {
      await updateProfile({
        display_name: settingsName.trim() || profile?.display_name || 'Briefly user',
        location: settingsLocation.trim() || profile?.location || 'Singapore',
      });
      showNotice('Profile settings saved.');
    } catch (err) {
      showError(err, 'Could not save settings.');
    } finally {
      setSaving(null);
    }
  }

  async function startCheckout(orderId: string) {
    setCheckoutOrderId(orderId);
    try {
      const checkout = await createCheckoutSession(orderId);
      await openCheckout(checkout.url);
      showNotice('Checkout opened. Stripe will update escrow after payment succeeds.');
      await loadAccountData();
    } catch (err) {
      showError(err, 'Could not open Stripe Checkout.');
    } finally {
      setCheckoutOrderId(null);
    }
  }

  async function handleSignOut() {
    setSaving('signout');
    try {
      await signOut();
    } finally {
      setSaving(null);
    }
  }

  function renderPanel() {
    if (active === 'vendor') {
      return (
        <Panel title="Vendor profile" icon="tool">
          <TextField
            label="Business name"
            value={vendorForm.business_name}
            onChangeText={(business_name) => setVendorForm((form) => ({ ...form, business_name }))}
            placeholder="Briefly Studio"
          />
          <View style={styles.chips}>
            {CATEGORIES.map((category) => (
              <Chip
                key={category.id}
                label={category.label}
                selected={vendorForm.category_id === category.id}
                onPress={() => setVendorForm((form) => ({ ...form, category_id: category.id }))}
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
            placeholder="Tell buyers what you are best at."
            multiline
          />
          <Button
            title={vendorProfile ? 'Update vendor profile' : 'Create vendor profile'}
            iconRight="check-circle"
            loading={saving === 'vendor'}
            onPress={saveVendorProfile}
          />
        </Panel>
      );
    }

    if (active === 'payments') {
      return (
        <Panel title="Payment & escrow" icon="shield">
          <View style={styles.statusGrid}>
            <StatusTile label="Remote orders" value={String(remoteOrders.length)} />
            <StatusTile label="Funded" value={String(fundedCount)} />
            <StatusTile label="Checkout sessions" value={String(paymentSessions.length)} />
          </View>
          {pendingOrder ? (
            <View style={[styles.compactCard, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="smallBold">Pending escrow</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatPrice(pendingOrder.escrow_amount)} is waiting for Stripe Checkout.
              </ThemedText>
              <Button
                title="Open Stripe Checkout"
                iconRight="external-link"
                loading={checkoutOrderId === pendingOrder.id}
                onPress={() => startCheckout(pendingOrder.id)}
              />
            </View>
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              Accept a bid to create an escrow order. Card details are handled by Stripe Checkout, not stored in the app.
            </ThemedText>
          )}
          <Button
            title="Refresh payment status"
            variant="secondary"
            iconRight="refresh-cw"
            loading={refreshing}
            onPress={loadAccountData}
          />
          {remoteOrders.map((order) => (
            <View key={order.id} style={[styles.inlineRow, { borderColor: theme.border }]}>
              <View style={{ flex: 1 }}>
                <ThemedText type="label">{formatPrice(order.escrow_amount)}</ThemedText>
                <ThemedText type="small" themeColor="muted">
                  {order.status}
                </ThemedText>
              </View>
              {order.status === 'escrow_pending' ? (
                <Button
                  title="Pay"
                  variant="secondary"
                  loading={checkoutOrderId === order.id}
                  onPress={() => startCheckout(order.id)}
                  style={styles.smallButton}
                />
              ) : (
                <Icon name="check-circle" color={theme.success} />
              )}
            </View>
          ))}
        </Panel>
      );
    }

    if (active === 'addresses') {
      return (
        <Panel title="Saved addresses" icon="map-pin">
          <TextField
            label="Label"
            value={addressForm.label}
            onChangeText={(label) => setAddressForm((form) => ({ ...form, label }))}
            placeholder="Home"
          />
          <TextField
            label="Address"
            value={addressForm.line1}
            onChangeText={(line1) => setAddressForm((form) => ({ ...form, line1 }))}
            placeholder="Block, street, building"
          />
          <View style={styles.twoCols}>
            <TextField
              label="Unit"
              value={addressForm.unit}
              onChangeText={(unit) => setAddressForm((form) => ({ ...form, unit }))}
              placeholder="#12-34"
              containerStyle={styles.flexField}
            />
            <TextField
              label="Postal code"
              value={addressForm.postal_code}
              onChangeText={(postal_code) => setAddressForm((form) => ({ ...form, postal_code }))}
              placeholder="123456"
              keyboardType="number-pad"
              containerStyle={styles.flexField}
            />
          </View>
          <Button title="Save address" iconRight="check-circle" loading={saving === 'address'} onPress={saveAddress} />
          {addresses.map((address) => (
            <View key={address.id} style={[styles.inlineRow, { borderColor: theme.border }]}>
              <View style={{ flex: 1 }}>
                <ThemedText type="label">{address.label}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {[address.line1, address.unit, address.postal_code, address.country].filter(Boolean).join(', ')}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => deleteAddress(address.id)}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${address.label}`}
                style={styles.iconButton}>
                <Icon name="trash-2" size={18} color={theme.danger} />
              </Pressable>
            </View>
          ))}
        </Panel>
      );
    }

    if (active === 'notifications') {
      return (
        <Panel title="Notifications" icon="bell">
          <View style={styles.actionRow}>
            <Button
              title="Mark read"
              variant="secondary"
              iconRight="check-circle"
              loading={saving === 'notifications'}
              onPress={markNotificationsRead}
              style={styles.actionButton}
            />
            <Button
              title="Send test"
              variant="secondary"
              iconRight="send"
              loading={saving === 'notify-test'}
              onPress={sendTestNotification}
              style={styles.actionButton}
            />
          </View>
          {notifications.length ? (
            notifications.map((item) => (
              <View key={item.id} style={[styles.inlineRow, { borderColor: item.read_at ? theme.border : theme.tint }]}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="label">{item.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.body}
                  </ThemedText>
                </View>
                {!item.read_at ? <View style={[styles.unreadDot, { backgroundColor: theme.tint }]} /> : null}
              </View>
            ))
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              No notifications yet.
            </ThemedText>
          )}
        </Panel>
      );
    }

    if (active === 'support') {
      return (
        <Panel title="Help & support" icon="help-circle">
          <TextField label="Subject" value={supportSubject} onChangeText={setSupportSubject} placeholder="Payment question" />
          <TextField
            label="Message"
            value={supportMessage}
            onChangeText={setSupportMessage}
            placeholder="Tell us what happened."
            multiline
          />
          <Button title="Send support request" iconRight="send" loading={saving === 'support'} onPress={sendSupportRequest} />
        </Panel>
      );
    }

    return (
      <Panel title="Settings" icon="settings">
        <TextField
          label="Display name"
          value={settingsName || profile?.display_name || ''}
          onChangeText={setSettingsName}
          placeholder="Your name"
        />
        <TextField
          label="Location"
          value={settingsLocation || profile?.location || ''}
          onChangeText={setSettingsLocation}
          placeholder="Singapore"
        />
        <Button title="Save settings" iconRight="check-circle" loading={saving === 'settings'} onPress={saveSettings} />
        <Button title="Sign out" variant="ghost" iconRight="log-out" loading={saving === 'signout'} onPress={handleSignOut} />
      </Panel>
    );
  }

  return (
    <Canvas>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.headerLine}>
            <ThemedText type="title">Account</ThemedText>
            <LogoMark size={42} />
          </View>

          <Animated.View entering={FadeInDown.duration(340)} style={styles.identity}>
            <View style={[styles.avatar, { borderColor: theme.border }]}>
              <Icon name="user" size={24} color={theme.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="subtitle">{displayName}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {profile?.location || 'Singapore'} - {profile?.role || 'buyer'} account
              </ThemedText>
            </View>
            {unreadCount ? (
              <View style={[styles.badge, { backgroundColor: theme.tintSoft }]}>
                <ThemedText type="smallBold" style={{ color: theme.tint }}>
                  {unreadCount} unread
                </ThemedText>
              </View>
            ) : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(340)} style={styles.stats}>
            {stats.map((stat, i) => (
              <View key={stat.l} style={styles.statBox}>
                {i > 0 ? <View style={[styles.vRule, { backgroundColor: theme.border }]} /> : null}
                <ThemedText type="title" style={{ fontSize: 24 }} numberOfLines={1}>
                  {stat.n}
                </ThemedText>
                <ThemedText type="eyebrow" themeColor="muted">
                  {stat.l}
                </ThemedText>
              </View>
            ))}
          </Animated.View>

          <View style={styles.menu}>
            {MENU.map((item, i) => (
              <Animated.View key={item.key} entering={FadeInDown.delay(120 + i * 38).duration(300)}>
                {i > 0 ? <Divider /> : null}
                <Pressable
                  onPress={() => {
                    haptic.light();
                    setNotice(null);
                    setError(null);
                    setActive(item.key);
                  }}
                  style={({ pressed }) => [
                    styles.menuRow,
                    active === item.key && { backgroundColor: theme.tintSoft },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <Icon name={item.icon} size={19} color={active === item.key ? theme.tint : theme.text} />
                  <View style={{ flex: 1 }}>
                    <ThemedText type="label">{item.label}</ThemedText>
                    <ThemedText type="small" themeColor="muted">
                      {item.hint}
                    </ThemedText>
                  </View>
                  <Icon name="chevron-right" size={18} color={theme.muted} />
                </Pressable>
              </Animated.View>
            ))}
          </View>

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

          <Animated.View entering={FadeInDown.delay(160).duration(320)}>{renderPanel()}</Animated.View>

          <ThemedText type="small" themeColor="muted" style={{ textAlign: 'center', marginTop: Spacing.four }}>
            Briefly v1.0 - beta
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </Canvas>
  );
}

function Panel({ title, icon, children }: { title: string; icon: IconName; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.panel, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.panelHead}>
        <Icon name={icon} color={theme.tint} />
        <ThemedText type="subtitle">{title}</ThemedText>
      </View>
      {children}
    </View>
  );
}

function StatusTile({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.statusTile, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="title" style={{ fontSize: 22 }} numberOfLines={1}>
        {value}
      </ThemedText>
      <ThemedText type="eyebrow" themeColor="muted">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.huge,
    gap: Spacing.four,
  },
  headerLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { borderRadius: Radius.pill, paddingHorizontal: Spacing.two, paddingVertical: 5 },
  stats: { flexDirection: 'row' },
  statBox: { flex: 1, alignItems: 'center', gap: 4, position: 'relative' },
  vRule: { position: 'absolute', left: 0, top: 6, bottom: 6, width: StyleSheet.hairlineWidth },
  menu: {},
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
  },
  panel: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  statusGrid: { flexDirection: 'row', gap: Spacing.two },
  statusTile: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  compactCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  smallButton: { minHeight: 42, paddingHorizontal: Spacing.three },
  twoCols: { flexDirection: 'row', gap: Spacing.two },
  flexField: { flex: 1 },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  actionRow: { flexDirection: 'row', gap: Spacing.two },
  actionButton: { flex: 1 },
  unreadDot: { width: 9, height: 9, borderRadius: Radius.pill },
});
