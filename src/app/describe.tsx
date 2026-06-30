import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { Radius, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { extractSpec, getFollowUps } from '@/lib/ai';
import { CATEGORIES, COMMISSION_LABEL } from '@/lib/config';
import { useBrief } from '@/store/BriefContext';

export default function DescribeScreen() {
  const theme = useTheme();
  const brief = useBrief();
  const { prefill } = useLocalSearchParams<{ prefill?: string }>();
  const [text, setText] = useState(prefill ?? brief.rawText ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const value = text.trim();
    if (value.length < 8) {
      setError('Tell us a bit more — describe what you want in a sentence or two.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      brief.reset();
      brief.setRawText(value);
      const spec = await extractSpec(value);
      brief.setSpec(spec);
      const followUps = await getFollowUps(spec);
      brief.setFollowUps(followUps);
      router.push(followUps.length ? '/builder' : '/spec');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      showBack
      eyebrow="Step 1 of 3"
      title="Describe your project"
      subtitle="We turn your words into a clear, structured brief that vendors can bid on."
      footer={
        <Button
          title={loading ? 'Reading your request' : 'Build my brief'}
          iconRight={loading ? undefined : 'arrow-right'}
          loading={loading}
          onPress={handleSubmit}
        />
      }>
      <Animated.View entering={FadeInDown.duration(320)}>
        <View style={[styles.inputWrap, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <TextInput
            value={text}
            onChangeText={(t) => {
              setText(t);
              if (error) setError(null);
            }}
            editable={!loading}
            autoFocus
            placeholder="A walnut coffee table for a 1.8m wall, hidden charging, under S$800…"
            placeholderTextColor={theme.muted}
            multiline
            style={[styles.input, { color: theme.text, fontFamily: Type.sans }]}
            textAlignVertical="top"
          />
          <View style={styles.inputFooter}>
            <Pressable
              onPress={() =>
                Alert.alert('Voice input', 'Coming soon — you’ll be able to speak your request. For now, type it in.')
              }
              hitSlop={10}
              style={[styles.micBtn, { borderColor: theme.border }]}>
              <Icon name="mic" size={17} color={theme.textSecondary} />
            </Pressable>
            <ThemedText type="small" themeColor="muted">
              {text.trim().length} characters
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {error && (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      )}

      <View style={{ gap: Spacing.three }}>
        <ThemedText type="eyebrow" themeColor="muted">
          Need a starting point
        </ThemedText>
        <View style={styles.chips}>
          {CATEGORIES.filter((c) => c.id !== 'other').map((c) => (
            <Chip key={c.id} label={c.label.split(' &')[0]} onPress={() => setText(c.example)} />
          ))}
        </View>
      </View>

      <ThemedText type="small" themeColor="muted">
        No upfront cost to post. Briefly earns {COMMISSION_LABEL}.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputWrap: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.lg, padding: Spacing.four },
  input: { minHeight: 150, fontSize: 18, lineHeight: 26 },
  inputFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.three },
  micBtn: { width: 42, height: 42, borderRadius: Radius.pill, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
