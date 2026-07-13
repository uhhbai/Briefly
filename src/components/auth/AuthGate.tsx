import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Canvas } from '@/components/ui/Canvas';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Logo, LogoMark } from '@/components/ui/Logo';
import { TextField } from '@/components/ui/TextField';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth, type SignupRole } from '@/store/AuthContext';

type Mode = 'signIn' | 'signUp';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [signupRole, setSignupRole] = useState<SignupRole>('buyer');
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (session) return <>{children}</>;

  async function submit() {
    setError(null);
    setMessage(null);

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    if (mode === 'signUp' && !displayName.trim()) {
      setError('Add the name you want vendors to see.');
      return;
    }

    setWorking(true);
    try {
      if (mode === 'signIn') {
        await signIn(email, password);
      } else {
        const signedIn = await signUp(email, password, displayName, signupRole);
        if (!signedIn) {
          setMessage('Account created. Check your email to confirm it, then log in here.');
          setMode('signIn');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <Canvas>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.shell}>
              <Animated.View entering={FadeInDown.duration(360)} style={styles.hero}>
                <Logo withMark size={38} />
                <ThemedText type="display" style={styles.title}>
                  Get bids, book makers, pay safely.
                </ThemedText>
                <ThemedText type="default" themeColor="textSecondary" style={styles.copy}>
                  Choose a buyer or vendor account when you sign up. Each side has its own workspace, so use a separate login if you need both.
                </ThemedText>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(90).duration(360)} style={styles.formWrap}>
                <Card style={styles.form}>
                  <View style={styles.markWrap}>
                    <LogoMark size={52} />
                  </View>
                  <View style={styles.modeRow}>
                    <Chip label="Log in" selected={mode === 'signIn'} onPress={() => setMode('signIn')} />
                    <Chip label="Sign up" selected={mode === 'signUp'} onPress={() => setMode('signUp')} />
                  </View>

                  {mode === 'signUp' ? (
                    <>
                      <View style={styles.roleCards}>
                        <RoleCard
                          title="Buyer"
                          body="Post briefs, compare bids, and pay through escrow."
                          selected={signupRole === 'buyer'}
                          onPress={() => setSignupRole('buyer')}
                        />
                        <RoleCard
                          title="Vendor"
                          body="Manage services, browse buyer briefs, and submit quotes."
                          selected={signupRole === 'vendor'}
                          onPress={() => setSignupRole('vendor')}
                        />
                      </View>
                      <TextField
                        label={signupRole === 'vendor' ? 'Business or display name' : 'Display name'}
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder={signupRole === 'vendor' ? 'Briefly Studio' : 'Siraj'}
                        autoCapitalize="words"
                        autoComplete="name"
                      />
                    </>
                  ) : null}

                  <TextField
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                  <TextField
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 6 characters"
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                  />

                  {error ? (
                    <ThemedText type="smallBold" themeColor="danger">
                      {error}
                    </ThemedText>
                  ) : null}
                  {message ? (
                    <ThemedText type="smallBold" themeColor="success">
                      {message}
                    </ThemedText>
                  ) : null}

                  <Button
                    title={mode === 'signIn' ? 'Log in to Briefly' : 'Create account'}
                    loading={working || loading}
                    iconRight="arrow-right"
                    onPress={submit}
                  />
                </Card>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Canvas>
  );
}

function RoleCard({
  title,
  body,
  selected,
  onPress,
}: {
  title: string;
  body: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.roleCardWrap}>
      <Chip label={title} selected={selected} onPress={onPress} />
      <ThemedText type="small" themeColor="textSecondary">
        {body}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.five,
  },
  shell: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  hero: { gap: Spacing.three },
  title: { maxWidth: 620 },
  copy: { maxWidth: 580 },
  formWrap: { width: '100%' },
  form: { gap: Spacing.three },
  markWrap: { alignItems: 'flex-start' },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  roleCards: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  roleCardWrap: { flex: 1, minWidth: 210, gap: Spacing.two },
});
