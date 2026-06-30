import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Divider } from '@/components/ui/Divider';
import { Screen } from '@/components/ui/Screen';
import { Radius, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useBrief } from '@/store/BriefContext';

export default function BuilderScreen() {
  const theme = useTheme();
  const { spec, followUps, answerFollowUps } = useBrief();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  function setAnswer(fieldKey: string, value: string) {
    setAnswers((a) => ({ ...a, [fieldKey]: value }));
  }

  function handleContinue() {
    answerFollowUps(answers);
    router.push('/spec');
  }

  const answeredCount = Object.values(answers).filter((v) => v?.trim()).length;

  return (
    <Screen
      showBack
      eyebrow="Step 2 of 3"
      title="A few details"
      subtitle={`So vendors can quote accurately · ${answeredCount} of ${followUps.length} answered`}
      footer={
        <View style={{ gap: Spacing.two }}>
          <Button title="See my spec" iconRight="arrow-right" onPress={handleContinue} />
          <Button title="Skip the rest" variant="ghost" onPress={handleContinue} />
        </View>
      }>
      {spec && (
        <View style={{ gap: 4 }}>
          <ThemedText type="eyebrow" themeColor="muted">
            Your request
          </ThemedText>
          <ThemedText type="subtitle">{spec.title}</ThemedText>
        </View>
      )}

      <View style={{ gap: Spacing.five }}>
        {followUps.map((q, i) => (
          <View key={q.id} style={{ gap: Spacing.three }}>
            <Divider />
            <ThemedText type="subtitle" style={{ fontSize: 20 }}>
              {String(i + 1).padStart(2, '0')}  {q.question}
            </ThemedText>

            {q.type === 'choice' && q.options ? (
              <View style={styles.options}>
                {q.options.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    selected={answers[q.fieldKey] === opt}
                    onPress={() => setAnswer(q.fieldKey, opt)}
                  />
                ))}
              </View>
            ) : (
              <TextInput
                value={answers[q.fieldKey] ?? ''}
                onChangeText={(t) => setAnswer(q.fieldKey, t)}
                placeholder={q.placeholder}
                placeholderTextColor={theme.muted}
                style={[styles.input, { color: theme.text, borderColor: theme.border, fontFamily: Type.sans }]}
              />
            )}
          </View>
        ))}
      </View>

      <ThemedText type="small" themeColor="muted">
        Every answer sharpens the bids you’ll get. You can edit anything on the next screen.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
    minHeight: 52,
  },
});
