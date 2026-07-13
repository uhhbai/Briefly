import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, type ColorValue } from 'react-native';

import { Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FeatherName = keyof typeof Feather.glyphMap;

export default function TabsLayout() {
  const theme = useTheme();

  const icon = (name: FeatherName) => {
    function TabBarIcon({ color }: { color: ColorValue }) {
      return <Feather name={name} size={21} color={color as string} />;
    }
    // eslint-disable-next-line react-hooks/immutability
    TabBarIcon.displayName = `TabBarIcon(${name})`;
    return TabBarIcon;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.background },
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: { fontFamily: Type.sansMedium, fontSize: 10.5, letterSpacing: 0.3, marginTop: 2 },
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 84,
          paddingTop: Spacing.two,
          elevation: 0,
        },
        tabBarItemStyle: { paddingTop: 2 },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Discover', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="browse" options={{ title: 'Browse', tabBarIcon: icon('search') }} />
      <Tabs.Screen name="briefs" options={{ title: 'Briefs', tabBarIcon: icon('file-text') }} />
      <Tabs.Screen name="profile" options={{ title: 'Account', tabBarIcon: icon('user') }} />
    </Tabs>
  );
}
