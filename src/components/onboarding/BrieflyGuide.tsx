import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, usePathname } from 'expo-router';
import type { Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, type DimensionValue, useWindowDimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/store/AuthContext';

type Anchor = 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right';

type TourStep = {
  route: Href;
  title: string;
  body: string;
  anchor: Anchor;
  spotlight: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};

const buyerTour: TourStep[] = [
  {
    route: '/',
    title: 'This is your buyer home.',
    body: 'Start here when you want something made. The big action is Start a brief.',
    anchor: 'bottom-left',
    spotlight: { top: 24, left: 8, width: 84, height: 46 },
  },
  {
    route: '/describe',
    title: 'Describe the job.',
    body: 'Type what you want in plain English. Briefly turns messy ideas into a clean spec.',
    anchor: 'bottom-right',
    spotlight: { top: 24, left: 6, width: 88, height: 34 },
  },
  {
    route: '/briefs',
    title: 'Your posted briefs live here.',
    body: 'After creating a brief, you can come back here instead of feeling trapped in the flow.',
    anchor: 'top-right',
    spotlight: { top: 16, left: 5, width: 90, height: 62 },
  },
  {
    route: '/account/payments',
    title: 'Payments stay protected.',
    body: 'When you accept a bid, checkout happens inside Briefly and Stripe keeps card details secure.',
    anchor: 'top-left',
    spotlight: { top: 38, left: 6, width: 88, height: 32 },
  },
  {
    route: '/account/settings',
    title: 'Account settings are the control room.',
    body: 'Update your profile, connect Telegram alerts, and sign out when you want to use another account type.',
    anchor: 'top-left',
    spotlight: { top: 20, left: 6, width: 88, height: 60 },
  },
];

const vendorTour: TourStep[] = [
  {
    route: '/vendor-dashboard',
    title: 'This is your vendor home.',
    body: 'You do not switch into buyer mode here. This account is your vendor website inside Briefly.',
    anchor: 'bottom-left',
    spotlight: { top: 12, left: 4, width: 92, height: 24 },
  },
  {
    route: '/vendor-dashboard',
    title: 'Set up your storefront.',
    body: 'Add your business name, logo, service area, and pitch so buyers know what you offer.',
    anchor: 'bottom-right',
    spotlight: { top: 23, left: 5, width: 90, height: 26 },
  },
  {
    route: '/vendor-dashboard',
    title: 'List your services.',
    body: 'Your services are the products buyers can understand quickly: title, photo, price, and timeline.',
    anchor: 'top-right',
    spotlight: { top: 48, left: 5, width: 90, height: 22 },
  },
  {
    route: '/vendor-dashboard',
    title: 'Browse open briefs.',
    body: 'Scroll to the open briefs section, pick jobs that fit your craft, and submit a quote.',
    anchor: 'top-left',
    spotlight: { top: 72, left: 5, width: 90, height: 22 },
  },
  {
    route: '/account/settings',
    title: 'Use sign out to change roles.',
    body: 'Buyer and vendor are separate account types. To use the other side, sign out and log in with that account.',
    anchor: 'top-left',
    spotlight: { top: 20, left: 6, width: 88, height: 60 },
  },
];

const tourVersion = 'v2-route-tour';

export function BrieflyGuide() {
  const theme = useTheme();
  const pathname = usePathname();
  const { height, width } = useWindowDimensions();
  const { profile, user, loading } = useAuth();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const bob = useSharedValue(0);

  const role = profile?.role === 'vendor' ? 'vendor' : 'buyer';
  const steps = useMemo(() => (role === 'vendor' ? vendorTour : buyerTour), [role]);
  const storageKey = user?.id ? `briefly-guide-seen:${tourVersion}:${user.id}:${role}` : null;
  const current = steps[step];

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(withTiming(-10, { duration: 760 }), withTiming(0, { duration: 760 })),
      -1,
      true
    );
  }, [bob]);

  useEffect(() => {
    if (loading || !profile || !storageKey) return;

    let alive = true;
    AsyncStorage.getItem(storageKey)
      .then((seen) => {
        if (!alive || seen) return;
        setStep(0);
        setVisible(true);
        router.replace(steps[0].route);
      })
      .catch(() => {
        if (!alive) return;
        setStep(0);
        setVisible(true);
        router.replace(steps[0].route);
      });
    return () => {
      alive = false;
    };
  }, [loading, profile, steps, storageKey]);

  useEffect(() => {
    if (!visible || pathname === current.route) return;
    router.replace(current.route);
  }, [current.route, pathname, visible]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }));

  async function finish() {
    setVisible(false);
    if (storageKey) await AsyncStorage.setItem(storageKey, '1').catch(() => {});
  }

  function next() {
    const nextStep = step + 1;
    if (nextStep >= steps.length) {
      void finish();
      return;
    }
    setStep(nextStep);
    router.replace(steps[nextStep].route);
  }

  if (!visible) return null;

  const spotlight = {
    top: `${current.spotlight.top}%` as DimensionValue,
    left: `${current.spotlight.left}%` as DimensionValue,
    width: `${current.spotlight.width}%` as DimensionValue,
    height: `${current.spotlight.height}%` as DimensionValue,
  };
  const bubbleStyle = getBubbleStyle(current.anchor, height, width);
  const mascotFirst = isMascotFirst(current.anchor);
  const isLast = step === steps.length - 1;
  const mascot = (
    <Animated.View style={[styles.mascot, { backgroundColor: theme.tintSoft }, mascotStyle]}>
      <View style={[styles.face, { backgroundColor: theme.tint }]}>
        <View style={styles.eyeRow}>
          <View style={styles.eye} />
          <View style={styles.eye} />
        </View>
        <View style={styles.smile} />
      </View>
      <View style={[styles.note, { backgroundColor: theme.accent }]} />
    </Animated.View>
  );

  return (
    <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(160)} style={styles.root} pointerEvents="box-none">
      <View style={styles.scrim} pointerEvents="auto" />
      <View style={[styles.spotlight, spotlight, { borderColor: theme.tint, backgroundColor: theme.tintSoft }]} pointerEvents="none" />

      <View style={[styles.tourBox, bubbleStyle, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.float]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Skip tutorial" onPress={finish} style={styles.close}>
          <Icon name="x" size={17} color={theme.muted} />
        </Pressable>
        <View style={styles.row}>
          {mascotFirst ? mascot : null}
          <View style={styles.copy}>
            <ThemedText type="eyebrow" themeColor="muted">
              Guided tour {step + 1}/{steps.length}
            </ThemedText>
            <ThemedText type="label">{current.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {current.body}
            </ThemedText>
          </View>
          {mascotFirst ? null : mascot}
        </View>
        <View style={styles.actions}>
          <Button title="Skip" variant="ghost" onPress={finish} style={styles.action} />
          <Button title={isLast ? 'Finish' : 'Next'} iconRight={isLast ? 'check-circle' : 'arrow-right'} onPress={next} style={styles.action} />
        </View>
      </View>
    </Animated.View>
  );
}

function getBubbleStyle(anchor: Anchor, height: number, width: number) {
  const compact = width < 520;
  const topOffset = compact ? Math.max(80, height * 0.12) : Math.max(92, height * 0.14);
  const bottomOffset = compact ? 112 : 124;

  switch (anchor) {
    case 'top-left':
      return { top: topOffset, left: Spacing.gutter, right: Spacing.gutter };
    case 'top-right':
      return { top: topOffset, left: Spacing.gutter, right: Spacing.gutter };
    case 'bottom-left':
      return { bottom: bottomOffset, left: Spacing.gutter, right: Spacing.gutter };
    case 'bottom-right':
      return { bottom: bottomOffset, left: Spacing.gutter, right: Spacing.gutter };
    case 'center':
      return { top: height * 0.34, left: Spacing.gutter, right: Spacing.gutter };
  }
}

function isMascotFirst(anchor: Anchor) {
  return anchor !== 'top-right' && anchor !== 'bottom-right';
}

const styles = StyleSheet.create({
  action: { flex: 1, minHeight: 42 },
  actions: { flexDirection: 'row', gap: Spacing.two },
  close: { alignItems: 'center', height: 32, justifyContent: 'center', position: 'absolute', right: 8, top: 8, width: 32, zIndex: 2 },
  copy: { flex: 1, gap: Spacing.one, paddingRight: Spacing.three },
  eye: { backgroundColor: '#FFFFFF', borderRadius: Radius.pill, height: 7, width: 7 },
  eyeRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  face: { alignItems: 'center', borderRadius: Radius.lg, height: 52, width: 56 },
  mascot: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    height: 78,
    justifyContent: 'center',
    width: 78,
  },
  note: { borderRadius: Radius.sm, height: 14, marginTop: -5, transform: [{ rotate: '-8deg' }], width: 36 },
  root: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 100,
  },
  row: { alignItems: 'center', flexDirection: 'row', gap: Spacing.three },
  scrim: {
    backgroundColor: 'rgba(23,32,42,0.38)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  smile: { borderBottomColor: '#FFFFFF', borderBottomWidth: 2, borderRadius: Radius.pill, height: 10, marginTop: 7, width: 22 },
  spotlight: {
    borderRadius: Radius.lg,
    borderWidth: 2,
    opacity: 0.95,
    position: 'absolute',
  },
  tourBox: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.three,
    maxWidth: 560,
    padding: Spacing.three,
    position: 'absolute',
  },
});
