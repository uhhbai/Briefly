import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { Radius, Spacing } from '@/constants/theme';
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
      title="A few quick questions"
      subtitle={`So vendors can quote accurately · ${answeredCount}/${followUps.length} answered`}
      footer={
        <View style={{ gap: Spacing.two }}>
          <Button title="Looks good — see my spec" icon="📋" onPress={handleContinue} />
          <Button title="Skip the rest" variant="ghost" onPress={handleContinue} />
        </View>
      }>
      {spec && (
        <Card accentColor={theme.tint}>
          <ThemedText type="small" themeColor="textSecondary">
            {spec.category.emoji} Your request
          </ThemedText>
          <ThemedText type="default" style={{ fontWeight: '600' }}>
            {spec.title}
          </ThemedText>
        </Card>
      )}

      {followUps.map((q, i) => (
        <Card key={q.id}>
          <ThemedText type="default" style={{ fontWeight: '700' }}>
            {i + 1}. {q.question}
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
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
              ]}
            />
          )}
        </Card>
      ))}

      <ThemedText type="small" themeColor="muted" style={{ textAlign: 'center' }}>
        Every answer sharpens the bids you’ll get. You can edit anything on the next screen.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    marginTop: Spacing.one,
    minHeight: 48,
  },
});
