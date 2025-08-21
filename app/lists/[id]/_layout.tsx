import { MaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useLocalSearchParams } from 'expo-router';
import { Icon } from '~/components/ui/icon';
import { Container } from '~/components/ui/container';
import { Text } from '~/components/ui/typography';
import { Stack } from 'expo-router';

export default function ListDetailsLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Détails de la liste',
          headerBackTitle: 'Retour',
        }}
      />
      <MaterialTopTabNavigator.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2E78B7', // astral color from theme
          tabBarInactiveTintColor: '#6b7280', // muted color from theme
          tabBarIndicatorStyle: {
            backgroundColor: '#2E78B7',
          },
          tabBarLabelStyle: {
            fontWeight: '600',
            textTransform: 'none',
          },
        }}>
        <MaterialTopTabNavigator.Screen
          name="view"
          component={ViewTab}
          options={{
            title: 'Voir',
            tabBarIcon: ({ color }) => (
              <Icon name="eye" size={20} color={color} />
            ),
          }}
        />
        <MaterialTopTabNavigator.Screen
          name="edit"
          component={EditTab}
          options={{
            title: 'Modifier',
            tabBarIcon: ({ color }) => (
              <Icon name="edit-3" size={20} color={color} />
            ),
          }}
        />
      </MaterialTopTabNavigator.Navigator>
    </>
  );
}

// Placeholder components - will be implemented in separate files
function ViewTab() {
  return (
    <Container>
      <Text size="lg">Vue de la liste</Text>
    </Container>
  );
}

function EditTab() {
  return (
    <Container>
      <Text size="lg">Édition de la liste</Text>
    </Container>
  );
}