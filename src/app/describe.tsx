import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { Radius, Spacing } from '@/constants/theme';
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

  async function handleSubmit() {
    const value = text.trim();
    if (value.length < 8) {
      Alert.alert('Tell us a bit more', 'Describe what you want in a sentence or two.');
      return;
    }
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
      Alert.alert('Something went wrong', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      showBack
      title="Describe your project"
      subtitle="Our AI turns it into a clear spec for vendors"
      footer={
        <Button
          title={loading ? 'Reading your request…' : 'Build my brief'}
          icon="✨"
          loading={loading}
          onPress={handleSubmit}
        />
      }>
      <Animated.View entering={FadeInDown.duration(350)}>
        <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            editable={!loading}
            autoFocus
            placeholder="e.g. A walnut coffee table for a 1.8m wall, hidden charging, under S$800"
            placeholderTextColor={theme.muted}
            multiline
            style={[styles.input, { color: theme.text }]}
            textAlignVertical="top"
          />
          <View style={styles.inputFooter}>
            <Pressable
              onPress={() =>
                Alert.alert(
                  '🎙️ Voice input',
                  'Coming soon — you’ll be able to just speak your request. For now, type it in.'
                )
              }
              hitSlop={10}
              style={[styles.micBtn, { borderColor: theme.border }]}>
              <ThemedText style={{ fontSize: 18 }}>🎙️</ThemedText>
            </Pressable>
            <ThemedText type="small" themeColor="muted">
              {text.trim().length} chars
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      <ThemedText type="smallBold" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
        Need ideas? Tap one:
      </ThemedText>
      <View style={styles.chips}>
        {CATEGORIES.filter((c) => c.id !== 'other').map((c, i) => (
          <Animated.View key={c.id} entering={FadeInDown.delay(80 * i).duration(350)}>
            <Chip label={`${c.emoji} ${c.label.split(' ')[0]}`} onPress={() => setText(c.example)} />
          </Animated.View>
        ))}
      </View>

      <ThemedText type="small" themeColor="muted" style={styles.fineprint}>
        No upfront cost to post. Briefly earns {COMMISSION_LABEL}.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  input: { minHeight: 130, fontSize: 17, lineHeight: 24 },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  fineprint: { marginTop: Spacing.two, textAlign: 'center' },
});
