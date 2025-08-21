import { useLocalSearchParams, router } from 'expo-router';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Container } from '~/components/ui/container';
import { Text } from '~/components/ui/typography';
import { Stack } from '~/components/ui/stack';
import { Input } from '~/components/ui/input';
import { Btn } from '~/components/ui/btn';
import { useDrizzle } from '~/hooks/use-drizzle';
import { lists } from '~/db/schema';
import { eq } from 'drizzle-orm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ListItem {
  name: string;
  quantity?: string;
  notes?: string;
  completed?: boolean;
}

export default function EditTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const drizzle = useDrizzle();
  const queryClient = useQueryClient();
  
  const [listName, setListName] = useState('');
  const [items, setItems] = useState<ListItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');

  const { data: list, isLoading, error } = useQuery({
    queryKey: ['list', id],
    queryFn: async () => {
      const result = await drizzle.select().from(lists).where(eq(lists.id, parseInt(id!))).get();
      return result;
    },
    enabled: !!id,
    onSuccess: (data) => {
      if (data) {
        setListName(data.name);
        try {
          setItems(data.items ? JSON.parse(data.items) : []);
        } catch (error) {
          console.error('Error parsing items:', error);
          setItems([]);
        }
      }
    },
  });

  const updateListMutation = useMutation({
    mutationFn: async (updatedData: { name: string; items: string }) => {
      return await drizzle
        .update(lists)
        .set({
          name: updatedData.name,
          items: updatedData.items,
        })
        .where(eq(lists.id, parseInt(id!)))
        .run();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list', id] });
      Alert.alert('Succès', 'Liste mise à jour avec succès');
    },
    onError: (error) => {
      Alert.alert('Erreur', 'Erreur lors de la mise à jour de la liste');
      console.error('Update error:', error);
    },
  });

  const addItem = () => {
    if (newItemName.trim()) {
      const newItem: ListItem = {
        name: newItemName.trim(),
        quantity: newItemQuantity.trim() || undefined,
        notes: newItemNotes.trim() || undefined,
      };
      setItems([...items, newItem]);
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemNotes('');
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const saveChanges = () => {
    if (!listName.trim()) {
      Alert.alert('Erreur', 'Le nom de la liste ne peut pas être vide');
      return;
    }

    updateListMutation.mutate({
      name: listName.trim(),
      items: JSON.stringify(items),
    });
  };

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

  return (
    <ScrollView style={{ flex: 1 }}>
      <Container>
        <Stack gap="xl">
          {/* List Name Edit */}
          <View style={{ paddingVertical: 16 }}>
            <Text size="lg" weight="semibold" style={{ marginBottom: 8 }}>
              Nom de la liste
            </Text>
            <Input
              value={listName}
              onChangeText={setListName}
              placeholder="Nom de la liste"
              size="lg"
            />
          </View>

          {/* Add New Item */}
          <View style={{ paddingVertical: 16 }}>
            <Text size="lg" weight="semibold" style={{ marginBottom: 16 }}>
              Ajouter un article
            </Text>
            <Stack gap="md">
              <Input
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder="Nom de l'article"
                size="base"
              />
              <Input
                value={newItemQuantity}
                onChangeText={setNewItemQuantity}
                placeholder="Quantité (optionnel)"
                size="base"
              />
              <Input
                value={newItemNotes}
                onChangeText={setNewItemNotes}
                placeholder="Notes (optionnel)"
                size="base"
              />
              <Btn
                onPress={addItem}
                disabled={!newItemName.trim()}
                size="base"
                variant="primary">
                Ajouter l'article
              </Btn>
            </Stack>
          </View>

          {/* Current Items */}
          <View style={{ paddingVertical: 16 }}>
            <Text size="lg" weight="semibold" style={{ marginBottom: 16 }}>
              Articles actuels ({items.length})
            </Text>
            
            {items.length > 0 ? (
              <Stack gap="md">
                {items.map((item, index) => (
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
                    }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <TouchableOpacity
                            onPress={() => {
                              const updatedItems = [...items];
                              updatedItems[index] = { ...item, completed: !item.completed };
                              setItems(updatedItems);
                            }}
                            style={{
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
                          </TouchableOpacity>
                          <Text 
                            size="base" 
                            weight="medium"
                            style={{ 
                              textDecorationLine: item.completed ? 'line-through' : 'none',
                              opacity: item.completed ? 0.6 : 1,
                            }}>
                            {item.name}
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
                      <Btn
                        onPress={() => removeItem(index)}
                        size="sm"
                        variant="secondary"
                        style={{ marginLeft: 8 }}>
                        Supprimer
                      </Btn>
                    </View>
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

          {/* Save Button */}
          <View style={{ paddingVertical: 16 }}>
            <Btn
              onPress={saveChanges}
              disabled={updateListMutation.isPending}
              size="lg"
              variant="primary"
              style={{ width: '100%' }}>
              {updateListMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </Btn>
          </View>
        </Stack>
      </Container>
    </ScrollView>
  );
}