import { Stack } from 'expo-router';

import { Container } from '~/components/ui/container';
import { Text } from '~/components/ui/typography';

export default function CreateListPage() {
  return (
    <>
      <Stack.Screen options={{ title: 'Ajouter' }} />
      <Container>
        <Text size="xl" align="center">
          Création
        </Text>
      </Container>
    </>
  );
}
