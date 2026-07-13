import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { generateBids } from '@/lib/ai';
import { createBrief, saveBids } from '@/lib/db';
import { useBrief } from '@/store/BriefContext';

export default function SpecScreen() {
  const theme = useTheme();
  const { spec, setBids } = useBrief();
  const [loading, setLoading] = useState(false);

  if (!spec) {
    return (
      <Screen showBack title="No brief yet">
        <ThemedText themeColor="textSecondary">Start a new request from the home screen.</ThemedText>
      </Screen>
    );
  }

  async function handleGetBids() {
    setLoading(true);
    try {
      const bids = await generateBids(spec!);
      const briefId = await createBrief(spec!);
      const savedBids = briefId ? await saveBids(briefId, bids) : bids;
      setBids(savedBids, briefId);
      router.push('/bids');
    } finally {
      setLoading(false);
    }
  }

  const sanity = spec.budgetSanity;

  return (
    <Screen
      showBack
      eyebrow="Step 3 of 3"
      title="Your brief"
      subtitle="This is exactly what vendors will see and bid on."
      footer={
        <Button
          title={loading ? 'Sending to vendors' : 'Get bids from vendors'}
          iconRight={loading ? undefined : 'arrow-right'}
          loading={loading}
          onPress={handleGetBids}
        />
      }>
      {/* Title block */}
      <View style={{ gap: Spacing.two }}>
        <ThemedText type="eyebrow" themeColor="muted">
          {spec.category.label}
        </ThemedText>
        <ThemedText type="title">{spec.title}</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          {spec.summary}
        </ThemedText>
      </View>

      {/* Extracted fields */}
      <View style={{ gap: Spacing.two }}>
        <ThemedText type="eyebrow" themeColor="muted">
          The details
        </ThemedText>
        <View>
          {spec.fields.map((f, i) => (
            <View key={f.key}>
              {i > 0 && <Divider />}
              <View style={styles.fieldRow}>
                <ThemedText type="default" themeColor="textSecondary">
                  {f.label}
                </ThemedText>
                <ThemedText type="label" style={{ color: f.value ? theme.text : theme.muted, textAlign: 'right', flexShrink: 1 }}>
                  {f.value ?? 'Not specified'}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Budget check */}
      {sanity && (
        <View style={[styles.sanity, { borderColor: theme.border }]}>
          <Icon
            name={sanity.realistic ? 'check-circle' : 'alert-triangle'}
            size={18}
            color={sanity.realistic ? theme.success : theme.warning}
          />
          <View style={{ flex: 1, gap: 3 }}>
            <ThemedText type="smallBold" style={{ color: sanity.realistic ? theme.success : theme.warning }}>
              {sanity.realistic ? 'Budget looks realistic' : 'Budget may be tight'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {sanity.note}
            </ThemedText>
          </View>
        </View>
      )}

      <ThemedText type="small" themeColor="muted">
        Posting this brief is free. You only pay when you accept a bid.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    gap: Spacing.four,
  },
  sanity: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.four,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
  },
});
