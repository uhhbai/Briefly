import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, useColorScheme } from 'react-native';

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
import { useFonts } from 'expo-font';

import { AuthGate } from '@/components/auth/AuthGate';
import { RoleRedirect } from '@/components/auth/RoleRedirect';
import { BrieflyGuide } from '@/components/onboarding/BrieflyGuide';
import { ToastProvider } from '@/components/ui/Toast';
import { useTheme } from '@/hooks/use-theme';
import { AuthProvider } from '@/store/AuthContext';
import { BriefProvider } from '@/store/BriefContext';

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
      <ToastProvider>
        <AuthProvider>
          <AuthGate>
            <BriefProvider>
              <RoleRedirect />
              <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="vendor-dashboard" />
                <Stack.Screen name="describe" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="builder" />
                <Stack.Screen name="spec" />
                <Stack.Screen name="bids" />
                <Stack.Screen name="brief-posted" />
                <Stack.Screen name="checkout" />
                <Stack.Screen name="account" />
              </Stack>
              <BrieflyGuide />
              <StatusBar style="auto" />
            </BriefProvider>
          </AuthGate>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
