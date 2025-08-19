import { Stack, Tabs } from 'expo-router';
import { useUnistyles } from 'react-native-unistyles';
import { Icon } from '~/components/ui/icon';

export default function ListsPagesLayout() {
  const { theme, rt } = useUnistyles();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerBackButtonDisplayMode: 'minimal',
        tabBarStyle: {
          backgroundColor: theme.colors.background,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mes listes',
          tabBarIcon: ({ focused }) => (
            <Icon name="list" size={20} color={focused ? 'astral' : 'muted'} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Ajouter',
          tabBarIcon: ({ focused }) => (
            <Icon name="plus-circle" size={20} color={focused ? 'astral' : 'muted'} />
          ),
        }}
      />
    </Tabs>
  );
}
