import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { BriefProvider } from '@/store/BriefContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <BriefProvider>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="describe" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="builder" />
          <Stack.Screen name="spec" />
          <Stack.Screen name="bids" />
        </Stack>
        <StatusBar style="auto" />
      </BriefProvider>
    </ThemeProvider>
  );
}
