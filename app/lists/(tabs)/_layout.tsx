import { Tabs } from 'expo-router';
import { Icon } from '~/components/ui/icon';

export default function ListsPagesLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerBackButtonDisplayMode: 'minimal',
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
