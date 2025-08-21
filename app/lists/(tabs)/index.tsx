import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Container } from '~/components/ui/container';
import { Text } from '~/components/ui/typography';
import { Stack } from '~/components/ui/stack';
import { useDrizzle } from '~/hooks/use-drizzle';
import { lists } from '~/db/schema';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DisplayListsPage() {
  const router = useRouter();
  const drizzle = useDrizzle();

  const { data: listsData, isLoading, error } = useQuery({
    queryKey: ['lists'],
    queryFn: async () => {
      return await drizzle.select().from(lists).all();
    },
  });

  const navigateToListDetails = (listId: number) => {
    router.push(`/lists/${listId}`);
  };

  if (isLoading) {
    return (
      <Container>
        <Stack gap="lg" align="center">
          <Text size="lg">Chargement des listes...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Stack gap="lg" align="center">
          <Text size="lg" color="crimson">Erreur lors du chargement des listes</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <Container>
        <Stack gap="xl">
          <Text size="2xl" weight="bold" align="center" style={{ marginVertical: 16 }}>
            Mes Listes
          </Text>

          {listsData && listsData.length > 0 ? (
            <Stack gap="md">
              {listsData.map((list) => {
                let items: any[] = [];
                try {
                  items = list.items ? JSON.parse(list.items) : [];
                } catch (error) {
                  console.error('Error parsing items:', error);
                  items = [];
                }
                const lastPerformedAt = list.lastPerformedAt ? new Date(list.lastPerformedAt) : null;

                return (
                  <TouchableOpacity
                    key={list.id}
                    onPress={() => navigateToListDetails(list.id)}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}>
                    <Stack gap="md">
                      <Text size="xl" weight="semibold">
                        {list.name}
                      </Text>
                      
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text size="base" color="muted">
                          {items.length} article{items.length !== 1 ? 's' : ''}
                        </Text>
                        <Text size="sm" color="muted">
                          {lastPerformedAt 
                            ? `Utilisée le ${format(lastPerformedAt, 'dd/MM/yyyy', { locale: fr })}`
                            : 'Jamais utilisée'
                          }
                        </Text>
                      </View>

                      <Text size="sm" color="muted">
                        Créée le {format(new Date(list.createdAt), 'dd/MM/yyyy', { locale: fr })}
                      </Text>
                    </Stack>
                  </TouchableOpacity>
                );
              })}
            </Stack>
          ) : (
            <View
              style={{
                padding: 32,
                backgroundColor: '#f9fafb',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderStyle: 'dashed',
              }}>
              <Stack gap="md" align="center">
                <Text size="lg" color="muted" align="center">
                  Aucune liste créée
                </Text>
                <Text size="base" color="muted" align="center">
                  Créez votre première liste de courses en utilisant l'onglet "Ajouter"
                </Text>
              </Stack>
            </View>
          )}
        </Stack>
      </Container>
    </ScrollView>
  );
}
