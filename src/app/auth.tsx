import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Canvas } from '@/components/ui/Canvas';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { Radius, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/store/SessionProvider';

type Mode = 'login' | 'signup';

export default function AuthScreen() {
  const theme = useTheme();
  const { signIn, signUp, continueAsGuest, configured } = useSession();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  async function submit() {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const result = isSignup ? await signUp(email, password) : await signIn(email, password);
      if (result.error) setError(result.error);
      if (result.message) setNotice(result.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Canvas>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}>
          <Animated.View entering={FadeInDown.duration(360)} style={styles.hero}>
            <Logo size={28} withMark />
            <ThemedText type="display" style={styles.title}>
              Build anything, with the right maker.
            </ThemedText>
            <ThemedText type="default" themeColor="textSecondary" style={styles.copy}>
              Sign in to save briefs, compare bids, and keep every booking in one place.
            </ThemedText>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(100).duration(360)}
            style={[styles.panel, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modeRow}>
              <Pressable
                onPress={() => setMode('login')}
                style={[styles.modeButton, mode === 'login' && { backgroundColor: theme.tintSoft }]}>
                <ThemedText type="label" style={{ color: mode === 'login' ? theme.tint : theme.text }}>
                  Login
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setMode('signup')}
                style={[styles.modeButton, mode === 'signup' && { backgroundColor: theme.tintSoft }]}>
                <ThemedText type="label" style={{ color: mode === 'signup' ? theme.tint : theme.text }}>
                  Sign up
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.fields}>
              <View style={[styles.inputWrap, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
                <Icon name="mail" size={18} color={theme.muted} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  placeholder="Email"
                  placeholderTextColor={theme.muted}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
              <View style={[styles.inputWrap, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
                <Icon name="lock" size={18} color={theme.muted} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  textContentType={isSignup ? 'newPassword' : 'password'}
                  placeholder="Password"
                  placeholderTextColor={theme.muted}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
            </View>

            {error ? (
              <ThemedText type="small" style={{ color: theme.danger }}>
                {error}
              </ThemedText>
            ) : null}
            {notice ? (
              <ThemedText type="small" style={{ color: theme.success }}>
                {notice}
              </ThemedText>
            ) : null}
            {!configured ? (
              <ThemedText type="small" themeColor="muted">
                Supabase keys are not configured yet, so login is disabled in this local build.
              </ThemedText>
            ) : null}

            <Button
              title={isSignup ? 'Create account' : 'Login'}
              iconRight="arrow-right"
              loading={loading}
              disabled={!email || password.length < 6}
              onPress={submit}
            />

            <View style={styles.or}>
              <Divider style={{ flex: 1 }} />
              <ThemedText type="eyebrow" themeColor="muted">
                Or
              </ThemedText>
              <Divider style={{ flex: 1 }} />
            </View>

            <Button title="Continue as guest" variant="secondary" onPress={continueAsGuest} />
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  wrap: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
  hero: { gap: Spacing.three, paddingTop: Spacing.four },
  title: { fontSize: 43, lineHeight: 46, maxWidth: 430 },
  copy: { maxWidth: 360 },
  panel: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: 4,
    borderRadius: Radius.lg,
  },
  modeButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  fields: { gap: Spacing.two },
  inputWrap: {
    minHeight: 54,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  input: {
    flex: 1,
    fontFamily: Type.sans,
    fontSize: 16,
    minWidth: 0,
  },
  or: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
});
