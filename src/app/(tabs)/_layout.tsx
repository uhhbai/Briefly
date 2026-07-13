import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, type ColorValue } from 'react-native';

import { Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FeatherName = keyof typeof Feather.glyphMap;

function makeTabBarIcon(name: FeatherName) {
  function TabBarIcon({ color }: { color: ColorValue }) {
    return <Feather name={name} size={21} color={color as string} />;
  }
  TabBarIcon.displayName = `${name}TabBarIcon`;
  return TabBarIcon;
}

const tabIcons = {
  index: makeTabBarIcon('home'),
  browse: makeTabBarIcon('search'),
  briefs: makeTabBarIcon('file-text'),
  profile: makeTabBarIcon('user'),
};

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.background },
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: { fontFamily: Type.sansMedium, fontSize: 10.5, letterSpacing: 0, marginTop: 2 },
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
      <Tabs.Screen name="index" options={{ title: 'Discover', tabBarIcon: tabIcons.index }} />
      <Tabs.Screen name="browse" options={{ title: 'Browse', tabBarIcon: tabIcons.browse }} />
      <Tabs.Screen name="briefs" options={{ title: 'Briefs', tabBarIcon: tabIcons.briefs }} />
      <Tabs.Screen name="profile" options={{ title: 'Account', tabBarIcon: tabIcons.profile }} />
    </Tabs>
  );
}
