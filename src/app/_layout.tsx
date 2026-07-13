import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, useColorScheme } from 'react-native';

import { useFonts } from 'expo-font';
import { Fraunces_400Regular } from '@expo-google-fonts/fraunces/400Regular';
import { Fraunces_400Regular_Italic } from '@expo-google-fonts/fraunces/400Regular_Italic';
import { Fraunces_500Medium } from '@expo-google-fonts/fraunces/500Medium';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fraunces_600SemiBold_Italic } from '@expo-google-fonts/fraunces/600SemiBold_Italic';
import { Fraunces_900Black } from '@expo-google-fonts/fraunces/900Black';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';

import { useTheme } from '@/hooks/use-theme';
import { BriefProvider } from '@/store/BriefContext';
import { SessionProvider, useSession } from '@/store/SessionProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
    Fraunces_900Black,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: theme.background }} />;

  // Opaque scene backgrounds (bone / espresso) so screens never bleed through one another.
  const base = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = { ...base, colors: { ...base.colors, background: theme.background, card: theme.background } };

  return (
    <ThemeProvider value={navTheme}>
      <SessionProvider>
        <BriefProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </BriefProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { ready, userId, isGuest } = useSession();

  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === 'auth';
    const allowed = Boolean(userId || isGuest);

    if (!allowed && !inAuth) router.replace('/auth');
    if (allowed && inAuth) router.replace('/(tabs)');
  }, [isGuest, ready, router, segments, userId]);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="auth" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="describe" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="builder" />
      <Stack.Screen name="spec" />
      <Stack.Screen name="bids" />
    </Stack>
  );
}
