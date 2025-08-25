import { Stack, Tabs } from 'expo-router';
import { List, PlusCircle } from 'lucide-react-native';
import { LucIcon } from '~/components/ui/luc-icon';
import { TabBar } from '~/components/ui/tab-bar';

export default function ListsPagesLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Mes listes',
            tabBarIcon: ({ focused }) => (
              <LucIcon as={List} size={16} color={focused ? 'astral' : 'muted'} />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Ajouter',
            tabBarIcon: ({ focused }) => (
              <LucIcon as={PlusCircle} size={16} color={focused ? 'astral' : 'muted'} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
