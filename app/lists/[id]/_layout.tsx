import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import { Link, Stack, useLocalSearchParams, withLayoutContext } from 'expo-router';
import { Icon } from '~/components/ui/icon';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { useUnistyles } from 'react-native-unistyles';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useDrizzle } from '~/hooks/use-drizzle';

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
    }),
    [id]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: list?.name,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerLeft: () => (
            <Link href={'/lists'} asChild>
              <Icon name="arrow-circle-left" size={20} color="muted" />
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
            options={{
              title: 'Voir',
              tabBarIcon: ({ focused }) => (
                <Icon name="eye" size={20} color={focused ? 'astral' : 'muted'} />
              ),
            }}
          />
          <MaterialTopTabs.Screen
            name="edit"
            options={{
              title: 'Modifier',
              tabBarIcon: ({ focused }) => (
                <Icon name="edit" size={20} color={focused ? 'astral' : 'muted'} />
              ),
            }}
          />
        </MaterialTopTabs.Protected>
      </MaterialTopTabs>
    </>
  );
}
