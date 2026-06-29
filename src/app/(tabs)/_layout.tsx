import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, type ColorValue } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

function TabIcon({ emoji, focused, color }: { emoji: string; focused: boolean; color: ColorValue }) {
  return (
    <View style={styles.icon}>
      <ThemedText style={{ fontSize: 22, opacity: focused ? 1 : 0.6 }}>{emoji}</ThemedText>
      {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
    </View>
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.backgroundElement,
          borderTopColor: theme.border,
          height: Platform.select({ ios: 88, default: 64 }),
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="🏠" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="🔎" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="briefs"
        options={{
          title: 'My Briefs',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="📋" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="👤" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: { alignItems: 'center', justifyContent: 'center', height: 28 },
  dot: { width: 5, height: 5, borderRadius: 999, marginTop: 3 },
});
