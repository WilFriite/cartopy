import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import { Link, Stack, useLocalSearchParams, withLayoutContext } from 'expo-router';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { useUnistyles } from 'react-native-unistyles';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useDrizzle } from '~/hooks/use-drizzle';
import { Icon } from '~/components/ui/icon';
import { ArrowLeftCircle, Edit, Eye } from 'lucide-react-native';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function ListDetailsLayout() {
  const { theme } = useUnistyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDrizzle();
  const { data: list } = useLiveQuery(
    db.query.lists.findFirst({
      where: (lists, { eq }) => eq(lists.id, parseInt(id!)),
      columns: {
        id: true,
        name: true,
      },
    }),
    [id]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: list?.name,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <Link href={'/lists'} asChild>
              <Icon as={ArrowLeftCircle} size={20} color="muted" />
            </Link>
          ),
          headerTintColor: theme.colors.astral,
        }}
      />
      <MaterialTopTabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.astral,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
          },
          tabBarInactiveTintColor: theme.colors.muted,
          tabBarIndicatorStyle: {
            backgroundColor: theme.colors.astral,
          },
          tabBarLabelStyle: {
            fontWeight: '600',
            textTransform: 'none',
          },
        }}>
        <MaterialTopTabs.Protected guard={Boolean(list)}>
          <MaterialTopTabs.Screen
            name="index"
            initialParams={{ id }}
            options={{
              title: 'Détails',
              tabBarIcon: ({ focused }) => (
                <Icon as={Eye} size={20} color={focused ? 'astral' : 'muted'} />
              ),
            }}
          />
          <MaterialTopTabs.Screen
            name="edit"
            initialParams={{ id }}
            options={{
              title: 'Modification',
              tabBarIcon: ({ focused }) => (
                <Icon as={Edit} size={20} color={focused ? 'astral' : 'muted'} />
              ),
            }}
          />
        </MaterialTopTabs.Protected>
      </MaterialTopTabs>
    </>
  );
}
