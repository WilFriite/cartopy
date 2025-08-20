import { Tabs } from 'expo-router';
import { Icon } from '~/components/ui/icon';
import { TabBar } from '~/components/ui/tab-bar';

export default function ListsPagesLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mes listes',
          tabBarIcon: ({ focused }) => <Icon name="list" color={focused ? 'astral' : 'muted'} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Ajouter',
          tabBarIcon: ({ focused }) => (
            <Icon name="plus-circle" color={focused ? 'astral' : 'muted'} />
          ),
        }}
      />
    </Tabs>
  );
}
