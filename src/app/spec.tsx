import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { generateBids } from '@/lib/ai';
import { useBrief } from '@/store/BriefContext';

export default function SpecScreen() {
  const theme = useTheme();
  const { spec, setBids } = useBrief();
  const [loading, setLoading] = useState(false);

  if (!spec) {
    return (
      <Screen showBack title="No spec yet">
        <ThemedText themeColor="textSecondary">Start a new request from the home screen.</ThemedText>
      </Screen>
    );
  }

  async function handleGetBids() {
    setLoading(true);
    try {
      const bids = await generateBids(spec!);
      setBids(bids);
      router.push('/bids');
    } finally {
      setLoading(false);
    }
  }

  const sanity = spec.budgetSanity;

  return (
    <Screen
      showBack
      title="Your spec"
      subtitle="This is what vendors will bid on"
      footer={
        <Button
          title={loading ? 'Sending to vendors…' : 'Get bids from vendors'}
          icon="📣"
          loading={loading}
          onPress={handleGetBids}
        />
      }>
      {/* Title + category */}
      <Card accentColor={theme.tint}>
        <View style={styles.rowBetween}>
          <ThemedText type="small" themeColor="textSecondary">
            {spec.category.emoji} {spec.category.label}
          </ThemedText>
        </View>
        <ThemedText type="default" style={{ fontWeight: '700', fontSize: 19 }}>
          {spec.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {spec.summary}
        </ThemedText>
      </Card>

      {/* Extracted fields */}
      <ThemedText type="smallBold" themeColor="textSecondary">
        EXTRACTED DETAILS
      </ThemedText>
      <Card>
        {spec.fields.map((f, i) => (
          <View
            key={f.key}
            style={[
              styles.fieldRow,
              i < spec.fields.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
            ]}>
            <ThemedText type="default" style={{ flex: 1 }}>
              {f.emoji}  {f.label}
            </ThemedText>
            <ThemedText
              type="default"
              style={{ fontWeight: '600', color: f.value ? theme.text : theme.muted }}>
              {f.value ?? 'Not specified'}
            </ThemedText>
          </View>
        ))}
      </Card>

      {/* Budget sanity-check — the AI "wow" */}
      {sanity && (
        <Card
          accentColor={sanity.realistic ? theme.success : theme.warning}
          style={{ backgroundColor: sanity.realistic ? theme.successBg : theme.tintSoft }}>
          <ThemedText type="smallBold" style={{ color: sanity.realistic ? theme.success : theme.warning }}>
            {sanity.realistic ? '✓ Budget check' : '⚠ Budget check'}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.text }}>
            {sanity.note}
          </ThemedText>
        </Card>
      )}

      <ThemedText type="small" themeColor="muted" style={{ textAlign: 'center' }}>
        Posting this brief is free. You only pay when you accept a bid.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
});
