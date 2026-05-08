import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { useEffectiveColorScheme } from '@/src/hooks/use-effective-color-scheme';
import { Fonts, Palette, Semantic } from '@/src/design';

export default function TabsLayout() {
  const colorScheme = useEffectiveColorScheme();
  const palette = Semantic[colorScheme];
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: Palette.brand,
        tabBarInactiveTintColor: palette.textTertiary,
        tabBarLabelStyle: {
          fontFamily: Fonts.latinMedium,
          fontSize: 11,
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          backgroundColor: palette.bg,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: palette.separator,
          height: 56,
          paddingTop: 4,
        },
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: palette.bg,
        },
        headerTitleStyle: {
          fontFamily: Fonts.latinSemibold,
          fontSize: 16,
          color: palette.text,
        },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size - 2}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'repeat' : 'repeat-outline'}
              size={size - 2}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{
          title: 'Vocab',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'library' : 'library-outline'}
              size={size - 2}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Lessons',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              size={size - 2}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
