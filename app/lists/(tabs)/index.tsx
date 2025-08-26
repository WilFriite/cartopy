import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';
import { Alert, FlatList, ScrollView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native-unistyles';
import { Button, ButtonIcon, ButtonText } from '~/components/ui/btn';
import { Card } from '~/components/ui/card';

import { Container } from '~/components/ui/container';
import { HStack, VStack } from '~/components/ui/stack';
import { SwipeableView } from '~/components/ui/swipeable-view';
import { Text } from '~/components/ui/typography';
import { lists, ListSelectType } from '~/db/schema';
import { useDrizzle } from '~/hooks/use-drizzle';
import { formatListItems } from '~/utils/format';
import { Link, router } from 'expo-router';
import { Eye, PlusCircle, Trash, Clock } from 'lucide-react-native';
import { eq } from 'drizzle-orm';
import { useMutation } from '@tanstack/react-query';

export default function DisplayListsPage() {
  const db = useDrizzle();
  const { data } = useLiveQuery(db.select().from(lists));

  const deleteListMutation = useMutation({
    mutationFn: async (id: number) => {
      return db.delete(lists).where(eq(lists.id, id)).run();
    },
    onSuccess: () => {
      Alert.alert('Succès', 'Liste supprimée avec succès');
      router.replace('/lists');
    },
    onError: (error) => {
      Alert.alert('Erreur', 'Erreur lors de la suppression de la liste');
      console.error('Delete list error:', error);
    },
  });

  const handleDeleteList = (list: ListSelectType) => {
    Alert.alert(
      `Supprimer la liste "${list.name}"`,
      'Cette action est irréversible. Êtes-vous sûr de vouloir supprimer la liste ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteListMutation.mutate(list.id),
        },
      ]
    );
  };

  const renderItem = useCallback((item: ListSelectType) => {
    const isTemporary = item.isTemporary;

    return (
      <SwipeableView
        style={[styles.swipeable, isTemporary && styles.temporarySwipeable]}
        hiddenPan={
          <View>
            <HStack style={styles.buttonGroup} gap="none">
              <Button
                action="destructive"
                style={styles.buttonItem}
                onPress={() => handleDeleteList(item)}>
                <ButtonIcon as={Trash} />
              </Button>
              <Link
                href={{
                  pathname: '/lists/[id]',
                  params: {
                    id: item.id.toString(),
                  },
                }}
                asChild>
                <Button style={styles.buttonItem}>
                  <ButtonIcon as={Eye} />
                </Button>
              </Link>
            </HStack>
          </View>
        }>
        <Card padding="lg" style={[styles.card, isTemporary && styles.temporaryCard]}>
          <Card.Header>
            <HStack gap="sm" align="center" justify="between">
              <Card.Title>{item.name}</Card.Title>
              {isTemporary && (
                <HStack gap="sm" align="center" style={styles.temporaryBadge}>
                  <Clock size={14} color="#6366F1" />
                  <Text size="sm" color="primary" weight="medium">
                    Temporaire
                  </Text>
                </HStack>
              )}
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap="sm">
              <Text>{formatListItems(item.items)?.length} items</Text>
              {isTemporary && (
                <Text size="sm" color="muted">
                  Tous les articles doivent être pris avant de terminer la session
                </Text>
              )}
            </VStack>
          </Card.Body>
        </Card>
      </SwipeableView>
    );
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Container>
        <Text size="xl" align="center">
          Mes Listes
        </Text>
        {data.length > 0 ? (
          <ScrollView style={{ flex: 1, height: '100%' }}>
            <FlatList
              data={data}
              numColumns={1}
              scrollEnabled={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderItem(item)}
            />
          </ScrollView>
        ) : (
          <View style={styles.emptyList}>
            <Text size="lg">Aucune liste n&apos;existe pour le moment. 😕</Text>
            <Link href="/lists/create" asChild>
              <Button>
                <ButtonIcon as={PlusCircle} />
                <ButtonText>Ajouter une liste</ButtonText>
              </Button>
            </Link>
          </View>
        )}
      </Container>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create((theme) => ({
  swipeable: {
    borderRadius: theme.borderRadius.xl,
    marginVertical: theme.spacing.md,
    shadowColor: theme.shadows.hard[1],
    shadowOffset: {
      height: 2,
      width: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  temporarySwipeable: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.azureRadiance,
  },
  buttonGroup: {
    width: '100%',
    height: '100%',
  },
  buttonItem: {
    width: '50%',
    height: '100%',
    borderRadius: 0,
  },
  card: {
    marginVertical: 0,
    borderRadius: theme.borderRadius.none,
  },
  temporaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.azureRadiance,
  },
  temporaryBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.azureRadiance,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
}));
