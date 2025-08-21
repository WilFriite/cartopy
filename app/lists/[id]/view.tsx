import { useLocalSearchParams } from 'expo-router';
import { View, ScrollView, Alert } from 'react-native';
import { Container } from '~/components/ui/container';
import { Text } from '~/components/ui/typography';
import { Stack } from '~/components/ui/stack';
import { Btn } from '~/components/ui/btn';
import { useDrizzle } from '~/hooks/use-drizzle';
import { lists } from '~/db/schema';
import { eq } from 'drizzle-orm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ViewTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const drizzle = useDrizzle();
  const queryClient = useQueryClient();

  const { data: list, isLoading, error } = useQuery({
    queryKey: ['list', id],
    queryFn: async () => {
      const result = await drizzle.select().from(lists).where(eq(lists.id, parseInt(id!))).get();
      return result;
    },
    enabled: !!id,
  });

  const markAsPerformedMutation = useMutation({
    mutationFn: async () => {
      return await drizzle
        .update(lists)
        .set({
          lastPerformedAt: new Date().toISOString(),
        })
        .where(eq(lists.id, parseInt(id!)))
        .run();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list', id] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      Alert.alert('Succès', 'Liste marquée comme utilisée');
    },
    onError: (error) => {
      Alert.alert('Erreur', 'Erreur lors de la mise à jour');
      console.error('Mark as performed error:', error);
    },
  });

  if (isLoading) {
    return (
      <Container>
        <Stack gap="lg" align="center">
          <Text size="lg">Chargement...</Text>
        </Stack>
      </Container>
    );
  }

  if (error || !list) {
    return (
      <Container>
        <Stack gap="lg" align="center">
          <Text size="lg" color="crimson">Erreur lors du chargement de la liste</Text>
        </Stack>
      </Container>
    );
  }

  // Parse items from JSON string or use empty array
  let items: any[] = [];
  try {
    items = list.items ? JSON.parse(list.items) : [];
  } catch (error) {
    console.error('Error parsing items:', error);
    items = [];
  }
  const lastPerformedAt = list.lastPerformedAt ? new Date(list.lastPerformedAt) : null;

  return (
    <ScrollView style={{ flex: 1 }}>
      <Container>
        <Stack gap="xl">
          {/* List Name */}
          <View style={{ paddingVertical: 16 }}>
            <Text size="3xl" weight="bold" align="center">
              {list.name}
            </Text>
          </View>

          {/* Last Performed Section */}
          <View style={{ paddingVertical: 16 }}>
            <Text size="lg" weight="semibold" style={{ marginBottom: 8 }}>
              Dernière utilisation
            </Text>
            {lastPerformedAt ? (
              <Text size="base" color="muted">
                {format(lastPerformedAt, 'PPP à HH:mm', { locale: fr })}
              </Text>
            ) : (
              <Text size="base" color="muted">
                Cette liste n'a jamais été utilisée
              </Text>
            )}
            
            <Btn
              onPress={() => markAsPerformedMutation.mutate()}
              disabled={markAsPerformedMutation.isPending}
              size="base"
              variant="primary"
              style={{ marginTop: 12 }}>
              {markAsPerformedMutation.isPending ? 'Mise à jour...' : 'Marquer comme utilisée'}
            </Btn>
          </View>

          {/* Items Section */}
          <View style={{ paddingVertical: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text size="lg" weight="semibold">
                Articles ({items.length})
              </Text>
              {items.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ 
                    width: 60, 
                    height: 8, 
                    backgroundColor: '#e5e7eb', 
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}>
                    <View style={{ 
                      width: `${(items.filter(item => item.completed).length / items.length) * 100}%`, 
                      height: '100%', 
                      backgroundColor: '#2E78B7',
                    }} />
                  </View>
                  <Text size="sm" color="muted">
                    {items.filter(item => item.completed).length}/{items.length}
                  </Text>
                </View>
              )}
            </View>
            
            {items.length > 0 ? (
              <Stack gap="md">
                {items.map((item: any, index: number) => (
                  <View
                    key={index}
                    style={{
                      padding: 16,
                      backgroundColor: '#ffffff',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                      opacity: item.completed ? 0.6 : 1,
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: item.completed ? '#2E78B7' : '#e5e7eb',
                        backgroundColor: item.completed ? '#2E78B7' : 'transparent',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        {item.completed && (
                          <Text size="xs" color="white" weight="bold">✓</Text>
                        )}
                      </View>
                      <Text 
                        size="base" 
                        weight="medium"
                        style={{ 
                          textDecorationLine: item.completed ? 'line-through' : 'none',
                        }}>
                        {item.name || item}
                      </Text>
                    </View>
                    {item.quantity && (
                      <Text size="sm" color="muted" style={{ marginTop: 4, marginLeft: 28 }}>
                        Quantité: {item.quantity}
                      </Text>
                    )}
                    {item.notes && (
                      <Text size="sm" color="muted" style={{ marginTop: 4, marginLeft: 28 }}>
                        Notes: {item.notes}
                      </Text>
                    )}
                  </View>
                ))}
              </Stack>
            ) : (
              <View
                style={{
                  padding: 24,
                  backgroundColor: '#f9fafb',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderStyle: 'dashed',
                }}>
                <Text size="base" color="muted" align="center">
                  Aucun article dans cette liste
                </Text>
              </View>
            )}
          </View>

          {/* Created Date */}
          <View style={{ paddingVertical: 16 }}>
            <Text size="sm" color="muted">
              Créée le {format(new Date(list.createdAt), 'PPP', { locale: fr })}
            </Text>
          </View>
        </Stack>
      </Container>
    </ScrollView>
  );
}